import initialApp from '../../src/initialApp'
import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import {getTemplateForm, getForm, setForm, addForm, deleteForm} from '../../src/gql/form'
import organizationStyle from '../../src/styleMUI/form/form'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import { useRouter } from 'next/router'
import FormControl from '@material-ui/core/FormControl';
import Router from 'next/router'
import * as snackbarActions from '../../redux/actions/snackbar'
import TextField from '@material-ui/core/TextField';
import Confirmation from '../../components/dialog/Confirmation'
import { urlMain } from '../../redux/constants/other'
import { getClientGqlSsr } from '../../src/getClientGQL'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import Radio from '@material-ui/core/Radio';
import FormGroup from '@material-ui/core/FormGroup';
import Checkbox from '@material-ui/core/Checkbox';
import RadioGroup from '@material-ui/core/RadioGroup';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { getClients } from '../../src/gql/client'
import CircularProgress from '@material-ui/core/CircularProgress';
import { pdDatePicker } from '../../src/lib'
import Geo from '../../components/dialog/Geo'

const Form = React.memo((props) => {
    const { profile } = props.user;
    const classes = organizationStyle();
    const { data } = props;
    const { isMobileApp } = props.app;
    const { showSnackBar } = props.snackbarActions;
    let [client, setClient] = useState(data.form?data.form.client:undefined);
    let [questions, setQuestions] = useState(data.form?data.form.questions:data.templateForm.questions.map(element=>{return {obligatory: element.obligatory, formType: element.formType, question: element.question, answers: element.answers, answer: [], file: undefined}}));
    const { setMiniDialog, showMiniDialog, setFullDialog, showFullDialog } = props.mini_dialogActions;
    const router = useRouter()
    const [clients, setClients] = useState([]);
    const [inputValue, setInputValue] = React.useState('');
    let [searchTimeOut, setSearchTimeOut] = useState(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const edit = router.query.id==='new'||data.templateForm.edit
    useEffect(() => {
        (async()=>{
            if (inputValue.length<3) {
                setClients([]);
                if(open)
                    setOpen(false)
                if(loading)
                    setLoading(false)
            }
            else {
                if(!loading)
                    setLoading(true)
                if(searchTimeOut)
                    clearTimeout(searchTimeOut)
                searchTimeOut = setTimeout(async()=>{
                    setClients((await getClients({search: inputValue, sort: '-name', filter: 'all'})).clients)
                    if(!open)
                        setOpen(true)
                    setLoading(false)
                }, 500)
                setSearchTimeOut(searchTimeOut)
            }
        })()
    }, [inputValue]);
    const handleChange = event => {
        setInputValue(event.target.value);
    };
    let handleClient =  (client) => {
        setClient(client)
        setOpen(false)
    };
    let imageRef = useRef(null);
    const [imageIdx, setImageIdx] = useState(0);
    let handleChangeImage = ((event) => {
        if(event.target.files[0].size/1024/1024<50){
            questions[imageIdx].file = event.target.files[0]
            setQuestions([...questions])
        } else {
            showSnackBar('Файл слишком большой')
        }
    })
    return (
        <App pageName={data.templateForm.title}>
            <Head>
                <title>{data.templateForm.title}</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                {
                    data.templateForm!==null?
                        ['суперорганизация', 'организация', 'admin', 'менеджер', 'client', 'агент'].includes(profile.role)?
                            <>
                            {router.query.id==='new'&&profile.role!=='client'?
                                <>
                                <Autocomplete
                                    onClose={()=>setOpen(false)}
                                    open={open}
                                    disableOpenOnFocus
                                    className={classes.input}
                                    options={clients}
                                    getOptionLabel={option => `${option.name}${option.address&&option.address[0]?` (${option.address[0][2]?`${option.address[0][2]}, `:''}${option.address[0][0]})`:''}`}
                                    onChange={(event, newValue) => {
                                        handleClient(newValue)
                                    }}
                                    noOptionsText='Ничего не найдено'
                                    renderInput={params => (
                                        <TextField {...params} label='Выберите клиента' variant='outlined' fullWidth
                                                   onChange={handleChange}
                                                   InputProps={{
                                                       ...params.InputProps,
                                                       endAdornment: (
                                                           <React.Fragment>
                                                               {loading ? <CircularProgress color="inherit" size={20} /> : null}
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
                                router.query.id!=='new'?
                                    <>
                                    <a href={`/client/${client._id}`} target='_blank'>
                                        <div className={classes.value}>{`${client.name}${client.address&&client.address[0]?` (${client.address[0][2]?`${client.address[0][2]}, `:''}${client.address[0][0]})`:''}`}</div>
                                    </a>
                                    <br/>
                                    </>
                                    :
                                    null
                            }
                            {
                                questions.map((element, idx)=>
                                    <div key={`question${idx}`} className={classes.question}>
                                        {
                                            element.formType==='текст'?
                                                <TextField
                                                    error={!element.answer[0]||!element.answer[0].length}
                                                    label={`${element.question}${element.obligatory?'*':''}`}
                                                    value={element.answer[0]}
                                                    className={classes.input}
                                                    onChange={(event)=>{
                                                        if(edit) {
                                                            questions[idx].answer[0] = event.target.value
                                                            setQuestions([...questions])
                                                        }
                                                    }}
                                                    inputProps={{
                                                        'aria-label': 'description',
                                                    }}
                                                />
                                                :
                                                element.formType==='один из списка'?
                                                    <FormControl error={!element.answer[0]} component='fieldset'>
                                                        <FormLabel component='legend'>{`${element.question}${element.obligatory?'*':''}`}</FormLabel>
                                                        <RadioGroup aria-label='gender' name='gender1' value={questions[idx].answer[0]} onChange={(event)=>{
                                                            if(edit) {
                                                                questions[idx].answer[0] = event.target.value
                                                                setQuestions([...questions])
                                                            }
                                                        }}>
                                                            {
                                                                element.answers.map((element1, idx1)=>
                                                                    <FormControlLabel key={`${element.question}${idx1}`} value={element1} control={<Radio color='primary'/>} label={element1} />
                                                                )
                                                            }
                                                        </RadioGroup>
                                                    </FormControl>
                                                    :
                                                    element.formType==='несколько из списка'?
                                                        <FormControl error={!element.answer.length} component='fieldset' className={classes.formControl}>
                                                            <FormLabel component='legend'>{`${element.question}${element.obligatory?'*':''}`}</FormLabel>
                                                            <FormGroup>
                                                                {
                                                                    element.answers.map((element1, idx1)=>
                                                                        <FormControlLabel key={`${element.question}${idx1}`}
                                                                            control={<Checkbox
                                                                                color='primary'
                                                                                checked={questions[idx].answer.includes(element1)}  onChange={()=>{
                                                                                if(edit) {
                                                                                    let index = questions[idx].answer.indexOf(element1)
                                                                                    if (index !== -1)
                                                                                        questions[idx].answer.splice(index, 1)
                                                                                    else questions[idx].answer.push(element1)
                                                                                    setQuestions([...questions])
                                                                                }
                                                                            }} name={element1} />}
                                                                            label={element1}
                                                                        />
                                                                    )
                                                                }
                                                            </FormGroup>
                                                        </FormControl>
                                                        :
                                                        element.formType==='дата'?
                                                            <TextField
                                                                error={!element.answer[0]||!element.answer[0].length}
                                                                className={classes.input}
                                                                label={`${element.question}${element.obligatory?'*':''}`}
                                                                type='date'
                                                                InputLabelProps={{
                                                                    shrink: true,
                                                                }}
                                                                value={pdDatePicker(element.answer[0])}
                                                                inputProps={{
                                                                    'aria-label': 'description',
                                                                }}
                                                                onChange={(event)=>{
                                                                    if(edit) {
                                                                        questions[idx].answer[0] = event.target.value.toString()
                                                                        setQuestions([...questions])
                                                                    }
                                                                }}
                                                            />
                                                            :
                                                            element.formType==='изображение'?
                                                                <div className={classes.row}>
                                                                    {edit?
                                                                        <Button
                                                                            color={questions[idx].file ? 'primary' : 'secondary'}
                                                                            onClick={async () => {
                                                                                setImageIdx(idx)
                                                                                imageRef.current.click()
                                                                            }} size='small'>
                                                                            {`Загрузить ${`${element.question}${element.obligatory?'*':''}`}`}
                                                                        </Button>
                                                                        :
                                                                        null
                                                                    }
                                                                    {
                                                                        questions[idx].answer[0]&&questions[idx].answer[0].length?
                                                                            <Button color='primary' onClick={async()=>{
                                                                                window.open(questions[idx].answer[0], '_blank');
                                                                            }} size='small'>
                                                                                {`Скачать ${element.question}`}
                                                                            </Button>
                                                                            :
                                                                            null
                                                                    }
                                                                </div>
                                                                :
                                                                element.formType==='геолокация'?
                                                                    <Button
                                                                        color={questions[idx].answer[0] ? 'primary' : 'secondary'}
                                                                        onClick={()=>{
                                                                            setFullDialog('Геолокация', <Geo change={edit} geo={questions[idx].answer[0]} setAddressGeo={(geo)=>{
                                                                                questions[idx].answer[0] = geo
                                                                                setQuestions([...questions])
                                                                            }}/>)
                                                                            showFullDialog(true)
                                                                        }} size='small'>
                                                                        {`${element.question}${element.obligatory?'*':''}`}
                                                                    </Button>
                                                                    :
                                                                    null
                                        }
                                    </div>
                                )
                            }
                            <br/>
                            <div className={isMobileApp?classes.bottomRouteM:classes.bottomRouteD}>
                                {
                                    router.query.id==='new'?
                                        <Button onClick={async()=>{
                                            let check = profile.client||client
                                            if(check) {
                                                for (let i = 0; i < questions.length; i++) {
                                                    if(questions[i].obligatory&&(!questions[i].answer.length||!questions[i].answer[0].length)&&!questions[i].file)
                                                        check = false
                                                }
                                            }
                                            if(check){
                                                const action = async() => {
                                                    await addForm({
                                                        templateForm: router.query.templateform,
                                                        client: profile.client?profile.client:client._id,
                                                        questions
                                                    })
                                                    Router.push(`/forms/${router.query.templateform}`)
                                                }
                                                setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                                showMiniDialog(true)
                                            } else {
                                                showSnackBar('Заполните все поля')
                                            }
                                        }} size='small' color='primary'>
                                            Сохранить
                                        </Button>
                                        :
                                        <>
                                        {
                                            edit?
                                                <Button onClick={async()=>{
                                                    let check = true
                                                    for (let i = 0; i < questions.length; i++) {
                                                        if(questions[i].obligatory&&(!questions[i].answer.length||!questions[i].answer[0].length))
                                                            check = false
                                                    }
                                                    if(check) {
                                                        const action = async() => {
                                                            await setForm({_id: router.query.id, questions: questions.map(question=>{return {obligatory: question.obligatory, formType: question.formType, question: question.question,  answer: question.answer,  answers: question.answers, file: question.file}})})
                                                        }
                                                        setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                                        showMiniDialog(true)
                                                    } else {
                                                        showSnackBar('Заполните все поля')
                                                    }
                                                }} size='small' color='primary'>
                                                    Сохранить
                                                </Button>
                                                :
                                                null
                                        }
                                        <Button onClick={async()=>{
                                            const action = async() => {
                                                await deleteForm([router.query.id])
                                                Router.push(`/forms/${router.query.templateform}`)
                                            }
                                            setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                            showMiniDialog(true)
                                        }} size='small' color='secondary'>
                                            Удалить
                                        </Button>
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
                ref={imageRef}
                type='file'
                onChange={handleChangeImage}
            />
        </App>
    )
})

Form.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['суперорганизация', 'организация', 'admin', 'менеджер', 'client', 'агент'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {
            ...await getTemplateForm({_id: ctx.query.templateform}, ctx.req?await getClientGqlSsr(ctx.req):undefined),
            ...ctx.query.id!=='new'?await getForm({_id: ctx.query.id}, ctx.req?await getClientGqlSsr(ctx.req):undefined):{}

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
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Form);