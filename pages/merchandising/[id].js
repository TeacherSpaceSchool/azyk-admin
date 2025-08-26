import initialApp from '../../src/initialApp'
import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import {getMerchandising, addMerchandising, deleteMerchandising, checkMerchandising} from '../../src/gql/merchandising'
import { getBrands } from '../../src/gql/items'
import organizationStyle from '../../src/styleMUI/merchandising/merchandising'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import {resizeImg} from '../../src/resizeImg'
import { useRouter } from 'next/router'
import FormControl from '@material-ui/core/FormControl';
import Router from 'next/router'
import * as snackbarActions from '../../redux/actions/snackbar'
import TextField from '@material-ui/core/TextField';
import Confirmation from '../../components/dialog/Confirmation'
import Geos from '../../components/dialog/Geos'
import { getClientGqlSsr } from '../../src/getClientGQL'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Checkbox from '@material-ui/core/Checkbox';
import Slider from '@material-ui/core/Slider';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { getClients } from '../../src/gql/client'
import CircularProgress from '@material-ui/core/CircularProgress';
import Rating from '@material-ui/lab/Rating';
import Typography from '@material-ui/core/Typography';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import { getOrganizations } from '../../src/gql/organization'
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import IconButton from '@material-ui/core/IconButton';
import RemoveIcon from '@material-ui/icons/Remove';
import DeleteIcon from '@material-ui/icons/Delete';
import Lightbox from 'react-awesome-lightbox';
import * as appActions from '../../redux/actions/app'
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import {dayStartDefault, getClientTitle, maxImageSize} from '../../src/lib';

const marks = [
    {
        value: 0,
        label: '0%',
    },
    {
        value: 25,
        label: '25%',
    },
    {
        value: 50,
        label: '50%',
    },
    {
        value: 75,
        label: '75%',
    },
    {
        value: 100,
        label: '100%',
    },
];
const types = ['холодные полки', 'теплые полки'];

