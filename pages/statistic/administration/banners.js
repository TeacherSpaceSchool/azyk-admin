import initialApp from '../../../src/initialApp'
import Head from 'next/head';
import React, { useState, useRef } from 'react';
import App from '../../../layouts/App';
import { connect } from 'react-redux'
import {getBanners, setBanners} from '../../../src/gql/banners'
import organizationStyle from '../../../src/styleMUI/merchandising/merchandising'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../../redux/actions/mini_dialog'
import { useRouter } from 'next/router'
import Router from 'next/router'
import * as snackbarActions from '../../../redux/actions/snackbar'
import Confirmation from '../../../components/dialog/Confirmation'
import { getClientGqlSsr } from '../../../src/getClientGQL'
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import RemoveIcon from '@material-ui/icons/Delete';
import * as appActions from '../../../redux/actions/app'
import {checkImageInput, unawaited} from '../../../src/lib';
import {resizeImg} from '../../../src/resizeImg';

const Banners = React.memo((props) => {
    const router = useRouter();
    const classes = organizationStyle();
    const {data} = props;
    const {isMobileApp} = props.app;
    const {showSnackBar} = props.snackbarActions;
    let [previews, setPreviews] = useState(data.banners?data.banners.images:[]);
    let [uploads, setUploads] = useState([]);
    let [deletedImages, setDeletedImages] = useState([]);
    let handleChangeImage = (event) => {
        const image = checkImageInput(event)
        if(image) {
            unawaited(async () => setUploads([await resizeImg(image.upload), ...uploads]))
            setPreviews([image.preview, ...previews])
        } else showSnackBar('Файл слишком большой')
    }
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    let imageRef = useRef(null);
    return (
        <App pageName='Баннеры'>
            <Head>
                <title>Баннеры</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    {router.query.id!=='new'?<div className={classes.box}>
                        <GridList className={classes.gridList} cols={isMobileApp?2.5:6.5} style={{display: 'flex'}} wrap={'wrap'}>
                            <GridListTile>
                                <img src={'/static/add.png'}/>
                                <GridListTileBar
                                    title={'Добавить'}
                                    style={{cursor: 'pointer'}}
                                    classes={{
                                        root: classes.titleBar,
                                        title: classes.title,
                                    }}
                                    onClick={() => imageRef.current.click()}
                                />
                            </GridListTile>
                            {previews.map((preview, idx) => (
                                <GridListTile key={preview}>
                                    <img src={preview}/>
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
                    <div className={isMobileApp?classes.bottomRouteM:classes.bottomRouteD}>
                        <Button onClick={() => {
                            const action = async () => {
                                await setBanners({deletedImages, uploads})
                                router.reload()
                            }
                            setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                            showMiniDialog(true)
                        }} size='small' color='primary'>
                            Сохранить
                        </Button>
                    </div>
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
        </App>
    )
})

Banners.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(ctx.store.getState().user.profile.role!=='admin')
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {banners: await getBanners(getClientGqlSsr(ctx.req))}
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

export default connect(mapStateToProps, mapDispatchToProps)(Banners);