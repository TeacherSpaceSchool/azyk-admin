import initialApp from '../../../src/initialApp'
import Head from 'next/head';
import React, { useState } from 'react';
import App from '../../../layouts/App';
import { connect } from 'react-redux'
import {getTemplateForm, addTemplateForm, setTemplateForm, deleteTemplateForm} from '../../../src/gql/form'
import organizationStyle from '../../../src/styleMUI/form/form'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../../redux/actions/mini_dialog'
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Remove from '@material-ui/icons/Remove';
import { useRouter } from 'next/router'
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { getOrganizations } from '../../../src/gql/organization'
import Router from 'next/router'
import * as snackbarActions from '../../../redux/actions/snackbar'
import TextField from '@material-ui/core/TextField';
import Confirmation from '../../../components/dialog/Confirmation'
import { urlMain } from '../../../redux/constants/other'
import { getClientGqlSsr } from '../../../src/getClientGQL'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Autocomplete from '@material-ui/lab/Autocomplete';
import VerticalAlignBottom from '@material-ui/icons/VerticalAlignBottom';
import VerticalAlignTop from '@material-ui/icons/VerticalAlignTop';
import Tooltip from '@material-ui/core/Tooltip';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const NewForms = React.memo((props) => {
    const { profile } = props.user;
    const classes = organizationStyle();
    const { data } = props;
    const { isMobileApp } = props.app;
    const { showSnackBar } = props.snackbarActions;
    const typesQuestion = ['текст', 'один из списка', 'несколько из списка', 'изображение', 'дата', 'геолокация']
    let [title, setTitle] = useState(data.templateForm!==null?data.templateForm.title:'');
    let [organization, setOrganization] = useState(data.templateForm?data.templateForm.organization:undefined);
    let [editorEmployment, setEditorEmployment] = useState(data.templateForm!==null?data.templateForm.editorEmployment:true);
    let [editorClient, setEditorClient] = useState(data.templateForm!==null?data.templateForm.editorClient:false);
    let [edit, setEdit] = useState(data.templateForm!==null?data.templateForm.edit:false);
    let [questions, setQuestions] = useState(data.templateForm!==null?data.templateForm.questions:[]);
    const { setMiniDialog, showMiniDialog } = props.mini_dialogActions;
    const router = useRouter()
    return (
        <App pageName={data.templateForm!==null?router.query.id==='new'?'Добавить':data.templateForm.title:'Ничего не найдено'}>
            <Head>
                <title>{data.templateForm!==null?router.query.id==='new'?'Добавить':data.templateForm.title:'Ничего не найдено'}</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                {
                    data.templateForm!==null?
                        ['admin', 'суперорганизация', 'организация'].includes(profile.role)?
                            <>
                            {router.query.id==='new'&&profile.role==='admin'?
                                <Autocomplete
                                    className={classes.input}
                                    options={data.organizations}
                                    getOptionLabel={option => option.name}
                                    value={organization}
                                    onChange={(event, newValue) => {
                                        setOrganization(newValue)
                                    }}
                                    noOptionsText='Ничего не найдено'
                                    renderInput={params => (
                                        <TextField {...params} label='Организация' fullWidth/>
                                    )}
                                />
                                :
                                router.query.id!=='new'?
                                    <TextField
                                        label='Организация'
                                        value={organization.name}
                                        className={classes.input}
                                        inputProps={{
                                            'aria-label': 'description',
                                            readOnly: true,
                                        }}
                                    />
                                    :null
                            }
                            <TextField
                                label='Название'
                                value={title}
                                className={classes.input}
                                onChange={(event)=>{setTitle(event.target.value)}}
                                inputProps={{
                                    'aria-label': 'description',
                                }}
                            />
                            <div className={classes.row}>
                                <FormControlLabel
                                    labelPlacement = 'bottom'
                                    control={
                                        <Switch
                                            checked={edit}
                                            onChange={()=>{setEdit(!edit)}}
                                            color="primary"
                                            inputProps={{ 'aria-label': 'primary checkbox' }}
                                        />
                                    }
                                    label='Редактирование'
                                />
                                <FormControlLabel
                                    labelPlacement = 'bottom'
                                    control={
                                        <Switch
                                            checked={editorEmployment}
                                            onChange={()=>{setEditorEmployment(!editorEmployment)}}
                                            color="primary"
                                            inputProps={{ 'aria-label': 'primary checkbox' }}
                                        />
                                    }
                                    label='Сотрудник'
                                />
                                <FormControlLabel
                                    labelPlacement = 'bottom'
                                    control={
                                        <Switch
                                            checked={editorClient}
                                            onChange={()=>{setEditorClient(!editorClient)}}
                                            color="primary"
                                            inputProps={{ 'aria-label': 'primary checkbox' }}
                                        />
                                    }
                                    label='Клиент'
                                />
                            </div>
                            <br/>
                            {
                                questions.map((element, idx)=>
                                    <div key={`question${idx}`} className={classes.question}>
                                        {
                                            isMobileApp?
                                                <>
                                                    <div className={classes.row}>
                                                        {
                                                            questions[idx-1]?
                                                                <Tooltip title='Вверх'>
                                                                    <IconButton
                                                                        onClick={()=>{
                                                                            let question1 = questions[idx-1]
                                                                            let question2 = questions[idx]
                                                                            questions[idx] = question1
                                                                            questions[idx - 1] = question2
                                                                            setQuestions([...questions])
                                                                        }}
                                                                        color='inherit'
                                                                    >
                                                                        <VerticalAlignTop />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                :null
                                                        }
                                                        {
                                                            questions[idx+1]?
                                                                <Tooltip title='Вниз'>
                                                                    <IconButton
                                                                        onClick={()=>{
                                                                            let question1 = questions[idx+1]
                                                                            let question2 = questions[idx]
                                                                            questions[idx] = question1
                                                                            questions[idx + 1] = question2
                                                                            setQuestions([...questions])
                                                                        }}
                                                                        color='inherit'
                                                                    >
                                                                        <VerticalAlignBottom />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                :null
                                                        }
                                                        &nbsp;&nbsp;&nbsp;&nbsp;
                                                        <FormControlLabel
                                                            labelPlacement = 'left'
                                                            control={
                                                                <Switch
                                                                    checked={element.obligatory}
                                                                    size="small"
                                                                    onChange={()=>{
                                                                        questions[idx].obligatory = !questions[idx].obligatory
                                                                        setQuestions([...questions])
                                                                    }}
                                                                    color="primary"
                                                                    inputProps={{ 'aria-label': 'primary checkbox' }}
                                                                />
                                                            }
                                                            label='Обязательно'
                                                        />
                                                    </div>
                                                    <FormControl className={classes.input}>
                                                        <InputLabel>{`Вопрос ${idx+1}`}</InputLabel>
                                                        <Input
                                                            placeholder={`Вопрос ${idx+1}`}
                                                            value={element.question}
                                                            className={classes.input}
                                                            onChange={(event)=>{
                                                                questions[idx].question = event.target.value
                                                                setQuestions([...questions])
                                                            }}
                                                            inputProps={{
                                                                'aria-label': 'description',
                                                            }}
                                                            endAdornment={
                                                                <InputAdornment position="end">
                                                                    <IconButton
                                                                        onClick={()=>{
                                                                            questions.splice(idx, 1)
                                                                            setQuestions([...questions])
                                                                        }}
                                                                        aria-label='toggle password visibility'
                                                                    >
                                                                        <Remove/>
                                                                    </IconButton>
                                                                </InputAdornment>
                                                            }
                                                        />
                                                    </FormControl>
                                                </>
                                                :
                                                <div className={classes.row}>
                                                    <FormControl className={isMobileApp?classes.input:classes.halfInput}>
                                                        <InputLabel>{`Вопрос ${idx+1}`}</InputLabel>
                                                        <Input
                                                            placeholder={`Вопрос ${idx+1}`}
                                                            value={element.question}
                                                            className={classes.input}
                                                            onChange={(event)=>{
                                                                questions[idx].question = event.target.value
                                                                setQuestions([...questions])
                                                            }}
                                                            inputProps={{
                                                                'aria-label': 'description',
                                                            }}
                                                            endAdornment={
                                                                <InputAdornment position="end">
                                                                    <IconButton
                                                                        onClick={()=>{
                                                                            questions.splice(idx, 1)
                                                                            setQuestions([...questions])
                                                                        }}
                                                                        aria-label='toggle password visibility'
                                                                    >
                                                                        <Remove/>
                                                                    </IconButton>
                                                                </InputAdornment>
                                                            }
                                                        />
                                                    </FormControl>
                                                    <FormControlLabel
                                                        labelPlacement = 'bottom'
                                                        control={
                                                            <Switch
                                                                checked={element.obligatory}
                                                                size="small"
                                                                onChange={()=>{
                                                                    questions[idx].obligatory = !questions[idx].obligatory
                                                                    setQuestions([...questions])
                                                                }}
                                                                color="primary"
                                                                inputProps={{ 'aria-label': 'primary checkbox' }}
                                                            />
                                                        }
                                                        label='Обязательно'
                                                    />
                                                    {
                                                        questions[idx-1]?
                                                            <Tooltip title='Вверх'>
                                                                <IconButton
                                                                    onClick={()=>{
                                                                        let question1 = questions[idx-1]
                                                                        let question2 = questions[idx]
                                                                        questions[idx] = question1
                                                                        questions[idx - 1] = question2
                                                                        setQuestions([...questions])
                                                                    }}
                                                                    color='inherit'
                                                                >
                                                                    <VerticalAlignTop />
                                                                </IconButton>
                                                            </Tooltip>
                                                            :null
                                                    }
                                                    {
                                                        questions[idx+1]?
                                                            <Tooltip title='Вниз'>
                                                                <IconButton
                                                                    onClick={()=>{
                                                                        let question1 = questions[idx+1]
                                                                        let question2 = questions[idx]
                                                                        questions[idx] = question1
                                                                        questions[idx + 1] = question2
                                                                        setQuestions([...questions])
                                                                    }}
                                                                    color='inherit'
                                                                >
                                                                    <VerticalAlignBottom />
                                                                </IconButton>
                                                            </Tooltip>
                                                            :null
                                                    }
                                                </div>
                                        }
                                        <FormControl className={classes.input}>
                                            <InputLabel>Тип ответа</InputLabel>
                                            <Select value={element.formType} onChange={(event)=>{
                                                questions[idx].formType = event.target.value
                                                questions[idx].answers = []
                                                setQuestions([...questions])
                                            }}>
                                                {typesQuestion.map((element)=>
                                                    <MenuItem key={element} value={element}>{element}</MenuItem>
                                                )}
                                            </Select>
                                        </FormControl>
                                        {
                                            ['один из списка', 'несколько из списка'].includes(element.formType)?
                                                <>
                                                <ExpansionPanel key={`answer${idx}`}>
                                                    <ExpansionPanelSummary
                                                        expandIcon={<ExpandMoreIcon />}
                                                    >
                                                        <div className={classes.info}>
                                                            Ответов {element.answers.length}
                                                        </div>
                                                    </ExpansionPanelSummary>
                                                    <ExpansionPanelDetails className={classes.column}>
                                                        {element.answers.map((element1, idx1)=>
                                                            <FormControl key={idx1} className={classes.input}>
                                                                <InputLabel>Ответ {idx1+1}</InputLabel>
                                                                <Input
                                                                    placeholder={`Ответ ${idx1+1}`}
                                                                    value={questions[idx].answers[idx1]}
                                                                    className={classes.input}
                                                                    onChange={(event)=>{
                                                                        questions[idx].answers[idx1] = event.target.value
                                                                        setQuestions([...questions])
                                                                    }}
                                                                    inputProps={{
                                                                        'aria-label': 'description',
                                                                    }}
                                                                    endAdornment={
                                                                        <InputAdornment position="end">
                                                                            <IconButton
                                                                                onClick={()=>{
                                                                                    questions[idx].answers.splice(idx1, 1)
                                                                                    setQuestions([...questions])
                                                                                }}
                                                                                aria-label='toggle password visibility'
                                                                            >
                                                                                <Remove/>
                                                                            </IconButton>
                                                                        </InputAdornment>
                                                                    }
                                                                />
                                                            </FormControl>
                                                        )}
                                                        <Button onClick={async()=>{
                                                            questions[idx].answers.push('')
                                                            setQuestions([...questions])
                                                        }} size='small' color='primary'>
                                                            Добавить ответ
                                                        </Button>
                                                    </ExpansionPanelDetails>
                                                </ExpansionPanel>
                                                </>
                                                :
                                                null
                                        }

                                    </div>
                                )
                            }
                            <Button onClick={async()=>{
                                setQuestions([...questions, {formType: 'текст', question: '', answers: []}])
                            }} size='small' color='primary'>
                                Добавить вопрос
                            </Button>
                            <br/>
                            <div className={isMobileApp?classes.bottomRouteM:classes.bottomRouteD}>
                                {
                                    router.query.id==='new'?
                                        <Button onClick={async()=>{
                                            if(profile.organization) organization = {_id: profile.organization}
                                            if (title.length>0&&questions.length>0&&organization) {
                                                const action = async() => {
                                                    await addTemplateForm({
                                                        title,
                                                        editorEmployment,
                                                        editorClient,
                                                        edit,
                                                        questions,
                                                        organization: organization._id!=='super'?organization._id:null,
                                                    })
                                                    Router.push('/forms')
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
                                            let editElement = {_id: data.templateForm._id, questions: questions.map(element=>{return {
                                                formType: element.formType,
                                                question: element.question,
                                                answers: element.answers,
                                                obligatory: element.obligatory
                                            }})}
                                            if(title.length>0&&title!==data.templateForm.title)editElement.title = title
                                            if(edit!==data.templateForm.edit)editElement.edit = edit
                                            if(editorClient!==data.templateForm.editorClient)editElement.editorClient = editorClient
                                            if(editorEmployment!==data.templateForm.editorEmployment)editElement.editorEmployment = editorEmployment
                                            const action = async() => {
                                                await setTemplateForm(editElement)
                                            }
                                            setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                            showMiniDialog(true)
                                        }} size='small' color='primary'>
                                            Сохранить
                                        </Button>
                                        <Button onClick={async()=>{
                                            const action = async() => {
                                                await deleteTemplateForm([data.templateForm._id], data.templateForm.organization._id)
                                                Router.push('/forms')
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
        </App>
    )
})

NewForms.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['суперорганизация', 'организация', 'admin'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {
           ...(await getOrganizations({search: '', filter: ''}, ctx.req?await getClientGqlSsr(ctx.req):undefined)),
            ...ctx.query.id!=='new'?await getTemplateForm({_id: ctx.query.id}, ctx.req?await getClientGqlSsr(ctx.req):undefined):{templateForm: {title: '', organization: undefined, editorEmployment: true, editorClient: false, edit: false, questions: []}},

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

export default connect(mapStateToProps, mapDispatchToProps)(NewForms);