const Merchandising = React.memo((props) => {
    const {profile} = props.user;
    const classes = organizationStyle();
    const {data} = props;
    const {isMobileApp} = props.app;
    const {showAppBar} = props.appActions;
    const {showSnackBar} = props.snackbarActions;
    let [client, setClient] = useState(data.merchandising?data.merchandising.client:null);
    let [organization, setOrganization] = useState(data.merchandising?data.merchandising.organization:null);
    let [productAvailability, setProductAvailability] = useState(data.merchandising?data.merchandising.productAvailability:[]);
    let [productInventory, setProductInventory] = useState(data.merchandising?data.merchandising.productInventory:false);
    let [productConditions, setProductConditions] = useState(data.merchandising?data.merchandising.productConditions:0);
    let [productLocation, setProductLocation] = useState(data.merchandising?data.merchandising.productLocation:0);
    let [previews, setPreviews] = useState(data.merchandising?data.merchandising.images:[]);
    let [images, setImages] = useState([]);
    let [showLightbox, setShowLightbox] = useState(false);
    let [lightboxImages, setLightboxImages] = useState([]);
    let [lightboxIndex, setLightboxIndex] = useState(0);
    let [showItems, setShowItems] = useState(false);
    let [items, setItems] = useState([]);
    let [typeImage, setTypeImage] = useState('product');
    let [indexImage, setIndexImage] = useState(0);
    let handleChangeImage = (async (event) => {
        if(event.target.files[0].size/1024/1024<maxImageSize) {
            let image = await resizeImg(event.target.files[0])
            if(typeImage==='products') {
                setImages([image, ...images])
                setPreviews([image, ...previews])
            }
            else if(typeImage==='fhos') {
                fhos[indexImage].images = [image, ...fhos[indexImage].images]
                fhos[indexImage].previews = [image, ...fhos[indexImage].previews]
                setFhos([...fhos])
            }
        } else showSnackBar('Файл слишком большой')
    })
    let [type, setType] = useState(data.merchandising?data.merchandising.type:types[0]);
    let handleType =  (event) => {
        setType(event.target.value)
    };
    let [geo, setGeo] = useState(data.merchandising?data.merchandising.geo:null);
    const geolocationTimeOut = useRef(null);
    useEffect(() => {
        if(router.query.id === 'new') {
            if(navigator.geolocation) {
                geolocationTimeOut.current = setInterval(() => {
                    navigator.geolocation.getCurrentPosition((position) => {
                        setGeo(position.coords.latitude + ', ' + position.coords.longitude)
                    })
                }, 1000)
                return () => {
                    clearInterval(geolocationTimeOut.current)
                }
            } else {
                showSnackBar('Геолокация не поддерживается')
            }
        }
    }, [])
    useEffect(() => {
        if(profile.organization)
            setOrganization({_id: profile.organization})
    }, [])
    useEffect(() => {(async () => {
            if(router.query.id==='new')
                setProductAvailability([])
            if(organization&&organization._id&&organization._id!=='super')
                setItems(await getBrands({organization: organization._id, search: '', sort: 'name'}))
            else
                setItems([])
    })()}, [organization])
    let [fhos, setFhos] = useState(data.merchandising?data.merchandising.fhos:[]);
    let [needFho, setNeedFho] = useState(data.merchandising?data.merchandising.needFho:false);
    let [comment, setComment] = useState(data.merchandising?data.merchandising.comment:'');
    let [stateProduct, setStateProduct] = useState(data.merchandising?data.merchandising.stateProduct:0);
    let [reviewerComment, setReviewerComment] = useState(data.merchandising?data.merchandising.reviewerComment:'');
    let [reviewerScore, setReviewerScore] = useState(data.merchandising?data.merchandising.reviewerScore:0);
    const {setMiniDialog, showMiniDialog, setFullDialog, showFullDialog} = props.mini_dialogActions;
    const router = useRouter()
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
                    setClients(await getClients({search: inputValue, sort: '-name', filter: 'all'}))
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
    return (
        <App pageName='Мерчендайзинг'>
            <Head>
                <title>Мерчендайзинг</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                {
                    router.query.id==='new'||data.merchandising?
                        ['admin', 'суперагент', 'суперорганизация', 'организация', 'менеджер', 'агент', 'мерчендайзер'].includes(profile.role)?
                            <>
                                <FormControl className={classes.input}>
                                    <InputLabel>Тип полок</InputLabel>
                                    <Select
                                        inputProps={{
                                            readOnly: router.query.id!=='new',
                                        }}
                                        value={type}
                                        onChange={handleType}
                                    >
                                        {types?types.map((element) =>
                                            <MenuItem key={element} value={element}>{element}</MenuItem>
                                        ):null}
                                    </Select>
                                </FormControl>
                            {router.query.id==='new'&&['суперагент', 'admin'].includes(profile.role)?
                                <Autocomplete
                                    className={classes.input}
                                    options={[{name: 'AZYK.STORE', _id: 'super'}, ...data.organizations]}
                                    getOptionLabel={option => option.name}
                                    value={organization}
                                    onChange={(event, newValue) => {
                                        setOrganization(newValue)
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
                                <>
                                <Autocomplete
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
                                />
                                {
                                    client?
                                        <a href={`/client/${client._id}`} target='_blank'>
                                            <div className={classes.geo} style={{color: '#ffb300'}}>
                                                Посмотреть клиента
                                            </div>
                                        </a>
                                        :
                                        null
                                }
                                </>
                                :
                                <a href={`/client/${client._id}`} target='_blank'>
                                    <div className={classes.value}>{getClientTitle(client)}</div>
                                </a>
                            }
                            <div className={classes.box}>
                                <TextField
                                    multiline
                                    label='Комментарий'
                                    value={comment}
                                    className={classes.input}
                                    onChange={(event) => {if(router.query.id==='new')setComment(event.target.value)}}
                                />
                            </div>
                            <div className={classes.box}>
                                <Typography component='legend'>Состояние товара</Typography>
                                <Rating
                                    value={stateProduct}
                                    onChange={(event, newValue) => {
                                        if(router.query.id==='new')setStateProduct(newValue);
                                    }}
                                />
                            </div>
                            <div className={classes.box}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={productInventory}
                                            onChange={() => {
                                                if(router.query.id==='new')setProductInventory(!productInventory);
                                            }}
                                            color='primary'
                                        />
                                    }
                                    label='Товарный запас'
                                />
                            </div>
                            <div className={classes.box}>
                                <Typography component='legend'>Условия хранения</Typography>
                                <Rating
                                    value={productConditions}
                                    onChange={(event, newValue) => {
                                        if(router.query.id==='new')setProductConditions(newValue);
                                    }}
                                />
                            </div>
                            <div className={classes.box}>
                                <Typography component='legend'>Расположение товара</Typography>
                                <Rating
                                    value={productLocation}
                                    onChange={(event, newValue) => {
                                        if(router.query.id==='new')setProductLocation(newValue);
                                    }}
                                />
                            </div>
                            {
                                organization&&organization._id!=='super'?
                                    <div className={classes.box}>
                                        <Typography style={{cursor: 'pointer'}} onClick={() => setShowItems(!showItems)} component='legend'>{`${showItems?'🐵':'🙈'} Товар в наличие: ${productAvailability.length}/${items.length}`}</Typography>
                                        {
                                            showItems?
                                                <>
                                                <br/>
                                                <FormControl error={!productAvailability.length} component='fieldset' className={classes.formControl}>
                                                    <FormGroup>
                                                        {items.map((element) => {
                                                                if(router.query.id === 'new' || productAvailability.includes(element.name))
                                                                    return <FormControlLabel key={element._id} control={<Checkbox
                                                                        color='primary'
                                                                        checked={productAvailability.includes(element.name)}
                                                                        onChange={() => {
                                                                            if(router.query.id === 'new') {
                                                                                let index = productAvailability.indexOf(element.name)
                                                                                if(index !== -1)
                                                                                    productAvailability.splice(index, 1)
                                                                                else productAvailability.push(element.name)
                                                                                setProductAvailability([...productAvailability])
                                                                            }
                                                                        }} name={element.name}/>}
                                                                                             label={element.name}
                                                                    />
                                                            }
                                                        )
                                                        }
                                                    </FormGroup>
                                                </FormControl>
                                                </>
                                                :
                                                null
                                        }
                                    </div>
                                    :
                                    null
                            }
                                <div className={classes.box}>
                                    <Typography component='legend'>Фотографии</Typography>
                                    <GridList className={classes.gridList} cols={isMobileApp?2.5:6.5}>
                                        {router.query.id === 'new' ?
                                            <GridListTile
                                                onClick={() => {
                                                    setTypeImage('products')
                                                    imageRef.current.click()
                                                }}>
                                                <img style={{cursor: 'pointer'}} src={'/static/add.png'}/>
                                                <GridListTileBar
                                                    title={'Добавить'}
                                                    classes={{
                                                        root: classes.titleBar,
                                                        title: classes.title,
                                                    }}
                                                />
                                            </GridListTile>
                                            :
                                            null
                                        }
                                        {previews.map((preview, idx) => (
                                            <GridListTile key={preview}>
                                                <img style={{cursor: 'pointer'}} src={preview} onClick={() => {
                                                    showAppBar(false)
                                                    setShowLightbox(true)
                                                    setLightboxImages([...previews])
                                                    setLightboxIndex(idx)
                                                }}/>
                                                {router.query.id === 'new' ?
                                                    <GridListTileBar
                                                        title={'Удалить'}
                                                        style={{cursor: 'pointer'}}
                                                        onClick={() => {
                                                            previews = [...previews]
                                                            previews.splice(idx, 1)
                                                            setPreviews(previews)
                                                            images = [...images]
                                                            images.splice(idx, 1)
                                                            setImages(images)
                                                        }}
                                                        classes={{
                                                            root: classes.titleBar,
                                                            title: classes.title,
                                                        }}
                                                        actionIcon={<DeleteIcon className={classes.title}/>}
                                                    />
                                                    :
                                                    null
                                                }
                                            </GridListTile>
                                        ))}
                                    </GridList>
                                </div>
                            <div className={classes.box}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={needFho}
                                            onChange={() => {
                                                if(router.query.id==='new')setNeedFho(!needFho);
                                            }}
                                            color='primary'
                                        />
                                    }
                                    label='Нужно ФХО'
                                />
                            </div>
                            {fhos.map((fho, idx) => (
                                <div className={classes.box} key={`fhos${idx}`}>
                                    <FormControl className={classes.input}>
                                        <InputLabel color='primary'>Тип ФХО</InputLabel>
                                        <Input
                                            placeholder='Тип ФХО'
                                            value={fho.type}
                                            className={classes.input}
                                            onChange={(event) => {
                                                if(router.query.id==='new') {
                                                    fhos[idx].type = event.target.value
                                                    setFhos([...fhos])
                                                }
                                            }}
                                            endAdornment={
                                                <InputAdornment position='end'>
                                                    <IconButton
                                                        onClick={() => {
                                                            if(router.query.id==='new') {
                                                                fhos.splice(idx, 1)
                                                                setFhos([...fhos])
                                                            }
                                                        }}
                                                    >
                                                        <RemoveIcon/>
                                                    </IconButton>
                                                </InputAdornment>
                                            }
                                        />
                                    </FormControl>
                                    <br/>
                                    <Typography component='legend'>Состояние ФХО</Typography>
                                    <Rating
                                        className={classes.input}
                                        value={fho.state}
                                        onChange={(event, newValue) => {
                                            if(router.query.id==='new') {
                                                fhos[idx].state = newValue
                                                setFhos([...fhos])
                                            }
                                        }}
                                    />
                                    <Typography component='legend'>Выкладка ФХО</Typography>
                                    <Rating
                                        className={classes.input}
                                        value={fho.layout}
                                        onChange={(event, newValue) => {
                                            if(router.query.id==='new') {
                                                fhos[idx].layout = newValue
                                                setFhos([...fhos])
                                            }
                                        }}
                                    />
                                    <FormControlLabel
                                        className={classes.input}
                                        control={
                                            <Checkbox
                                                checked={fho.foreignProducts}
                                                onChange={() => {
                                                    if(router.query.id==='new') {
                                                        fhos[idx].foreignProducts = !fho.foreignProducts
                                                        setFhos([...fhos])
                                                    }
                                                }}
                                                color='primary'
                                            />
                                        }
                                        label='Чужая продукция'
                                    />
                                    <Typography component='legend'>{`Заполненность ФХО: ${fho.filling}%`}</Typography>
                                    <Slider
                                        className={classes.slider1}
                                        value={fho.filling}
                                        getAriaValueText={() =>`${fho.filling}%`}
                                        step={25}
                                        onChange={(event, newValue) => {
                                            if(router.query.id==='new') {
                                                fhos[idx].filling = newValue
                                                setFhos([...fhos])
                                            }
                                        }}
                                        marks={marks}
                                        valueLabelDisplay='auto'
                                    />
                                    <GridList className={classes.gridList} cols={isMobileApp?2.5:6.5}>
                                        {router.query.id === 'new' ?
                                            <GridListTile
                                                onClick={() => {
                                                    setTypeImage('fhos')
                                                    imageRef.current.click()
                                                }}>
                                                <img style={{cursor: 'pointer'}} src={'/static/add.png'}/>
                                                <GridListTileBar
                                                    title={'Добавить'}
                                                    classes={{
                                                        root: classes.titleBar,
                                                        title: classes.title,
                                                    }}
                                                />
                                            </GridListTile>
                                            :
                                            null
                                        }
                                        {(router.query.id === 'new'?fho.previews:fho.images).map((preview, idx1) => (
                                            <GridListTile key={preview}>
                                                <img src={preview} style={{cursor: 'pointer'}} onClick={() => {
                                                    showAppBar(false)
                                                    setShowLightbox(true)
                                                    setLightboxImages([...(router.query.id === 'new'?fho.previews:fho.images)])
                                                    setLightboxIndex(idx1)
                                                }}/>
                                                {router.query.id === 'new' ?
                                                    <GridListTileBar
                                                        title={'Удалить'}
                                                        style={{cursor: 'pointer'}}
                                                        onClick={() => {
                                                            fhos[idx].previews.splice(idx1, 1)
                                                            fhos[idx].images.splice(idx1, 1)
                                                            setFhos([...fhos])
                                                        }}
                                                        classes={{
                                                            root: classes.titleBar,
                                                            title: classes.title,
                                                        }}
                                                        actionIcon={<DeleteIcon className={classes.title}/>}
                                                    />
                                                    :
                                                    null
                                                }
                                            </GridListTile>
                                        ))}
                                    </GridList>


                                </div>
                            ))}
                            {router.query.id === 'new' ?
                                <>
                                <br/>
                                <Button variant='contained' onClick={() => {
                                    fhos = [{
                                        type: '',
                                        images: [],
                                        layout: 0,
                                        state: 0,
                                        foreignProducts: false,
                                        filling: 0,
                                        previews: [],
                                    }, ...fhos]
                                    setFhos(fhos)
                                }} size='small' color='primary'>
                                    Добавить ФХО
                                </Button>
                                </>
                                :
                                null
                            }
                            {
                                router.query.id!=='new'?
                                    <>
                                    <div className={classes.box}>
                                        <Typography component='legend'>Оценка проверяющего</Typography>
                                        <Rating
                                            value={reviewerScore}
                                            onChange={(event, newValue) => {
                                                if(!data.merchandising.check&&['admin', 'суперорганизация', 'организация', 'менеджер'].includes(profile.role))setReviewerScore(newValue);
                                            }}
                                        />
                                    </div>
                                    <div className={classes.box}>
                                        <TextField
                                            multiline
                                            label='Комментарий проверяющего'
                                            value={reviewerComment}
                                            className={classes.input}
                                            onChange={(event) => {if(!data.merchandising.check&&['admin', 'суперорганизация', 'организация', 'менеджер'].includes(profile.role))setReviewerComment(event.target.value)}}
                                        />
                                    </div>
                                    </>
                                    :
                                    null
                            }
                            <div className={isMobileApp?classes.bottomRouteM:classes.bottomRouteD}>
                                {
                                    router.query.id==='new'?
                                        <Button onClick={() => {
                                            if(client&&organization) {
                                                const action = async () => {
                                                    const res = await addMerchandising({
                                                        organization: organization._id,
                                                        client: client._id,
                                                        productAvailability,
                                                        productInventory,
                                                        productConditions,
                                                        productLocation,
                                                        images,
                                                        fhos: fhos.map((fho) => {delete fho.previews; return fho}),
                                                        needFho,
                                                        stateProduct,
                                                        type,
                                                        comment,
                                                        geo
                                                    })
                                                    if(res) Router.push(`/merchandising/${res}`)
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
                                        null
                                }
                                {
                                    router.query.id!=='new'?
                                        <>
                                        <Button onClick={() => {
                                            Router.push(`/merchandisings/${organization?organization._id:'super'}?client=${client._id}`)
                                        }} size='small' color='primary'>
                                            История
                                        </Button>
                                        {
                                            geo ?
                                                <Button onClick={() => {
                                                    setFullDialog('Карта', <Geos geos={[{geo: geo, name: 'Мерчендайзер'}, {geo: client.address[0][1], name: client.name}]}/>)
                                                    showFullDialog(true)
                                                }} size='small' color='primary'>
                                                    Карта
                                                </Button>
                                                :
                                                null
                                        }
                                        {
                                            !data.merchandising.check&&['admin', 'суперорганизация', 'организация', 'менеджер'].includes(profile.role) ?
                                                <Button onClick={() => {
                                                    const action = async () => {
                                                        await checkMerchandising({_id: router.query.id, reviewerScore, reviewerComment})
                                                        Router.back()
                                                    }
                                                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                                    showMiniDialog(true)
                                                }} size='small' color='primary'>
                                                    Принять
                                                </Button>
                                                :
                                                null
                                        }
                                        {
                                            !data.merchandising.check?
                                                <Button onClick={() => {
                                                    const action = async () => {
                                                        await deleteMerchandising(router.query.id)
                                                        Router.back()
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
                                        :
                                        null
                                }
                            </div>
                            </>
                            :
                            'Ничего не найдено'
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

Merchandising.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['admin', 'суперагент', 'суперорганизация', 'организация', 'менеджер', 'агент', 'мерчендайзер'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    // eslint-disable-next-line no-undef
    const [merchandising, organizations] = await Promise.all([
        ctx.query.id!=='new'?getMerchandising(ctx.query.id, getClientGqlSsr(ctx.req)):null,
        ctx.query.id==='new'?getOrganizations({search: '', filter: ''}, getClientGqlSsr(ctx.req)):null
    ])
    return {
        data: {
            merchandising,
            ...organizations?{organizations: [{name: 'AZYK.STORE', _id: 'super'}, ...organizations]}:{}
        }
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

export default connect(mapStateToProps, mapDispatchToProps)(Merchandising);