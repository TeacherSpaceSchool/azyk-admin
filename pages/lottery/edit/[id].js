import initialApp from '../../../src/initialApp'
import Head from 'next/head';
import React, { useState } from 'react';
import App from '../../../layouts/App';
import { connect } from 'react-redux'
import {
    addLottery, getLottery, setLottery
} from '../../../src/gql/lottery'
import { getOrganizations } from '../../../src/gql/organization'
import itemStyle from '../../../src/styleMUI/lotterys/lottery'
import { useRouter } from 'next/router'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Router from 'next/router'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../../redux/actions/mini_dialog'
import * as snackbarActions from '../../../redux/actions/snackbar'
import TextField from '@material-ui/core/TextField';
import Confirmation from '../../../components/dialog/Confirmation'
import CardLotteryTicket from '../../../components/lotterys/CardLotteryTicket'
import { urlMain } from '../../../redux/constants/other'
import { getClientGqlSsr } from '../../../src/getClientGQL'
import { pdtDatePicker } from '../../../src/lib'
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { checkInt, inputInt } from '../../../src/lib'

const LotteryEdit = React.memo((props) => {
    const classes = itemStyle();
    const { data } = props;
    const router = useRouter()
    const { isMobileApp } = props.app;
    const { profile } = props.user;
    let [text, setText] = useState(data.lottery?data.lottery.text:'');
    let [organization, setOrganization] = useState(data.lottery?data.lottery.organization:{});
    let handleOrganization =  (event) => {
        setOrganization({_id: event.target.value, name: event.target.name})
    };
    let [date, setDate] = useState(data.lottery?pdtDatePicker(new Date(data.lottery.date)):undefined);
    let [preview, setPreview] = useState(data.lottery!==null?data.lottery.image:'');
    let [prizes, setPrizes] = useState(data.lottery!==null?data.lottery.prizes:[]);
    let [tickets, setTickets] = useState(data.lottery!==null?data.lottery.tickets:[]);
    let [photoReports, setPhotoReports] = useState(data.lottery!==null?data.lottery.photoReports:[]);
    let [screen, setScreen] = useState('setting');
    let [image, setImage] = useState(undefined);
    let handleChangeImage = ((event) => {
        if(event.target.files[0].size/1024/1024<50){
            setImage(event.target.files[0])
            setPreview(URL.createObjectURL(event.target.files[0]))
        } else {
            showSnackBar('Файл слишком большой')
        }
    })
    let handleChangeImagePrizes = ((idx, event) => {
        if(event.target.files[0].size/1024/1024<50){
            prizes[idx].image = event.target.files[0]
            prizes[idx].preview = URL.createObjectURL(event.target.files[0])
            setPrizes([...prizes])
        } else {
            showSnackBar('Файл слишком большой')
        }
    })
    let handleChangeImagePhotoReports = ((idx, event) => {
        if(event.target.files[0].size/1024/1024<50){
            photoReports[idx].image = event.target.files[0]
            photoReports[idx].preview = URL.createObjectURL(event.target.files[0])
            setPhotoReports([...photoReports])
        } else {
            showSnackBar('Файл слишком большой')
        }
    })
    let [pagination, setPagination] = useState(100);
    const checkPagination = ()=>{
        if(pagination<tickets.length){
            setPagination(pagination+100)
        }
    }
    const { setMiniDialog, showMiniDialog } = props.mini_dialogActions;
    const { showSnackBar } = props.snackbarActions;
    return (
        <App cityShow={screen==='tickets'} searchShow={screen==='tickets'} checkPagination={checkPagination}  pageName={data.lottery!==null?router.query.id==='new'?'Добавить':'Редактировать':'Ничего не найдено'}>
            <Head>
                <title>{data.lottery!==null?router.query.id==='new'?'Добавить':'Редактировать':'Ничего не найдено'}</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                    <CardContent className={isMobileApp?classes.column:classes.row}>
                        {
                            profile.role==='admin'||(['суперорганизация', 'организация'].includes(profile.role)&&organization._id===profile.organization&&router.query.id!=='new')?
                                data.lottery!==null||router.query.id==='new'?
                                    <>
                                    <div className={classes.column}>
                                        {
                                            router.query.id==='new'?
                                                null
                                                :
                                                <div style={{ justifyContent: 'center' }} className={classes.row}>
                                                    <div style={{background: screen==='setting'?'#ffb300':'#ffffff'}} onClick={()=>{setPagination(100);setScreen('setting')}} className={classes.selectType}>
                                                        Настройки
                                                    </div>
                                                    <div style={{background: screen==='tickets'?'#ffb300':'#ffffff'}} onClick={()=>{setPagination(100);setScreen('tickets')}} className={classes.selectType}>
                                                        Билеты {tickets.length}
                                                    </div>
                                                </div>
                                        }
                                        {
                                            screen==='setting'?
                                                <>
                                                <label htmlFor='contained-button-file'>
                                                        <img
                                                            className={isMobileApp?classes.mediaM:classes.mediaD}
                                                            src={preview}
                                                            alt={'Добавить'}
                                                        />
                                                                </label>
                                                <br/>
                                                {router.query.id==='new'?
                                                    <FormControl className={classes.input}>
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
                                                            className={classes.input}
                                                            inputProps={{
                                                                'aria-label': 'description',
                                                                readOnly: true,
                                                            }}
                                                        />
                                                }
                                                <br/>
                                                <TextField
                                                        className={classes.input}
                                                        label='Дата розыгрыша'
                                                        type='datetime-local'
                                                        InputLabelProps={{
                                                            shrink: true,
                                                        }}
                                                        value={date}
                                                        onChange={ event => setDate(event.target.value) }
                                                    />
                                                <br/>
                                                <TextField
                                                        multiline={true}
                                                        label='Информация'
                                                        value={text}
                                                        className={classes.input}
                                                        onChange={(event)=>{setText(event.target.value)}}
                                                        inputProps={{
                                                            'aria-label': 'description',
                                                        }}
                                                    />
                                                <br/>
                                                <ExpansionPanel>
                                                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                                                            <h3>
                                                                Призы
                                                            </h3>
                                                        </ExpansionPanelSummary>
                                                        <ExpansionPanelDetails>
                                                            <div className={classes.column}>
                                                                {
                                                                    prizes.map((element, idx)=>
                                                                        <div key={`prize${idx}`} className={classes.row}>
                                                                            <label htmlFor={`prizeimage${idx}`}>
                                                                                <img
                                                                                    className={classes.mediaPrize}
                                                                                    src={element.preview}
                                                                                    alt={'Добавить'}
                                                                                />
                                                                            </label>
                                                                            <TextField
                                                                                error={!element.name}
                                                                                label='Название'
                                                                                value={element.name}
                                                                                className={classes.inputPrize}
                                                                                onChange={(event)=>{
                                                                                    prizes[idx].name = event.target.value
                                                                                    setPrizes([...prizes])
                                                                                }}
                                                                                inputProps={{
                                                                                    'aria-label': 'description',
                                                                                }}
                                                                            />
                                                                            <TextField
                                                                                error={!element.count}
                                                                                label='Количество'
                                                                                value={element.count}
                                                                                className={classes.inputPrize}
                                                                                type={ isMobileApp?'number':'text'}
                                                                                onChange={(event)=>{
                                                                                    prizes[idx].count = inputInt(event.target.value)
                                                                                    setPrizes([...prizes])
                                                                                }}
                                                                                inputProps={{
                                                                                    'aria-label': 'description',
                                                                                }}
                                                                            />
                                                                            <Button onClick={async()=>{
                                                                                prizes.splice(idx, 1)
                                                                                setPrizes([...prizes])
                                                                            }} size='small' color='secondary'>
                                                                                Удалить
                                                                            </Button>

                                                                            <input
                                                                                accept='image/*'
                                                                                style={{ display: 'none' }}
                                                                                id={`prizeimage${idx}`}
                                                                                type='file'
                                                                                onChange={(event)=>{handleChangeImagePrizes(idx, event)}}
                                                                            />
                                                                        </div>
                                                                    )
                                                                }
                                                                <Button onClick={async()=>{
                                                                    setPrizes([...prizes, {image: undefined, preview: '/static/add.png', name: '', count:  0}])
                                                                }} size='small' color='primary'>
                                                                    Добавить
                                                                </Button>
                                                            </div>
                                                        </ExpansionPanelDetails>
                                                    </ExpansionPanel>
                                                {
                                                    router.query.id==='new'?
                                                        null
                                                        :
                                                        <>
                                                        <br/>
                                                        <ExpansionPanel>
                                                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                                                                <h3>
                                                                    Фотоотчет
                                                                </h3>
                                                            </ExpansionPanelSummary>
                                                            <ExpansionPanelDetails>
                                                                <div className={classes.column}>
                                                                    <div className={classes.row}>
                                                                        {
                                                                            photoReports.map((element, idx)=>
                                                                                <div key={`photoreports${idx}`} className={classes.row}>
                                                                                    <label htmlFor={`photoreportsimage${idx}`}>
                                                                                        <img
                                                                                            className={classes.mediaPrize}
                                                                                            src={element.preview}
                                                                                            alt={'Добавить'}
                                                                                        />
                                                                                    </label>
                                                                                    <TextField
                                                                                        error={!element.text}
                                                                                        label='Информация'
                                                                                        value={element.text}
                                                                                        className={classes.inputPhotoReports}
                                                                                        onChange={(event)=>{
                                                                                            photoReports[idx].text = event.target.value
                                                                                            setPhotoReports([...photoReports])
                                                                                        }}
                                                                                        inputProps={{
                                                                                            'aria-label': 'description',
                                                                                        }}
                                                                                    />
                                                                                    <Button onClick={async()=>{
                                                                                        photoReports.splice(idx, 1)
                                                                                        setPhotoReports([...photoReports])
                                                                                    }} size='small' color='secondary'>
                                                                                        Удалить
                                                                                    </Button>

                                                                                    <input
                                                                                        accept='image/*'
                                                                                        style={{ display: 'none' }}
                                                                                        id={`photoreportsimage${idx}`}
                                                                                        type='file'
                                                                                        onChange={(event)=>{handleChangeImagePhotoReports(idx, event)}}
                                                                                    />
                                                                                </div>
                                                                            )
                                                                        }
                                                                    </div>
                                                                    <Button onClick={async()=>{
                                                                        setPhotoReports([...photoReports, {image: undefined, preview: '/static/add.png', text: ''}])
                                                                    }} size='small' color='primary'>
                                                                        Добавить
                                                                    </Button>
                                                                </div>
                                                            </ExpansionPanelDetails>
                                                        </ExpansionPanel>
                                                        </>
                                                }
                                                </>
                                                :
                                                <>
                                                <div className={classes.row}>
                                                    {
                                                        data.lottery.status!=='разыграна'?
                                                            <CardLotteryTicket setList={setTickets} list={tickets} lottery={router.query.id}/>
                                                            :
                                                            null
                                                    }
                                                    {tickets?tickets.map((element, idx)=> {
                                                        if(idx<pagination)
                                                            return(
                                                                <CardLotteryTicket key={`ticket${idx}`} element={element} setList={setTickets} list={tickets} idx={idx} lottery={router.query.id}/>
                                                            )}
                                                    ):null}
                                                </div>
                                                </>
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
                style={{ display: 'none' }}
                id='contained-button-file'
                type='file'
                onChange={handleChangeImage}
            />
            <div className={isMobileApp?classes.bottomRouteM:classes.bottomRouteD}>
                {
                    router.query.id==='new'?
                        <Button onClick={async()=>{
                            if (text.length>0&&organization._id!=undefined) {
                                const action = async() => {
                                    let _prizes = []
                                    for(let i=0; i<prizes.length; i++) {
                                        if(prizes[i].image&&prizes[i].count&&prizes[i].name.length)
                                            _prizes.push({image: prizes[i].image, count: checkInt(prizes[i].count), name: prizes[i].name})
                                    }
                                    await addLottery({
                                        image: image,
                                        organization: organization._id,
                                        text: text,
                                        date: date,
                                        prizes: _prizes
                                    })
                                    Router.push('/lotterys')
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
                            let editElement = {_id: data.lottery._id, date: date}
                            if(text.length>0&&text!==data.lottery.text)editElement.text = text
                            if(image!==undefined)editElement.image = image
                            let _prizes = []
                            for(let i=0; i<prizes.length; i++) {
                                if((prizes[i].image||prizes[i]._id)&&prizes[i].count&&prizes[i].name.length)
                                    _prizes.push({_id: prizes[i]._id, image: prizes[i].image, count: checkInt(prizes[i].count), name: prizes[i].name})
                            }
                            editElement.prizes = _prizes
                            let _photoReports = []
                            for(let i=0; i<photoReports.length; i++) {
                                if((photoReports[i].image||photoReports[i]._id)&&photoReports[i].text.length)
                                    _photoReports.push({_id: photoReports[i]._id, image: photoReports[i].image, text: photoReports[i].text})
                            }
                            editElement.photoReports = _photoReports
                            if(data.lottery.status!=='разыграна')
                                editElement.tickets = tickets.map(ticket=>{return {client: ticket.client._id, number: ticket.number}})
                            const action = async() => {
                                await setLottery(editElement)
                                Router.push(`/lottery/${data.lottery._id}`)
                            }
                            setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                            showMiniDialog(true)
                        }} size='small' color='primary'>
                            Сохранить
                        </Button>
                        </>
                }
            </div>
        </App>
    )
})

LotteryEdit.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!ctx.store.getState().user.profile.role)
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    let lottery =ctx.query.id!=='new'?(await getLottery({_id: ctx.query.id}, ctx.req?await getClientGqlSsr(ctx.req):undefined)).lottery:{image: '/static/add.png', organization: {_id: ''}, text: '',date: new Date(), prizes: [], tickets: [], photoReports: []}
    if(lottery&&ctx.query.id!=='new') {
        for (let i = 0; i < lottery.photoReports.length; i++) {
            lottery.photoReports[i].preview = lottery.photoReports[i].image
            lottery.photoReports[i].image = undefined
        }
        for (let i = 0; i < lottery.prizes.length; i++) {
            lottery.prizes[i].preview = lottery.prizes[i].image
            lottery.prizes[i].image = undefined
        }
    }
    return {
        data: {
            lottery: lottery,
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

export default connect(mapStateToProps, mapDispatchToProps)(LotteryEdit);