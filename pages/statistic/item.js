import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../../src/styleMUI/statistic/statistic'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Router from 'next/router'
import initialApp from '../../src/initialApp'
import Table from '../../components/app/Table'
import { getClientGqlSsr } from '../../src/getClientGQL'
import { getStatisticItem, getActiveOrganization } from '../../src/gql/statistic'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { bindActionCreators } from 'redux'
import * as appActions from '../../redux/actions/app'
import { pdDatePicker } from '../../src/lib'

const ItemStatistic = React.memo((props) => {

    const classes = pageListStyle();
    const { data } = props;
    const { isMobileApp, filter, city } = props.app;
    const { profile } = props.user;
    const initialRender = useRef(true);
    let [activeOrganization, setActiveOrganization] = useState(data.activeOrganization);
    const [dateRange, setDateRange] = useState({ start: data.dateStart, end: null });
    const handleDateRange = (type, value) => {
        let start = dateRange.start;
        let end = dateRange.end;

        if (type === 'start') {
            start = value || pdDatePicker(new Date());
        } else {
            end = value;
        }

        if (start && end) {
            const startDate = new Date(start);
            const endDate = new Date(end);

            if (endDate < startDate) {
                endDate.setDate(startDate.getDate() + 1);
                end = pdDatePicker(endDate);
            } else {
                const maxEnd = new Date(startDate);
                maxEnd.setMonth(maxEnd.getMonth() + 1);
                if (endDate > maxEnd) {
                    end = pdDatePicker(maxEnd);
                }
            }
        }

        setDateRange({ start, end });
    };
    let [statisticItem, setStatisticItem] = useState(undefined);
    let [showStat, setShowStat] = useState(false);
    let [organization, setOrganization] = useState({_id: 'all'});
    const { showLoad } = props.appActions;
    useEffect(()=>{
        (async()=>{
                await showLoad(true)
                setStatisticItem((await getStatisticItem({
                    company: organization ? organization._id : 'all',
                    dateStart: dateRange.start ? dateRange.start : null,
                    dateEnd: dateRange.end ? dateRange.end : null,
                    online: filter,
                    city: city
                })).statisticItem)
                await showLoad(false)
        })()
    },[organization, dateRange, filter, activeOrganization])
    useEffect(()=>{
        if(process.browser){
            let appBody = document.getElementsByClassName('App-body')
            appBody[0].style.paddingBottom = '0px'
        }
    },[process.browser])
    useEffect(()=>{
        (async()=>{
            if(initialRender.current) {
                initialRender.current = false;
            }
            else {
                await showLoad(true)
                setOrganization(undefined)
                setActiveOrganization((await getActiveOrganization(city)).activeOrganization)
                await showLoad(false)
            }
        })()
    },[city])
    const filters = [{name: 'Все', value: false}, {name: 'Online', value: true}]
    return (
        <App cityShow pageName='Статистика товаров' filters={filters}>
            <Head>
                <title>Статистика товаров</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    <div className={classes.row}>
                        {
                            profile.role === 'admin' ?
                                <Autocomplete
                                    className={classes.inputThird}
                                    options={activeOrganization}
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
                                null
                        }
                        <TextField
                            className={profile.role==='admin'?classes.inputThird:classes.inputHalf}
                            label='Дата от'
                            type='date'
                            InputLabelProps={{
                                shrink: true,
                            }}
                            value={dateRange.start}
                            inputProps={{
                                'aria-label': 'description',
                            }}
                            onChange={e => handleDateRange('start', e.target.value)}
                        />
                        <TextField
                            className={profile.role==='admin'?classes.inputThird:classes.inputHalf}
                            label='Дата до'
                            type='date'
                            InputLabelProps={{
                                shrink: true,
                            }}
                            value={dateRange.end}
                            inputProps={{
                                'aria-label': 'description',
                            }}
                            onChange={e => handleDateRange('end', e.target.value)}
                        />
                    </div>
                    {
                        statisticItem?
                            <Table type='item' row={(statisticItem.row).slice(1)} columns={statisticItem.columns}/>
                            :null
                    }
                </CardContent>
            </Card>
            <div className='count' onClick={()=>setShowStat(!showStat)}>
                {
                    statisticItem?
                        <>
                        <div className={classes.rowStatic}>{`Товаров: ${statisticItem.row[0].data[0]}`}</div>
                        {
                            showStat?
                                <>
                                <div className={classes.rowStatic}>{`Выручка: ${statisticItem.row[0].data[1]} сом`}</div>
                                <div className={classes.rowStatic}>{`Заказов: ${statisticItem.row[0].data[2]} шт`}</div>
                                </>
                                :
                                null
                        }
                        </>
                        :null
                }
            </div>
        </App>
    )
})

ItemStatistic.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    ctx.store.getState().app.filter = false
    if(!['admin', 'суперорганизация'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    let dateStart = new Date()
    if (dateStart.getHours()<3)
        dateStart.setDate(dateStart.getDate() - 1)
    return {
        data: {
            ...await getActiveOrganization(ctx.store.getState().app.city, ctx.req?await getClientGqlSsr(ctx.req):undefined),
            dateStart: pdDatePicker(dateStart)
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

        appActions: bindActionCreators(appActions, dispatch),

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ItemStatistic);