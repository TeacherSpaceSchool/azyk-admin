import initialApp from '../../src/initialApp'
import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import { getSubBrands } from '../../src/gql/subBrand'
import { getOrganizations } from '../../src/gql/organization'
import { getItem, addItem, setItem, onoffItem, deleteItem } from '../../src/gql/items'
import {checkInt, checkFloat, inputInt, inputFloat, maxImageSize} from '../../src/lib'
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
import Link from 'next/link';
import { getClientGqlSsr } from '../../src/getClientGQL'

const withoutSubBrand = {name: 'Без подбренда', _id: null}

const Item = React.memo((props) => {
    const classes = itemStyle();
    const {data} = props;
    const router = useRouter()
    const {isMobileApp} = props.app;
    const {profile} = props.user;
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    const {showSnackBar} = props.snackbarActions;
    let [unit, setUnit] = useState(data.item?data.item.unit:'шт');
    let [name, setName] = useState(data.item?data.item.name:'');
    let [price, setPrice] = useState(data.item?data.item.price:'');
    let [city, setCity] = useState(data.item&&data.item.city?data.item.city:'');
    let [status, setStatus] = useState(data.item?data.item.status:'');
    let [hit, setHit] = useState(data.item?data.item.hit:false);
    let [latest, setLatest] = useState(data.item?data.item.latest:false);
    let [apiece, setApiece] = useState(data.item?data.item.apiece:false);
    let [packaging, setPackaging] = useState(data.item&&data.item.packaging?data.item.packaging:1);
    let [weight, setWeight] = useState(data.item&&data.item.weight?data.item.weight:0);
    let [priotiry, setPriotiry] = useState(data.item&&data.item.priotiry?data.item.priotiry:0);
    //categorys
    const defaultCategorys = ['A','B','C','D','Horeca']
    let [categorys, setCategorys] = useState(data.item?data.item.categorys:defaultCategorys);
    let handleCategorys = (async (event) => {
        setCategorys(event.target.value)
    })
    //organization
    let [organization, setOrganization] = useState(data.item?data.item.organization:profile.organization?{_id: profile.organization}:null);
    let handleOrganization =  (event) => {
        setOrganization({_id: event.target.value})
        const organization = data.organizations.find(organization => organization._id === event.target.value)
        setCity(organization?organization.cities[0]:null)
    };
    useEffect(() => {
        if(!data.item&&profile.organization) {
            organization = data.organizations.find(organization => organization._id === profile.organization)
            if(organization)
                handleOrganization({target: {value: organization._id}})
        }
    }, [])
    //subBrands
    let [subBrands, setSubBrands] = useState([withoutSubBrand]);
    let [subBrand, setSubBrand] = useState(data.item&&data.item.subBrand?data.item.subBrand:withoutSubBrand);
    let handleSubBrand =  (event) => setSubBrand({_id: event.target.value});
    useEffect(() => {(async () => {
        subBrands = [withoutSubBrand]
        if(organization)
            subBrands = [...subBrands, ...await getSubBrands({search: '', organization: organization._id})]
        setSubBrands(subBrands)
        if(router.query.id==='new')
            setSubBrand(withoutSubBrand)
    })()}, [organization])
    //image
    let [preview, setPreview] = useState(data.item?data.item.image:'/static/add.png');
    let [image, setImage] = useState(null);
    let handleChangeImage = ((event) => {
        if(event.target.files[0].size/1024/1024<maxImageSize) {
            setImage(event.target.files[0])
            setPreview(URL.createObjectURL(event.target.files[0]))
        } else showSnackBar('Файл слишком большой')
    })
    return (
        <App pageName={router.query.id==='new'?'Добавить':data.item?data.item.name:'Ничего не найдено'}>
            <Head>
                <title>{router.query.id==='new'?'Добавить':data.item?data.item.name:'Ничего не найдено'}</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={isMobileApp?classes.column:classes.row}>
                    {
                        profile.role==='admin'||(organization&&['суперорганизация', 'организация'].includes(profile.role)&&organization._id===profile.organization)?
                            data.item||router.query.id==='new'?
                                <>
                                    <div className={classes.column}>
                                        <label htmlFor='contained-button-file'>
                                            <img
                                                className={classes.media}
                                                style={preview==='/static/add.png'?{border: '1px red solid'}:null}
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
                                                                onChange={() => setHit(!hit)}
                                                                color='primary'
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
                                                                onChange={() => setLatest(!latest)}
                                                                color='primary'
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
                                                        onChange={() => setApiece(!apiece)}
                                                        color='primary'
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
                                                error={!name}
                                                value={name}
                                                className={isMobileApp?classes.inputM:classes.inputD}
                                                onChange={(event) => {setName(event.target.value)}}
                                            />
                                        </h1>
                                        <TextField
                                            label='Город'
                                            value={city}
                                            className={isMobileApp?classes.inputM:classes.inputD}
                                            inputProps={{readOnly: true}}
                                        />
                                        <div className={classes.price}>
                                            <FormControl error={!categorys.length} className={isMobileApp?classes.inputM:classes.inputD}>
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
                                                    {defaultCategorys.map((category) => (
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
                                                onChange={(event) => {
                                                    setPriotiry(inputInt(event.target.value))}
                                                }
                                            />
                                        </div>
                                        <div className={classes.price}>
                                            <TextField
                                                label='Единица измерения'
                                                value={unit}
                                                className={isMobileApp?classes.inputM:classes.inputD}
                                                onChange={(event) => {
                                                    setUnit(event.target.value)}
                                                }
                                            />
                                        </div>
                                        <div className={classes.price}>
                                            <TextField
                                                type={ isMobileApp?'number':'text'}
                                                label='Вес в килограммах'
                                                value={weight}
                                                className={isMobileApp?classes.inputM:classes.inputD}
                                                onChange={(event) => {
                                                    setWeight(inputFloat(event.target.value))}
                                                }
                                            />
                                        </div>
                                        <div className={classes.price}>
                                            <TextField
                                                type={ isMobileApp?'number':'text'}
                                                label='Упаковка'
                                                value={packaging}
                                                className={isMobileApp?classes.inputM:classes.inputD}
                                                onChange={(event) => {setPackaging(inputInt(event.target.value))}}
                                            />
                                        </div>
                                        <div className={classes.price}>
                                            <TextField
                                                type={ isMobileApp?'number':'text'}
                                                label='Цена'
                                                error={!price}
                                                value={price}
                                                className={isMobileApp?classes.inputM:classes.inputD}
                                                onChange={(event) => {
                                                    setPrice(inputFloat(event.target.value))
                                                }}
                                            />
                                        </div>
                                        {profile.role==='admin'?
                                            router.query.id==='new'?<FormControl error={!organization} className={isMobileApp?classes.inputM:classes.inputD}>
                                                <InputLabel>Организация</InputLabel>
                                                <Select value={organization&&organization._id} onChange={handleOrganization}>
                                                    {data.organizations.map((element)=>
                                                        <MenuItem key={element._id} value={element._id}>{element.name}</MenuItem>
                                                    )}
                                                </Select>
                                            </FormControl>
                                            :
                                            <TextField
                                                label='Организация'
                                                value={organization.name}
                                                className={isMobileApp?classes.inputM:classes.inputD}
                                                inputProps={{readOnly: true}}
                                            />
                                        :null}
                                        <FormControl className={isMobileApp?classes.inputM:classes.inputD}>
                                            <InputLabel>Подбренд</InputLabel>
                                            <Select value={subBrand&&subBrand._id} onChange={handleSubBrand}>
                                                {subBrands.map((element)=>
                                                    <MenuItem key={element._id} value={element._id}>{element.name}</MenuItem>
                                                )}
                                            </Select>
                                        </FormControl>
                                        <br/>
                                        <div className={classes.row}>
                                            {
                                                router.query.id==='new'?
                                                    <Button onClick={() => {
                                                        price = checkFloat(price)
                                                        packaging = checkInt(packaging)
                                                        weight = checkFloat(weight)
                                                        priotiry = checkInt(priotiry)
                                                        if(image&&categorys.length&&name&&price&&organization) {
                                                            const action = async () => {
                                                                const res = await addItem({
                                                                    hit, latest, apiece,
                                                                    price, weight, priotiry, packaging: packaging||1,
                                                                    name, categorys, image, unit, city,
                                                                    ...subBrand?{subBrand: subBrand._id}:{}, organization: organization._id
                                                                })
                                                                if(res) Router.push(`/item/${res}`)
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
                                                        <Button onClick={() => {
                                                            if(categorys.length) {
                                                                let editElement = {_id: data.item._id, subBrand: subBrand?subBrand._id:subBrand}
                                                                if(JSON.stringify(categorys)!==JSON.stringify(data.item.categorys))editElement.categorys = categorys
                                                                if(city!==data.item.city)editElement.city = city
                                                                if(name.length&&name!==data.item.name)editElement.name = name
                                                                if(packaging!==data.item.packaging&&checkInt(packaging)>0)editElement.packaging = checkInt(packaging)
                                                                if(image)editElement.image = image
                                                                if(price>0&&price!==data.item.price)editElement.price = checkFloat(price)
                                                                if(weight!==data.item.weight)editElement.weight = checkFloat(weight)
                                                                if(hit!==data.item.hit)editElement.hit = hit
                                                                if(apiece!==data.item.apiece)editElement.apiece = apiece
                                                                if(unit!==data.item.unit)editElement.unit = unit
                                                                if(latest!==data.item.latest)editElement.latest = latest
                                                                if(organization._id!==data.item.organization._id)editElement.organization = organization._id
                                                                if(priotiry!==data.item.priotiry)editElement.priotiry = checkInt(priotiry)
                                                                const action = async () => await setItem(editElement)
                                                                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                                                showMiniDialog(true)
                                                            } else {
                                                                showSnackBar('Заполните все поля')
                                                            }
                                                        }} size='small' color='primary'>
                                                            Сохранить
                                                        </Button>
                                                        <Button onClick={() => {
                                                            const action = async () => {
                                                                await onoffItem(data.item._id)
                                                                setStatus(status==='active'?'deactive':'active')
                                                            }
                                                            setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                                            showMiniDialog(true)
                                                        }} size='small' color={status==='active'?'primary':'secondary'}>
                                                            {status==='active'?'Отключить':'Включить'}
                                                        </Button>
                                                        {
                                                            profile.role==='admin'?
                                                                <Button onClick={() => {
                                                                    const action = async () => {
                                                                        await deleteItem(data.item._id)
                                                                        Router.push(`/brand/${organization._id}`)
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
    // eslint-disable-next-line no-undef
    const [item, organizations] = await Promise.all([
        ctx.query.id!=='new'?getItem(ctx.query.id, getClientGqlSsr(ctx.req)):null,
        ctx.query.id==='new'?getOrganizations({search: '', filter: ''}, getClientGqlSsr(ctx.req)):null
    ])
    return {
        data: {
            item,
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

export default connect(mapStateToProps, mapDispatchToProps)(Item);