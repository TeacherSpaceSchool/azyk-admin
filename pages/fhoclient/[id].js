import initialApp from '../../src/initialApp'
import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import {addFhoClient, deleteFhoClient, getClientsFhoClients, getFhoClient, setFhoClient} from '../../src/gql/fhoClient'
import organizationStyle from '../../src/styleMUI/merchandising/merchandising'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import {resizeImg} from '../../src/resizeImg'
import Router, { useRouter } from 'next/router'
import * as snackbarActions from '../../redux/actions/snackbar'
import TextField from '@material-ui/core/TextField';
import Confirmation from '../../components/dialog/Confirmation'
import { getClientGqlSsr } from '../../src/getClientGQL'
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { getOrganizations } from '../../src/gql/organization'
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import RemoveIcon from '@material-ui/icons/Delete';
import Lightbox from 'react-awesome-lightbox';
import * as appActions from '../../redux/actions/app'
import {checkImageInput, dayStartDefault, getClientTitle, maxImageSize, pdDDMMYYHHMM} from '../../src/lib';

const FhoClient = React.memo((props) => {
    const classes = organizationStyle();
    const router = useRouter();
    //props
    const {profile} = props.user;
    const {data} = props;
    const {isMobileApp, district} = props.app;
    const {showAppBar} = props.appActions;
    const appActions = props.appActions;
    const {showSnackBar} = props.snackbarActions;
    //state
    let [client, setClient] = useState(data.fhoClient?data.fhoClient.client:null);
    let [organization, setOrganization] = useState(data.fhoClient?data.fhoClient.organization:profile.organization?{_id: profile.organization}:null);
    const handleOrganization = (organization) => {
        setOrganization(organization)
        appActions.setOrganization(organization?organization._id:null)
        setClient(null)
    }
    let [previews, setPreviews] = useState(data.fhoClient&&(!data.fhoClient.required||!['client', 'агент'].includes(profile.role))?data.fhoClient.images:[]);
    let [uploads, setUploads] = useState([]);
    let [deletedImages, setDeletedImages] = useState(data.fhoClient&&data.fhoClient.required&&['client', 'агент'].includes(profile.role)?data.fhoClient.images:[]);
    let [showLightbox, setShowLightbox] = useState(false);
    let [lightboxImages, setLightboxImages] = useState([]);
    let [lightboxIndex, setLightboxIndex] = useState(0);
    let handleChangeImage = (event) => {
        const image = checkImageInput(event)
        if(image) {
            setUploads([image.upload, ...uploads])
            setPreviews([image.preview, ...previews])
        } else showSnackBar('Файл слишком большой')
    }
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    const [clients, setClients] = useState([]);
    const [inputValue, setInputValue] = React.useState('');
    const searchTimeOut = useRef(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
            if(inputValue.length<dayStartDefault) {
                setClients([]);
                if(open)
                    setOpen(false)
                if(loading)
                    setLoading(false)
            }
            else {
                if(!loading)
                    setLoading(true)
                if(searchTimeOut.current)
                    clearTimeout(searchTimeOut.current)
                searchTimeOut.current = setTimeout(async () => {
                    setClients(await getClientsFhoClients({
                        organization: organization._id, search: inputValue, district
                    }))
                    if(!open)
                        setOpen(true)
                    setLoading(false)
                }, 500)
            }
    }, [inputValue]);
    const handleChange = event => {
        setInputValue(event.target.value);
    };
    let handleClient =  (client) => {
        setClient(client)
        setOpen(false)
    };
    let imageRef = useRef(null);
    //render
    return (
        <App pageName='ФХО клиента' showDistrict>
            <Head>
                <title>ФХО клиента</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                {
                    router.query.id==='new'||data.fhoClient?
                        <>
                            {router.query.id==='new'&&['суперагент', 'admin'].includes(profile.role)?
                                <Autocomplete
                                    className={classes.input}
                                    options={[{name: 'AZYK.STORE', _id: 'super'}, ...data.organizations]}
                                    getOptionLabel={option => option.name}
                                    value={organization}
                                    onChange={(event, newValue) => {
                                        handleOrganization(newValue)
                                    }}
                                    noOptionsText='Ничего не найдено'
                                    renderInput={params => (
                                        <TextField error={!organization} {...params} label='Организация' fullWidth/>
                                    )}
                                />
                                :
                                null
                            }
                            {router.query.id==='new'&&profile.role!=='client'?
                                organization?<Autocomplete
                                    onClose={() =>setOpen(false)}
                                    open={open}
                                    disableOpenOnFocus
                                    className={classes.input}
                                    options={clients}
                                    getOptionLabel={option => getClientTitle(option)}
                                    onChange={(event, newValue) => {
                                        handleClient(newValue)
                                    }}
                                    noOptionsText='Ничего не найдено'
                                    renderInput={params => (
                                        <TextField error={!client} {...params} label='Выберите клиента' fullWidth
                                                   onChange={handleChange}
                                                   InputProps={{
                                                       ...params.InputProps,
                                                       endAdornment: (
                                                           <React.Fragment>
                                                               {loading ? <CircularProgress color='inherit' size={20} /> : null}
                                                               {params.InputProps.endAdornment}
                                                           </React.Fragment>
                                                       ),
                                                   }}
                                        />
                                    )}
                                />:null
                                :
                                <a href={`/client/${client._id}`} target='_blank'>
                                    <div className={classes.value}>{getClientTitle(client)}</div>
                                </a>
                            }
                            {router.query.id!=='new'?<div className={classes.box}>
                                <Typography component='legend' style={!uploads.length&&!previews.length?{color:'red'}:{}}>Фотографии</Typography>
                                <GridList className={classes.gridList} cols={isMobileApp?2.5:6.5} style={{display: 'flex'}} wrap={'wrap'}>
                                    <GridListTile onClick={() => imageRef.current.click()}>
                                        <img style={{cursor: 'pointer'}} src={'/static/add.png'}/>
                                        <GridListTileBar
                                            title={'Добавить'}
                                            classes={{
                                                root: classes.titleBar,
                                                title: classes.title,
                                            }}
                                        />
                                    </GridListTile>
                                    {previews.map((preview, idx) => (
                                        <GridListTile key={preview}>
                                            <img style={{cursor: 'pointer'}} src={preview} onClick={() => {
                                                showAppBar(false)
                                                setShowLightbox(true)
                                                setLightboxImages([...previews])
                                                setLightboxIndex(idx)
                                            }}/>
                                            <GridListTileBar
                                                title={'Удалить'}
                                                style={{cursor: 'pointer'}}
                                                classes={{
                                                    root: classes.titleBar,
                                                    title: classes.title,
                                                }}
                                                onClick={() => {
                                                    previews = [...previews]
                                                    previews.splice(idx, 1)
                                                    setPreviews(previews)
                                                    setDeletedImages([...deletedImages, preview])
                                                }}
                                                actionIcon={<RemoveIcon className={classes.title}/>}
                                            />
                                        </GridListTile>
                                    ))}
                                </GridList>
                            </div>:null}
                            {router.query.id!=='new'&&data.fhoClient.history.length&&['admin', 'суперорганизация', 'организация'].includes(profile.role)?<>
                                <Typography component='legend'>История</Typography>
                                <div className={classes.line}>{data.fhoClient.history.reverse().map((history, idx) =>
                                    <div key={`history${idx}`}>
                                        {pdDDMMYYHHMM(history.date)} {history.editor};&nbsp;
                                    </div>
                                )}</div>
                            </>:null}
                            <div className={isMobileApp?classes.bottomRouteM:classes.bottomRouteD}>
                                {
                                    router.query.id==='new'?
                                        <Button onClick={() => {
                                            if(client&&organization) {
                                                const action = async () => {
                                                    const res = await addFhoClient({
                                                        organization: organization._id,
                                                        client: client._id
                                                    })
                                                    if(res) Router.back()
                                                }
                                                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                                showMiniDialog(true)
                                            } else showSnackBar('Заполните все поля')
                                        }} size='small' color='primary'>
                                            Добавить
                                        </Button>
                                        :
                                        <Button onClick={() => {
                                            if(uploads.length) {
                                                const action = async () => {
                                                    await setFhoClient({_id: router.query.id, deletedImages, uploads})
                                                    if (['агент', 'client'].includes(profile.role))
                                                        router.back()
                                                }
                                                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                                showMiniDialog(true)
                                            } else showSnackBar('Заполните все поля')
                                        }} size='small' color='primary'>
                                            Сохранить
                                        </Button>
                                }
                                {
                                    router.query.id!=='new'&&['admin', 'суперорганизация', 'организация'].includes(profile.role)?
                                        <Button onClick={() => {
                                            const action = async () => {
                                                await deleteFhoClient(router.query.id)
                                                router.back()
                                            }
                                            setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                            showMiniDialog(true)
                                        }} size='small' color='secondary'>
                                            Удалить
                                        </Button>
                                        :
                                        null
                                }
                            </div>
                        </>
                        :
                        'Ничего не найдено'
                }
                </CardContent>
                </Card>
            <input
                accept='image/*'
                capture
                style={{ display: 'none' }}
                ref={imageRef}
                type='file'
                onChange={handleChangeImage}
            />
            {
                showLightbox?
                    <Lightbox
                        images={lightboxImages}
                        startIndex={lightboxIndex}
                        onClose={() => {showAppBar(true); setShowLightbox(false)}}
                     />
                    :
                    null
            }
        </App>
    )
})

FhoClient.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['admin', 'client', 'суперорганизация', 'организация', 'менеджер', 'агент', 'мерчендайзер'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    // eslint-disable-next-line no-undef
    const [fhoClient, organizations] = await Promise.all([
        ctx.query.id!=='new'?getFhoClient({_id: ctx.query.id}, getClientGqlSsr(ctx.req)):null,
        ctx.query.id==='new'?getOrganizations({search: '', filter: ''}, getClientGqlSsr(ctx.req)):null
    ])
    return {
        data: {fhoClient, organizations}
    };
};

function mapStateToProps (state) {
    return {
        user: state.user,
        app: state.app
    }
}

function mapDispatchToProps(dispatch) {
    return {
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
        snackbarActions: bindActionCreators(snackbarActions, dispatch),
        appActions: bindActionCreators(appActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(FhoClient);