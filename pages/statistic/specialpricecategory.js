import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../../src/styleMUI/statistic/statistic'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Router from 'next/router'
import { urlMain } from '../../redux/constants/other'
import initialApp from '../../src/initialApp'
import CardSpecialPriceCategory from '../../components/specialpricecategory/CardSpecialPriceCategory'
import CardSpecialPriceCategoryPlaceholder from '../../components/specialpricecategory/CardSpecialPriceCategoryPlaceholder'
import { getActiveOrganization } from '../../src/gql/statistic'
import { getItemsForSpecialPriceCategories, getSpecialPriceCategories } from '../../src/gql/specialPriceCategory'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { bindActionCreators } from 'redux'
import * as appActions from '../../redux/actions/app'
import LazyLoad from 'react-lazyload';
import * as snackbarActions from '../../redux/actions/snackbar'
import { getClientGqlSsr } from '../../src/getClientGQL'
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

const height = 225
const categorys = ['A','B','C','D','Horeca']

const SpecialPriceCategory = React.memo((props) => {
    const classes = pageListStyle();
    const { data } = props;
    let { isMobileApp, city } = props.app;
    const { profile } = props.user;
    const { showLoad } = props.appActions;
    const initialRender = useRef(true);
    let [activeOrganization, setActiveOrganization] = useState(data.activeOrganization);
    let [category, setCategory] = useState(undefined);
    let handleCategory =  (event) => {
        setCategory(event.target.value)
    };
    let [items, setItems] = useState([]);
    let [specialPriceCategories, setSpecialPriceCategories] = useState([]);
    let [organization, setOrganization] = useState(data.organization?data.organization:undefined);
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
    useEffect(()=>{
        (async()=>{
            setCategory(undefined)
        })()
    },[organization])
    useEffect(()=>{
        (async()=>{
            if(category&&organization){
                await showLoad(true)
                setItems(await getItemsForSpecialPriceCategories({category, organization: organization._id}))
                setSpecialPriceCategories(await getSpecialPriceCategories({category, organization: organization._id}))
                await showLoad(false)
            }
            else {
                setSpecialPriceCategories([])
                setItems([])
            }
        })()
    },[category])
    return (
        <App cityShow pageName='Специальная цена категория' >
            <Head>
                <title>Специальная цена категория</title>
                <meta name='description' content='Азык – это онлайн платформа для заказа товаров оптом, разработанная специально для малого и среднего бизнеса.  Она объединяет производителей и торговые точки напрямую, сокращая расходы и повышая продажи. Азык предоставляет своим пользователям мощные технологии для масштабирования и развития своего бизнеса.' />
                <meta property='og:title' content='Специальная цена категория' />
                <meta property='og:description' content='Азык – это онлайн платформа для заказа товаров оптом, разработанная специально для малого и среднего бизнеса.  Она объединяет производителей и торговые точки напрямую, сокращая расходы и повышая продажи. Азык предоставляет своим пользователям мощные технологии для масштабирования и развития своего бизнеса.' />
                <meta property='og:type' content='website' />
                <meta property='og:image' content={`${urlMain}/static/512x512.png`} />
                <meta property='og:url' content={`${urlMain}/statistic/specialpricecategory`} />
                <link rel='canonical' href={`${urlMain}/statistic/specialpricecategory.`}/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    <div className={classes.row}>
                        {
                            profile.role==='admin'?
                                <Autocomplete
                                    className={classes.input}
                                    options={activeOrganization}
                                    getOptionLabel={option => option.name}
                                    value={organization}
                                    onChange={(event, newValue) => {
                                        setOrganization(newValue)
                                    }}
                                    noOptionsText='Ничего не найдено'
                                    renderInput={params => (
                                        <TextField {...params} label='Организация' fullWidth />
                                    )}/>
                                :
                                null
                        }
                        {
                            organization?
                                <FormControl className={classes.input}>
                                    <InputLabel>Категория</InputLabel>
                                    <Select value={category} onChange={handleCategory}>
                                        {categorys.map((element)=>
                                            <MenuItem key={element} value={element} ola={element}>{element}</MenuItem>
                                        )}
                                    </Select>
                                </FormControl>
                                :
                                null
                        }
                    </div>
                </CardContent>
            </Card>
            {
                organization&&category&&specialPriceCategories?
                    <div className={classes.listInvoices}>
                        <CardSpecialPriceCategory
                            setList={setSpecialPriceCategories}
                            organization={organization}
                            items={items}
                            category={category}
                            list={specialPriceCategories}/>
                        {specialPriceCategories?specialPriceCategories.map((element, idx)=> {
                            return (
                                <LazyLoad scrollContainer={'.App-body'} key={element._id}
                                          height={height} offset={[height, 0]} debounce={0}
                                          once={true}
                                          placeholder={<CardSpecialPriceCategoryPlaceholder/>}>
                                    <CardSpecialPriceCategory
                                        idx={idx} key={element._id}
                                        element={element}
                                        setList={setSpecialPriceCategories}
                                        organization={organization}
                                        items={items}
                                        category={category}
                                        list={specialPriceCategories}/>
                                </LazyLoad>
                            )
                        }):null}
                    </div>
                    :
                    null
            }
        </App>
    )
})

SpecialPriceCategory.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['admin', 'суперорганизация', 'организация', 'агент', 'менеджер'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    let organization
    if(ctx.store.getState().user.profile.organization)
        organization = {_id: ctx.store.getState().user.profile.organization}
    return {
        data: {
            ...(await getActiveOrganization(ctx.store.getState().app.city, ctx.req?await getClientGqlSsr(ctx.req):undefined)),
            organization
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
        snackbarActions: bindActionCreators(snackbarActions, dispatch),
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
        appActions: bindActionCreators(appActions, dispatch),

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SpecialPriceCategory);