import React, {useEffect, useRef, useState} from 'react';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import cardAutoStyle from '../../src/styleMUI/subbrand/cardSubbrand'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button';
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import Confirmation from '../../components/dialog/Confirmation'
import {setEquipment, deleteEquipment, addEquipment} from '../../src/gql/equipment'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import * as snackbarActions from '../../redux/actions/snackbar'
import * as appActions from '../../redux/actions/app'
import CircularProgress from '@material-ui/core/CircularProgress';
import {getClients} from '../../src/gql/client';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Lightbox from 'react-awesome-lightbox';
import HistoryAgents from '../dialog/HistoryAgents';
import History from '@material-ui/icons/History';
import {checkImageInput, getClientTitle, unawaited} from '../../src/lib';
import {resizeImg} from '../../src/resizeImg';

const models = ['USS175', 'USS374', 'USS440', 'Super FD']

const CardEquipment = React.memo((props) => {
    const classes = cardAutoStyle();
    const {element, setList, idx, agents, organization} = props;
    const {showLoad, showAppBar} = props.appActions;
    const {showSnackBar} = props.snackbarActions;
    const {isMobileApp} = props.app;
    const {profile} = props.user;
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    let [preview, setPreview] = useState(element&&element.image?element.image:'/static/add.png');
    let [showLightbox, setShowLightbox] = useState(false);
    const showImage = () => {
        showAppBar(false)
        setShowLightbox(true)
    }
    const refImageInput = useRef()
    const clickImageInput = () => refImageInput.current.click()
    const handleChangeImage = async (event) => {
        const image = checkImageInput(event)
        if(image) {
            unawaited(async () => {
                showLoad(true)
                const res = await setEquipment({
                    _id: element._id,
                    image: await resizeImg(image.upload)
                })
                if(res==='OK')
                    setPreview(image.preview)
                else
                    showSnackBar('Ошибка')
                showLoad(false)
            })
        } else showSnackBar('Файл слишком большой')
    }
    let [number, setNumber] = useState(element&&element.number?element.number:'');
    let [model, setModel] = useState(element&&element.model?element.model:'');
    let handleModel =  (event) => {
        setModel(event.target.value)
    };
    let [agent, setAgent] = useState(element&&element.agent?element.agent:null);
    let [client, setClient] = useState(element&&element.client?element.client:null);
    let [clients, setClients] = useState([]);
    const [inputValue, setInputValue] = React.useState('');
    const searchTimeOut = useRef(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if(inputValue.length < 3) {
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
                setClients(await getClients({search: inputValue, sort: '-name', filter: 'all', city: organization.cities[0]}))
                if(!open)
                    setOpen(true)
                setLoading(false)
            }, 500)
        }
    }, [inputValue]);
    const handleChange = event => setInputValue(event.target.value);
    let handleClient =  (client) => {
        setClient(client)
        setOpen(false)
    };
    return (
        <Card className={isMobileApp?classes.cardM:classes.cardD}>
            <CardContent>
                <div className={classes.line}>
                    {
                        element?
                            <img
                                onClick={showImage}
                                className={classes.mediaO}
                                src={preview}
                                alt={number}
                                loading='lazy'
                            />
                            :
                            null
                    }
                    <div style={{width: element?'calc(100% - 120px)':'100%'}}>
                        <TextField
                            error={!number}
                            label='Номер'
                            value={number}
                            className={classes.input}
                            onChange={(event) => {setNumber(event.target.value)}}
                        />
                        <br/>
                        <FormControl className={classes.input} error={!model}>
                            <InputLabel>Модель</InputLabel>
                            <Select value={model} onChange={handleModel}>
                                {models.map((element) =>
                                    <MenuItem key={element} value={element}>{element}</MenuItem>
                                )}
                            </Select>
                        </FormControl>
                    </div>
                </div>
                {
                    process.browser?
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
                                value={client}
                                noOptionsText='Ничего не найдено'
                                renderInput={params => (
                                    <TextField error={['менеджер', 'агент'].includes(profile.role)&&!client} {...params} label='Выберите клиента' variant='standard' fullWidth
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
                                profile.role!=='агент'?
                                    <>
                                        <div className={classes.line}>
                                            <Autocomplete
                                                className={classes.input}
                                                options={agents}
                                                value={agent}
                                                getOptionLabel={option => option.name}
                                                onChange={(event, newValue) => {
                                                    setAgent(newValue)
                                                }}
                                                noOptionsText='Ничего не найдено'
                                                renderInput={params => (
                                                    <TextField {...params} label='Выберите агента' variant='standard' fullWidth />
                                                )}
                                            />
                                            {element?<History style={{marginLeft: 20, fontSize: 34, color: 'rgba(0, 0, 0, 0.55)'}} onClick={() => {
                                                setMiniDialog('История агентов', <HistoryAgents agentsHistory={element.agentsHistory}/>)
                                                showMiniDialog(true)
                                            }}/>:null}

                                        </div>
                                    </>
                                    :
                                    null
                            }
                        </>
                        :
                        null
                }
            </CardContent>
            <CardActions style={{position: 'relative'}}>
                {
                    !element ?
                        <Button onClick={async () => {
                            if(number&&model&&(!['менеджер', 'агент'].includes(profile.role)||client)) {
                                const action = async () => {
                                    let equipment = {
                                        number,
                                        model,
                                        organization: organization._id
                                    }
                                    if(agent)
                                        equipment.agent = agent._id;
                                    if(client)
                                        equipment.client = client._id;
                                    const res = await addEquipment(equipment)
                                    setList(list => [res, ...list])
                                    setModel('')
                                    setAgent(null)
                                    setClient(null)
                                    setNumber('')
                                }
                                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                showMiniDialog(true)
                            } else {
                                showSnackBar('Заполните все поля')
                            }
                        }} model='small' color='primary'>
                            Добавить
                        </Button>
                        :
                        <>
                            <Button onClick={async () => {
                                let editElement = {_id: element._id}
                                if(model!==element.model)editElement.model = model
                                if(number!==element.number)editElement.number = number
                                if(!element.agent||agent&&agent._id!==element.agent._id)editElement.agent = agent&&agent._id
                                if(!element.client||client&&client._id!==element.client._id)editElement.client = client&&client._id
                                const action = async () => await setEquipment(editElement)
                                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                showMiniDialog(true)
                            }} model='small' color='primary'>
                                Сохранить
                            </Button>
                            <Button model='small' color='primary' onClick={clickImageInput}>
                                Загрузить фото
                            </Button>
                            <Button style={{position: 'absolute', right: 10}} onClick={
                                async () => {
                                    const action = async () => {
                                        await deleteEquipment(element._id)
                                        setList(list => {
                                            list.splice(idx, 1)
                                            return [...list]
                                        })

                                    }
                                    setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                    showMiniDialog(true)
                                }
                            } model='small' color='secondary'>
                                Удалить
                            </Button>
                        </>
                }
            </CardActions>
            <input
                ref={refImageInput}
                accept='image/*'
                style={{ display: 'none' }}
                type='file'
                onChange={handleChangeImage}
            />
            {
                showLightbox?
                    <Lightbox
                        images={[preview]}
                        startIndex={0}
                        onClose={() => {showAppBar(true); setShowLightbox(false)}}
                    />
                    :
                    null
            }
        </Card>
    );
})

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
        appActions: bindActionCreators(appActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CardEquipment)