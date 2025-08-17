import React, {useState, useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { addReturned } from '../../src/gql/returned'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import dialogContentStyle from '../../src/styleMUI/dialogContent'
import Router from 'next/router'
import Link from 'next/link';
import { addAgentHistoryGeo } from '../../src/gql/agentHistoryGeo'
import {dayStartDefault, formatAmount, getGeoDistance, unawaited} from '../../src/lib'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { getDeliveryDate } from '../../src/gql/deliveryDate';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import { pdDDMMYYYYWW } from '../../src/lib';

const ReturnedConfirmed =  React.memo(
    (props) =>{
        const {isMobileApp} = props.app;
        const {client, allPrice, organization, items, geo} = props;
        const {showMiniDialog} = props.mini_dialogActions;
        const {classes} = props;
        const unlock = useRef(true);
        const width = isMobileApp? (window.innerWidth-112) : 500
        let [info, setInfo] = useState('');
        let [inv, setInv] = useState(false);
        let handleInfo =  (event) => {
            setInfo(event.target.value)
        };
        let [dateDelivery, setDateDelivery] = useState(null);
        let handleDateDelivery =  (event) => {
            setDateDelivery(event.target.value)
        };
        let [dateDeliverys, setDateDeliverys] = useState([true, true, true, true, true, true, false]);
        let [week, setWeek] = useState([]);
        useEffect(() => {
            if(unlock.current) {
                unlock.current = false;
                (async () => {
                    const deliveryDate = await getDeliveryDate({client: client._id, organization: organization._id})
                    if(deliveryDate) {
                        dateDeliverys = deliveryDate.days
                        setDateDeliverys([...dateDeliverys])
                    }
                    for (let i = 0; i < 7; i++) {
                        let day = new Date()
                        if(day.getHours()>=dayStartDefault)
                            day.setDate(day.getDate()+1)
                        day.setDate(day.getDate()+i)
                        day.setHours(dayStartDefault, 0, 0, 0)
                        let dayWeek = day.getDay() === 0 ? 6 : (day.getDay() - 1)
                        week[dayWeek] = day
                        if(!dateDelivery&&dateDeliverys[dayWeek]) {
                            dateDelivery = day
                            setDateDelivery(dateDelivery)
                        }
                    }
                    setWeek([...week])
                })()
                unlock.current = true;
            }
        }, [])
        return (
            <div className={classes.main}>
                <div style={{width: width}} className={classes.itogo}><b>Адрес доставки: &nbsp;</b>{client.address[0][0]}</div>
                <Link href={'client/[id]'} as={`/client/${client._id}`}>
                    Изменить адрес
                </Link>
                <br/>
                <Input
                    style={{width: width}}
                    placeholder='Комментарий'
                    value={info}
                    className={isMobileApp?classes.inputM:classes.inputD}
                    onChange={handleInfo}
                />
                <br/>
                {
                    week.length?
                        <>
                        <FormControl style={{width: width}} className={isMobileApp?classes.inputM:classes.inputD}>
                            <InputLabel>День доставки</InputLabel>
                            <Select value={dateDelivery} onChange={handleDateDelivery}>
                                {week.map((element, idx) => {
                                        if(dateDeliverys[idx])
                                            return <MenuItem value={element}>{pdDDMMYYYYWW(element)}</MenuItem>
                                    }
                                )}
                            </Select>
                        </FormControl>
                        <br/>
                        </>
                        :
                        null
                }
                <FormControlLabel
                    style={{width: width}}
                    onChange={(e) => {
                        setInv(e.target.checked)
                    }}
                    control={<Checkbox/>}
                    label={'Cчет фактура'}
                />
                <div style={{width: width}} className={classes.itogo}><b>Итого:</b>&nbsp;{formatAmount(allPrice)}&nbsp;сом</div>
                <br/>
                <div>
                    <Button variant='contained' color='primary' onClick={async () => {
                        if(unlock.current) {
                            unlock.current = false
                            if (geo && client.address[0][1].includes(', ')) {
                                let distance = getGeoDistance(geo.coords.latitude, geo.coords.longitude, ...(client.address[0][1].split(', ')))
                                if (distance < 1000) {
                                    unawaited(() => addAgentHistoryGeo({
                                        client: client._id,
                                        geo: `${geo.coords.latitude}, ${geo.coords.longitude}`
                                    }))
                                }
                            }
                            await addReturned({
                                inv,
                                unite: organization.unite,
                                info: info,
                                address: client.address[0],
                                organization: organization._id,
                                client: client._id,
                                items: Object.values(items),
                                dateDelivery
                            })
                            Router.push('/returneds')
                            showMiniDialog(false);
                        }
                    }} className={classes.button}>
                        Добавить
                    </Button>
                    <Button variant='contained' color='secondary' onClick={() => {showMiniDialog(false);}} className={classes.button}>
                        Закрыть
                    </Button>
                </div>
            </div>
        );
    }
)

function mapStateToProps (state) {
    return {
        app: state.app
    }
}

function mapDispatchToProps(dispatch) {
    return {
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
    }
}

ReturnedConfirmed.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(dialogContentStyle)(ReturnedConfirmed));