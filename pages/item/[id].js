import initialApp from '../../src/initialApp'
import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import { getSubBrands } from '../../src/gql/subBrand'
import { getOrganizations } from '../../src/gql/organization'
import { getItem, addItem, setItem, onoffItem, deleteItem } from '../../src/gql/items'
import {checkInt, checkFloat, inputInt, inputFloat, cities} from '../../src/lib'
import itemStyle from '../../src/styleMUI/item/item'
import { useRouter } from 'next/router'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Router from 'next/router'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import * as snackbarActions from '../../redux/actions/snackbar'
import TextField from '@material-ui/core/TextField';
import Confirmation from '../../components/dialog/Confirmation'
import Typography from '@material-ui/core/Typography';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from 'next/link';
import { getClientGqlSsr } from '../../src/getClientGQL'

const Item = React.memo((props) => {
    const classes = itemStyle();
    const { data } = props;
    const router = useRouter()
    const { isMobileApp } = props.app;
    const { profile } = props.user;
    let [unit, setUnit] = useState(data.item?data.item.unit:'');
    let [name, setName] = useState(data.item?data.item.name:'');
    let [price, setPrice] = useState(data.item?data.item.price:'');
    let [subBrand, setSubBrand] = useState(data.item&&data.item.subBrand?data.item.subBrand:{});
    let [subBrands, setSubBrands] = useState([]);
    let [city, setCity] = useState(data.item&&data.item.city?data.item.city:'Бишкек');
    let handleCity =  (event) => {
        setCity(event.target.value)
    };
    let [status, setStatus] = useState(data.item?data.item.status:'');
    let handleSubBrand =  (event) => {
        setSubBrand({_id: event.target.value, name: event.target.name})
    };
    const _categorys = ['A','B','C','D','Horeca']
    let [categorys, setCategorys] = useState(data.item?data.item.categorys:['A','B','C','D','Horeca']);
    let handleCategorys = (async (event) => {
        setCategorys(event.target.value)
    })
    let [weight, setWeight] = useState(data.item&&data.item.weight?data.item.weight:0);
    let [priotiry, setPriotiry] = useState(data.item&&data.item.priotiry?data.item.priotiry:0);
    let [organization, setOrganization] = useState(data.item!==null?data.item.organization:{});
    let handleOrganization =  (event) => {
        setOrganization({_id: event.target.value, name: event.target.name})
    };
    let [hit, setHit] = useState(data.item!==null?data.item.hit:false);
    let [latest, setLatest] = useState(data.item!==null?data.item.latest:false);
    let [apiece, setApiece] = useState(data.item!==null?data.item.apiece:false);
    let [packaging, setPackaging] = useState(data.item&&data.item.packaging?data.item.packaging:1);
    let [preview, setPreview] = useState(data.item!==null?data.item.image:'');
    let [image, setImage] = useState(undefined);
    let handleChangeImage = ((event) => {
        if(event.target.files[0].size/1024/1024<50){
            setImage(event.target.files[0])
            setPreview(URL.createObjectURL(event.target.files[0]))
        } else {
            showSnackBar('Файл слишком большой')
        }
    })
    useEffect(()=>{
        (async()=>{
            if(!organization._id&&['суперорганизация', 'организация', 'экспедитор'].includes(profile.role)){
                let organzation = data.organizations.filter(organization=>organization._id===profile.organization)
                setOrganization(organzation[0])
            }
        })()
    },[])
    useEffect(()=>{
        (async()=>{
            if(organization&&organization._id){
                setSubBrands([{name: 'Без подбренда', _id: undefined}, ...(await getSubBrands({search: '', organization: organization._id})).subBrands])
            }
        })()
    },[organization])
    const { setMiniDialog, showMiniDialog } = props.mini_dialogActions;
    const { showSnackBar } = props.snackbarActions;
    return (
        <App pageName={data.item!==null?router.query.id==='new'?'Добавить':data.item.name:'Ничего не найдено'}>
            <Head>
                <title>{data.item!==null?router.query.id==='new'?'Добавить':data.item.name:'Ничего не найдено'}</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={isMobileApp?classes.column:classes.row}>
                    {
                        profile.role==='admin'||(['суперорганизация', 'организация'].includes(profile.role)&&organization._id===profile.organization)?
                            data.item!==null||router.query.id==='new'?
                                <>
                                    <div className={classes.column}>
                                        <label htmlFor='contained-button-file'>
                                            <img
                                                className={classes.media}
                                                src={preview}
                                                alt={'Добавить'}
                                            />
                                        </label>
                                        <br/>
                                        <div className={classes.row}>
                                            {
                                                profile.role==='admin'?
                                                    <FormControlLabel
                                                        labelPlacement = 'bottom'
                                                        style={{zoom: 0.82}}
                                                        control={
                                                            <Switch
                                                                checked={hit}
                                                                onChange={()=>{setHit(!hit)}}
                                                                color="primary"
                                                                inputProps={{ 'aria-label': 'primary checkbox' }}
                                                            />
                                                        }
                                                        label='Популярное'
                                                    />
                                                    :
                                                    null
                                            }
                                            {
                                                profile.role==='admin'?
                                                    <FormControlLabel
                                                        labelPlacement = 'bottom'
                                                        style={{zoom: 0.82}}
                                                        control={
                                                            <Switch
                                                                checked={latest}
                                                                onChange={()=>{setLatest(!latest)}}
                                                                color="primary"
                                                                inputProps={{ 'aria-label': 'primary checkbox' }}
                                                            />
                                                        }
                                                        label='Новинка'
                                                    />
                                                    :
                                                    null
                                            }
                                            <FormControlLabel
                                                labelPlacement = 'bottom'
                                                style={{zoom: 0.82}}
                                                control={
                                                    <Switch
                                                        checked={apiece}
                                                        onChange={()=>{setApiece(!apiece)}}
                                                        color="primary"
                                                        inputProps={{ 'aria-label': 'primary checkbox' }}
                                                    />
                                                }
                                                label='Поштучно'
                                            />
                                        </div>
                                        <br/>
                                    </div>
                                    <div>
                                        <h1 className={classes.name}>
                                            <TextField
                                                label='Имя'
                                                value={name}
                                                className={isMobileApp?classes.inputM:classes.inputD}
                                                onChange={(event)=>{setName(event.target.value)}}
                                                inputProps={{
                                                    'aria-label': 'description',
                                                }}
                                            />
                                        </h1>
                                        <FormControl className={isMobileApp?classes.inputM:classes.inputD}>
                                            <InputLabel>Город</InputLabel>
                                            <Select value={city} onChange={handleCity}>
                                                {cities.map((element)=>
                                                    <MenuItem key={element} value={element} ola={element}>{element}</MenuItem>
                                                )}
                                            </Select>
                                        </FormControl>
                                        <div className={classes.price}>
                                            <FormControl className={isMobileApp?classes.inputM:classes.inputD} variant='outlined'>
                                                <InputLabel>Категории</InputLabel>
                                                <Select
                                                    multiple
                                                    value={categorys}
                                                    onChange={handleCategorys}
                                                    input={<Input />}
                                                    MenuProps={{
                                                        PaperProps: {
                                                            style: {
                                                                maxHeight: 226,
                                                                width: 250,
                                                            },
                                                        }
                                                    }}
                                                >
                                                    {_categorys.map((category) => (
                                                        <MenuItem key={category} value={category}>
                                                            {category}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </div>
                                        <div className={classes.price}>
                                            <TextField
                                                type={ isMobileApp?'number':'text'}
                                                label='Приоритет'
                                                value={priotiry}
                                                className={isMobileApp?classes.inputM:classes.inputD}
                                                onChange={(event)=>{
                                                    setPriotiry(inputInt(event.target.value))}
                                                }
                                                inputProps={{
                                                    'aria-label': 'description',
                                                }}
                                            />
                                        </div>
                                        <div className={classes.price}>
                                            <TextField
                                                label='Единица измерения'
                                                value={unit}
                                                className={isMobileApp?classes.inputM:classes.inputD}
                                                onChange={(event)=>{
                                                    setUnit(event.target.value)}
                                                }
                                                inputProps={{
                                                    'aria-label': 'description',
                                                }}
                                            />
                                        </div>
                                        <div className={classes.price}>
                                            <TextField
                                                type={ isMobileApp?'number':'text'}
                                                label='Вес в килограммах'
                                                value={weight}
                                                className={isMobileApp?classes.inputM:classes.inputD}
                                                onChange={(event)=>{
                                                    setWeight(inputFloat(event.target.value))}
                                                }
                                                inputProps={{
                                                    'aria-label': 'description',
                                                }}
                                            />
                                        </div>
                                        <div className={classes.price}>
                                            <TextField
                                                type={ isMobileApp?'number':'text'}
                                                label='Упаковка'
                                                value={packaging}
                                                className={isMobileApp?classes.inputM:classes.inputD}
                                                onChange={(event)=>{setPackaging(inputInt(event.target.value))}}
                                                inputProps={{
                                                    'aria-label': 'description',
                                                }}
                                            />
                                        </div>
                                        <div className={classes.price}>
                                            <TextField
                                                type={ isMobileApp?'number':'text'}
                                                label='Цена'
                                                value={price}
                                                className={isMobileApp?classes.inputM:classes.inputD}
                                                onChange={(event)=>{
                                                    setPrice(inputFloat(event.target.value))
                                                }}
                                                inputProps={{
                                                    'aria-label': 'description',
                                                }}
                                            />
                                        </div>
                                        {profile.role==='admin'?
                                            <FormControl className={isMobileApp?classes.inputM:classes.inputD}>
                                                <InputLabel>Организация</InputLabel>
                                                <Select value={organization._id}onChange={handleOrganization}>
                                                    {data.organizations.map((element)=>
                                                        <MenuItem key={element._id} value={element._id} ola={element.name}>{element.name}</MenuItem>
                                                    )}
                                                </Select>
                                            </FormControl>
                                            :
                                            <Input
                                                value={organization.name}
                                                className={isMobileApp?classes.inputM:classes.inputD}
                                                inputProps={{
                                                    'aria-label': 'description',
                                                    readOnly: true,
                                                }}
                                            />
                                        }
                                        <FormControl className={isMobileApp?classes.inputM:classes.inputD}>
                                            <InputLabel>Подбренд</InputLabel>
                                            <Select value={subBrand._id} onChange={handleSubBrand}>
                                                {subBrands.map((element)=>
                                                    <MenuItem key={element._id} value={element._id} ola={element.name}>{element.name}</MenuItem>
                                                )}
                                            </Select>
                                        </FormControl>
                                        <br/>
                                        <div className={classes.row}>
                                            {
                                                router.query.id==='new'?
                                                    <Button onClick={async()=>{
                                                        if (categorys.length>0&&name.length>0&&price>0&&organization._id!=undefined) {
                                                            const action = async() => {
                                                                await addItem({
                                                                    packaging: checkInt(packaging)>0?checkInt(packaging):1,
                                                                    name: name,
                                                                    categorys,
                                                                    image: image,
                                                                    price: checkFloat(price),
                                                                    subBrand: subBrand._id,
                                                                    hit: hit,
                                                                    latest: latest,
                                                                    organization: organization._id,
                                                                    weight: checkFloat(weight),
                                                                    apiece: apiece,
                                                                    unit: unit,
                                                                    city: city,
                                                                    priotiry: checkInt(priotiry)
                                                                })
                                                                await Router.push(`/brand/${organization._id}`)
                                                            }
                                                            setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                                            showMiniDialog(true)
                                                        } else {
                                                            showSnackBar('Заполните все поля')
                                                        }
                                                    }} size='small' color='primary'>
                                                        Добавить
                                                    </Button>
                                                    :
                                                    <>
                                                        <Button onClick={async()=>{
                                                            if (categorys.length>0){
                                                                let editElement = {_id: data.item._id, categorys, subBrand: subBrand?subBrand._id:subBrand}
                                                                if(city!==data.item.city)editElement.city = city
                                                                if(name.length>0&&name!==data.item.name)editElement.name = name
                                                                if(packaging!==data.item.packaging&&checkInt(packaging)>0)editElement.packaging = checkInt(packaging)
                                                                if(image!==undefined)editElement.image = image
                                                                if(price>0&&price!==data.item.price)editElement.price = checkFloat(price)
                                                                if(weight!==data.item.weight)editElement.weight = checkFloat(weight)
                                                                if(hit!==data.item.hit)editElement.hit = hit
                                                                if(apiece!==data.item.apiece)editElement.apiece = apiece
                                                                if(unit!==data.item.unit)editElement.unit = unit
                                                                if(latest!==data.item.latest)editElement.latest = latest
                                                                if(organization._id!==data.item.organization._id)editElement.organization = organization._id
                                                                if(priotiry!==data.item.priotiry)editElement.priotiry = checkInt(priotiry)
                                                                const action = async() => {
                                                                    await setItem(editElement)
                                                                }
                                                                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                                                showMiniDialog(true)
                                                            } else {
                                                                showSnackBar('Заполните все поля')
                                                            }
                                                        }} size='small' color='primary'>
                                                            Сохранить
                                                        </Button>
                                                        <Button onClick={async()=>{
                                                            const action = async() => {
                                                                await onoffItem([data.item._id])
                                                                setStatus(status==='active'?'deactive':'active')
                                                            }
                                                            setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                                            showMiniDialog(true)
                                                        }} size='small' color={status==='active'?'primary':'secondary'}>
                                                            {status==='active'?'Отключить':'Включить'}
                                                        </Button>
                                                        {
                                                            profile.role==='admin'?
                                                                <Button onClick={async()=>{
                                                                    const action = async() => {
                                                                        await deleteItem([data.item._id])
                                                                        await Router.push(`/brand/${organization._id}`)
                                                                    }
                                                                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                                                    showMiniDialog(true)
                                                                }} size='small' color='secondary'>
                                                                    Удалить
                                                                </Button>
                                                                :
                                                                null
                                                        }
                                                    </>
                                            }
                                        </div>

                                    </div>
                                </>
                                :
                                'Ничего не найдено'

                            :
                            data.item===null||router.query.id==='new'?
                                'Ничего не найдено'
                                :
                                <>
                                    <div className={classes.divImage}>
                                        <img
                                            className={classes.media}
                                            src={data.item.image}
                                            alt={data.item.name}
                                        />
                                    </div>
                                    <div>
                                        {
                                            isMobileApp?
                                                <br/>
                                                :
                                                null
                                        }
                                        <h1 className={classes.name}>
                                            {data.item.name}
                                        </h1>
                                        <Link href='/organization/[id]' as={`/organization/${data.item.organization._id}`}>
                                            <div className={classes.share}>
                                                {data.item.organization.name}
                                            </div>
                                        </Link>
                                        <br/>
                                        <div className={classes.row}>
                                            <div className={classes.price}>
                                                {data.item.price}&nbsp;сом
                                            </div>
                                        </div>
                                        <br/>
                                    </div>
                                </>
                    }
                </CardContent>
            </Card>
            <input
                accept='image/*'
                style={{ display: 'none' }}
                id='contained-button-file'
                type='file'
                onChange={handleChangeImage}
            />
        </App>
    )
})

Item.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!ctx.store.getState().user.profile.role)
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {
            ...ctx.query.id!=='new'?await getItem({_id: ctx.query.id}, ctx.req?await getClientGqlSsr(ctx.req):undefined):{
                item:{
                    priotiry: 0,
                    image: '/static/add.png',
                    packaging: 1,
                    name: '',
                    categorys: ['A','B','C','D','Horeca'],
                    price: 0,
                    subBrand: {_id: undefined},
                    organization: {_id: undefined},
                    hit: false,
                    latest: false
                }
            },
            ...await getOrganizations({search: '', filter: ''}, ctx.req?await getClientGqlSsr(ctx.req):undefined),
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

export default connect(mapStateToProps, mapDispatchToProps)(Item);