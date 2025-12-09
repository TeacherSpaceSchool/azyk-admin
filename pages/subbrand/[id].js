import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import { getOrganizations } from '../../src/gql/organization'
import {getSubBrand, setSubBrand, deleteSubBrand, addSubBrand, onoffSubBrand, setSubBrandForItems} from '../../src/gql/subBrand'
import { getItems } from '../../src/gql/items'
import subBrandStyle from '../../src/styleMUI/district/district'
import { useRouter } from 'next/router'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Checkbox from '@material-ui/core/Checkbox';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import * as snackbarActions from '../../redux/actions/snackbar'
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Router from 'next/router'
import { getClientGqlSsr } from '../../src/getClientGQL'
import initialApp from '../../src/initialApp'
import {checkImageInput, checkInt} from '../../src/lib';
import CardItem from '../../components/card/CardItem';
import {viewModes} from '../../src/enum';
import Confirmation from '../../components/dialog/Confirmation'

const SubBrand = React.memo((props) => {
    const classes = subBrandStyle();
    const router = useRouter()
    //ref
    const initialRender = useRef(true);
    //props
    const {data} = props;
    const {profile} = props.user;
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    const {showSnackBar} = props.snackbarActions;
    const {search, isMobileApp, city, viewMode} = props.app;
    //selectType
    let [selectType, setSelectType] = useState('Выбранные');
    //name
    let [name, setName] = useState(data.subBrand?data.subBrand.name:'');
    let handleName =  (event) => setName(event.target.value);
    //image
    let [preview, setPreview] = useState(data.subBrand?data.subBrand.image:'/static/add.png');
    let [image, setImage] = useState(null);
    let handleChangeImage = (async (event) => {
        const image = await checkImageInput(event)
        if(image) {
            setImage(image.upload)
            setPreview(image.preview)
        } else showSnackBar('Файл слишком большой')
    })
    //status
    let [status, setStatus] = useState(data.subBrand?data.subBrand.status:'active');
    //miniInfo
    let [miniInfo, setMiniInfo] = useState(data.subBrand?data.subBrand.miniInfo:'');
    let handleMiniInfo =  (event) => {
        setMiniInfo(event.target.value)
    };
    //guid
    let [guid, setGuid] = useState(data.subBrand?data.subBrand.guid:'');
    let handleGuid =  (event) => {
        setGuid(event.target.value)
    };
    //priotiry
    let [priotiry, setPriotiry] = useState(data.subBrand?data.subBrand.priotiry:0);
    //minimumOrder
    let [minimumOrder, setMinimumOrder] = useState(data.subBrand?data.subBrand.minimumOrder:0);
    //item
    const [items, setItems] = useState([])
    //count
    const unselectedCount = items.filter(item => (!item.subBrand||item.subBrand._id!==router.query.id)&&(!search||(item.name.toLowerCase()).includes(search.toLowerCase()))).length
    const selectedCount = items.filter(item => (item.subBrand&&item.subBrand._id===router.query.id)&&(!search||(item.name.toLowerCase()).includes(search.toLowerCase()))).length
    //organization
    let [organizations, setOrganizations] = useState(data.organizations);
    useEffect(() => {(async () => {
        if(initialRender.current)
            initialRender.current = false;
        else if(router.query.id==='new')
            setOrganizations(await getOrganizations({search: '', filter: '', city}))
    })()}, [city])
    let [organization, setOrganization] = useState(router.query.id==='new'||!data.subBrand?null:data.subBrand.organization||{name: 'AZYK.STORE', _id: 'super'});
    let handleOrganization =  (event) => setOrganization({_id: event.target.value});
    useEffect(() => {
        if(router.query.id==='new'&&profile.organization)
            setOrganization(organizations.find(organization=>organization._id===profile.organization))
    }, [profile])
    useEffect(() => {(async () => {
            let items = []
            if(organization)
                items = await getItems({organization: organization._id, search: ''})
            setItems(items)
    })()}, [organization])
    //товары подбренда
    let [filtredItems, setFiltredItems] = useState([]);
    const handleFiltredItems = (_id) => {
        setItems(items => {
            return items.map(item => {
                if(item._id===_id) item.subBrand = selectType === 'Выбранные' ? null : { _id: router.query.id }
                return item
            });
        })
    }
    //pagination
    const [pagination, setPagination] = useState(100);
    const checkPagination = useCallback(() => {
        if(pagination<filtredItems.length)
            setPagination(pagination => pagination+100)
    }, [pagination, filtredItems])
    useEffect(() => {
        setPagination(100)
        let filtredItems = []
        if(selectType === 'Не выбранные')
            filtredItems = items.filter(item => (!item.subBrand||item.subBrand._id !== router.query.id)&&(!search||(item.name.toLowerCase()).includes(search.toLowerCase())))
        else if(selectType === 'Выбранные')
            filtredItems = items.filter(item => (item.subBrand&&item.subBrand._id === router.query.id)&&(!search||(item.name.toLowerCase()).includes(search.toLowerCase())))
        setFiltredItems([...filtredItems])
    }, [selectType, search, items])
    //render
    return (
        <App searchShow checkPagination={checkPagination} pageName={router.query.id==='new'?'Добавить':data.subBrand?data.subBrand.name:'Ничего не найдено'}>
            <Head>
                <title>{router.query.id==='new'?'Добавить':data.subBrand?data.subBrand.name:'Ничего не найдено'}</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={isMobileApp?classes.pageM:classes.pageD}>
                {router.query.id==='new'||data.subBrand?
                    <CardContent className={classes.column}>
                        <div className={isMobileApp?classes.column:classes.row}>
                            <label htmlFor={router.query.id}>
                                <img
                                    style={preview==='/static/add.png'?{border: '1px red solid'}:null}
                                    className={classes.media}
                                    src={preview}
                                    alt={'Изменить'}
                                />
                            </label>
                            <div className={classes.column} style={isMobileApp?{}:{width: 'calc(100% - 300px)'}}>
                                {!profile.organization?
                                    router.query.id==='new'?<FormControl  inputProps={{readOnly: router.query.id!=='new'}} error={!organization} className={isMobileApp?classes.inputM:classes.inputDF}>
                                        <InputLabel>Организация</InputLabel>
                                        <Select value={organization&&organization._id} onChange={handleOrganization}>
                                            {organizations.map((element) =>
                                                <MenuItem key={element._id} value={element._id}>{element.name}</MenuItem>
                                            )}
                                        </Select>
                                    </FormControl>:<TextField
                                        style={{width: '100%'}}
                                        label='Организация'
                                        value={organization.name}
                                        className={classes.input}
                                        inputProps={{readOnly: true}}
                                    />:null}
                                <TextField
                                    label='Название'
                                    error={!name}
                                    value={name}
                                    className={classes.input}
                                    onChange={handleName}
                                />
                                <TextField
                                    multiline
                                    label='Мини описание'
                                    value={miniInfo}
                                    className={classes.input}
                                    onChange={handleMiniInfo}
                                />
                                <TextField
                                    label='GUID'
                                    value={guid}
                                    className={classes.input}
                                    onChange={handleGuid}
                                />
                                <TextField
                                    type={ isMobileApp?'number':'text'}
                                    label='Приоритет'
                                    value={priotiry}
                                    className={classes.input}
                                    onChange={(event) => {
                                        setPriotiry(checkInt(event.target.value))}
                                    }
                                />
                                <TextField
                                    type={ isMobileApp?'number':'text'}
                                    label='Минимальный заказ'
                                    value={minimumOrder}
                                    className={classes.input}
                                    onChange={(event) => {
                                        setMinimumOrder(checkInt(event.target.value))}
                                    }
                                />
                            </div>
                        </div>
                        {router.query.id!=='new'?<>
                            <br/>
                            <div style={{ justifyContent: 'center' }} className={classes.row}>
                                <div style={{background: selectType==='Не выбранные'?'#ffb300':'#ffffff'}} onClick={() => setSelectType('Не выбранные')} className={classes.selectType}>
                                    {`Не выбр. ${unselectedCount}`}
                                </div>
                                <div style={{background: selectType==='Выбранные'?'#ffb300':'#ffffff'}} onClick={() => setSelectType('Выбранные')} className={classes.selectType}>
                                    {`Выбр. ${selectedCount}`}
                                </div>
                            </div>
                            <div className={classes.listInvoices}>{filtredItems.map((item, idx) => {
                                if(idx<pagination)
                                    return <div key={item._id} style={isMobileApp ? {alignItems: 'baseline'} : {}}
                                                className={isMobileApp ? classes.column : classes.row}>
                                        <Checkbox checked={selectType==='Выбранные'}
                                                        onChange={() => handleFiltredItems(item._id)}
                                    /> <CardItem short={viewMode===viewModes.table} key={item._id} element={item}/> </div>
                            })}</div>
                        </>:null}
                        <div className={isMobileApp?classes.bottomRouteM:classes.bottomRouteD}>
                            {
                                ['admin', 'суперорганизация', 'организация'].includes(profile.role)?
                                    router.query.id==='new'?
                                        <Button onClick={() => {
                                            if(image&&name&&organization) {
                                                setImage(null)
                                                setPreview('/static/add.png')
                                                setPriotiry(0)
                                                setMinimumOrder(0)
                                                setMiniInfo('')
                                                setName('')
                                                const action = async () => {
                                                    let res = await addSubBrand({image, miniInfo, name, guid, minimumOrder, priotiry, organization: organization._id})
                                                    if(res)
                                                        Router.back()
                                                }
                                                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                                showMiniDialog(true)
                                            } else
                                                showSnackBar('Заполните все поля')
                                        }} size='small' color='primary'>
                                            Добавить
                                        </Button>
                                        :
                                        <>
                                            <Button onClick={() => {
                                                const action = async () => {
                                                    let editElement = {_id: router.query.id}
                                                    if(miniInfo !== data.subBrand.miniInfo) editElement.miniInfo = miniInfo
                                                    if(name.length && name !== data.subBrand.name) editElement.name = name
                                                    if(guid !== data.subBrand.guid) editElement.guid = guid
                                                    if(priotiry !== data.subBrand.priotiry) editElement.priotiry = priotiry
                                                    if(minimumOrder !== data.subBrand.minimumOrder) editElement.minimumOrder = minimumOrder
                                                    if(image) editElement.image = image
                                                    const unselectedItems = (items.filter(item => !item.subBrand||item.subBrand._id!==router.query.id)).map(item => item._id)
                                                    const selectedItems = (items.filter(item => item.subBrand&&item.subBrand._id===router.query.id)).map(item => item._id)
                                                    // eslint-disable-next-line no-undef
                                                    await Promise.all([
                                                        Object.keys(editElement).length>1?await setSubBrand(editElement):null,
                                                        setSubBrandForItems({subBrand: router.query.id, unselectedItems, selectedItems})
                                                    ])
                                                }
                                                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                                showMiniDialog(true)
                                            }} size='small' color='primary'>
                                                Сохранить
                                            </Button>
                                            <Button onClick={async () => {
                                                const action = async () => {
                                                    await onoffSubBrand(router.query.id)
                                                    setStatus(status==='active'?'deactive':'active')
                                                }
                                                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                                showMiniDialog(true)
                                            }} size='small' color={status==='active'?'primary':'secondary'}>
                                                {status==='active'?'Отключить':'Включить'}
                                            </Button>
                                            <Button onClick={() => {
                                                const action = async () => {
                                                    await deleteSubBrand(data.subBrand._id)
                                                    Router.push('/subbrands')
                                                }
                                                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                                showMiniDialog(true)
                                            }} size='small' color='secondary'>
                                                Удалить
                                            </Button>
                                        </>
                                    :
                                    null
                            }
                        </div>
                        <input
                            accept='image/*'
                            style={{ display: 'none' }}
                            id={router.query.id}
                            type='file'
                            onChange={handleChangeImage}
                        />
                    </CardContent>
                    :
                    <CardContent className={classes.column}>
                        Ничего не найдено
                    </CardContent>
                }
            </Card>
        </App>
    )
})

SubBrand.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['суперорганизация', 'организация', 'admin'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    // eslint-disable-next-line no-undef
    const [subBrand, organizations] = await Promise.all([
        ctx.query.id!=='new'?getSubBrand(ctx.query.id, getClientGqlSsr(ctx.req)):null,
        ctx.query.id==='new'?getOrganizations({search: '', filter: ''}, getClientGqlSsr(ctx.req)):null
    ])
    return {
        data: {
            subBrand,
            organizations
        }
    };
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
        snackbarActions: bindActionCreators(snackbarActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SubBrand);