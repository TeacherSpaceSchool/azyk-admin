import * as mini_dialogActions from '../../../redux/actions/mini_dialog'
import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../../../layouts/App';
import { connect } from 'react-redux'
import pageListStyle from '../../../src/styleMUI/statistic/statistic'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Router from 'next/router'
import initialApp from '../../../src/initialApp'
import CardSpecialPriceCategory from '../../../components/card/CardSpecialPriceCategory'
import { getItemsForSpecialPriceCategories, getSpecialPriceCategories } from '../../../src/gql/specialPriceCategory'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { bindActionCreators } from 'redux'
import * as appActions from '../../../redux/actions/app'
import * as snackbarActions from '../../../redux/actions/snackbar'
import { getClientGqlSsr } from '../../../src/getClientGQL'
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import {getOrganizations} from '../../../src/gql/organization';

const categorys = ['A','B','C','D','Horeca']

const SpecialPriceCategory = React.memo((props) => {
    const classes = pageListStyle();
    const {data} = props;
    let {isMobileApp, city} = props.app;
    const {profile} = props.user;
    const {showLoad} = props.appActions;
    const initialRender = useRef(true);
    let [organizations, setOrganizations] = useState(data.organizations);
    let [category, setCategory] = useState(null);
    let handleCategory =  (event) => {
        setCategory(event.target.value)
    };
    let [items, setItems] = useState([]);
    let [specialPriceCategories, setSpecialPriceCategories] = useState([]);
    let [organization, setOrganization] = useState(profile.organization?{_id: profile.organization}:null);
    useEffect(() => {
        (async () => {
            if(initialRender.current) {
                initialRender.current = false;
            }
            else {
                showLoad(true)
                setOrganization(null)
                setOrganizations(await getOrganizations({search: '', filter: '', city}))
                showLoad(false)
            }
        })()
    }, [city])
    useEffect(() => {
        (async () => {
            setCategory(null)
        })()
    }, [organization])
    useEffect(() => {
        (async () => {
            if(category&&organization) {
                showLoad(true)
                // eslint-disable-next-line no-undef
                const [items, specialPriceCategories] = await Promise.all([
                    getItemsForSpecialPriceCategories({category, organization: organization._id}),
                    getSpecialPriceCategories({category, organization: organization._id})
                ])
                setItems(items)
                setSpecialPriceCategories(specialPriceCategories)
                showLoad(false)
            }
            else {
                setSpecialPriceCategories([])
                setItems([])
            }
        })()
    }, [category])
    const inputClass = profile.role==='admin'?classes.inputHalf:classes.input
    return (
        <App cityShow pageName='Специальная цена категория' >
            <Head>
                <title>Специальная цена категория</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <Card className={classes.page}>
                <CardContent className={classes.column} style={isMobileApp?{}:{justifyContent: 'start', alignItems: 'flex-start'}}>
                    <div className={classes.row}>
                        {
                            profile.role==='admin'?
                                <Autocomplete
                                    className={inputClass}
                                    options={organizations}
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
                        <FormControl className={inputClass}>
                            <InputLabel>Категория</InputLabel>
                            <Select value={category} onChange={handleCategory}>
                                {categorys.map((element)=>
                                    <MenuItem key={element} value={element} ola={element}>{element}</MenuItem>
                                )}
                            </Select>
                        </FormControl>
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
                            setItems={setItems}
                        />
                        {specialPriceCategories?specialPriceCategories.map((element, idx)=> {
                            return (
                                <CardSpecialPriceCategory
                                    idx={idx} key={element._id}
                                    element={element}
                                    setList={setSpecialPriceCategories}
                                    organization={organization}
                                    items={items}
                                    category={category}
                                    setItems={setItems}
                                />
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
    return {
        data: {
            organizations: await getOrganizations({city: ctx.store.getState().app.city, search: '', filter: ''}, getClientGqlSsr(ctx.req))
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