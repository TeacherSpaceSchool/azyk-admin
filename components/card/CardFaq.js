import React, {useState, useRef} from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActionArea from '@material-ui/core/CardActionArea';
import cardFaqStyle from '../../src/styleMUI/faq/cardFaq'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button';
import CardActions from '@material-ui/core/CardActions';
import { deleteFaq, addFaq, setFaq } from '../../src/gql/faq'
import TextField from '@material-ui/core/TextField';
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import * as snackbarActions from '../../redux/actions/snackbar'
import Confirmation from '../dialog/Confirmation'
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const CardFaq = React.memo((props) => {
    const classes = cardFaqStyle();
    const {element, setList, idx} = props;
    const {profile} = props.user;
    const {isMobileApp} = props.app;
    //addCard
    let [title, setTitle] = useState(element&&element.title?element.title:'');
    let [video, setVideo] = useState(element&&element.video?element.video:'');
    let handleTitle =  (event) => {
        setTitle(event.target.value)
    };
    let types = ['клиенты', 'сотрудники']
    let [typex, setTypex] = useState(element&&element.typex?element.typex:'клиенты');
    let handleTypex =  (event) => {
        setTypex(event.target.value)
    };
    const {setMiniDialog, showMiniDialog} = props.mini_dialogActions;
    const {showSnackBar} = props.snackbarActions;
    let faqRef = useRef(null);
    return (
          <>
          {
              profile.role === 'admin' ?
                  <Card className={isMobileApp?classes.cardM:classes.cardD}>
                      <CardContent>
                          <FormControl className={classes.input}>
                              <InputLabel>Тип</InputLabel>
                              <Select
                                  value={typex}
                                  onChange={handleTypex}
                              >
                                  {types.map((element) =>
                                      <MenuItem key={element} value={element}>{element}</MenuItem>
                                  )}
                              </Select>
                          </FormControl>
                          <br/>
                          <br/>
                          <TextField
                              label='Имя'
                              error={!title}
                              value={title}
                              className={classes.input}
                              onChange={handleTitle}
                          />
                          <br/>
                          <br/>
                          <Button size='small' color={video?'primary':'secondary'} onClick={async () => {faqRef.current.click()}}>
                              Загрузить инструкцию
                          </Button>
                      </CardContent>
                      <CardActions>
                          {
                              element?
                                  <>
                                  <Button onClick={() => {
                                      let editElement = {_id: element._id}
                                      if(title&&title!==element.title)editElement.title = title
                                      if(video!==element.video)editElement.video = video
                                      if(typex!==element.typex)editElement.typex = typex
                                      const action = async () => await setFaq(editElement)
                                      setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                      showMiniDialog(true)
                                  }} size='small' color='primary'>
                                      Сохранить
                                  </Button>
                                  <Button onClick={async () => {
                                      const action = async () => {
                                          await deleteFaq(element._id)
                                          setList(list => {
                                              list.splice(idx, 1)
                                              return [...list]
                                          })
                                      }
                                      setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                      showMiniDialog(true)
                                  }} size='small' color='secondary'>
                                      Удалить
                                  </Button>
                                  </>
                                  :
                                  <Button onClick={() => {
                                      if(title) {
                                          const action = async () => {
                                              const res = await addFaq({typex: typex, video: video, title})
                                              setList(list => [res, ...list])
                                          }
                                          setTitle('')
                                          setTypex('клиенты')
                                          setVideo('')
                                          setMiniDialog('Вы уверены?', <Confirmation action={action}/>)
                                          showMiniDialog(true)
                                      } else showSnackBar('Заполните все поля')
                                  }} size='small' color='primary'>
                                      Добавить
                                  </Button>
                          }
                      </CardActions>
                  </Card>
                  :
                  element?
                      <Card className={isMobileApp?classes.cardM:classes.cardD}>
                          <CardActionArea>
                              <CardContent>
                                  <h3 className={classes.input}>
                                      {element.title}
                                  </h3>
                                  <br/>
                                  <Button onClick={() => window.open(element.video)} size='small' color='primary'>
                                      Просмотреть видео инструкцию
                                  </Button>
                              </CardContent>
                          </CardActionArea>
                      </Card>
                      :null
            }</>
    );
})

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

export default connect(mapStateToProps, mapDispatchToProps)(CardFaq)