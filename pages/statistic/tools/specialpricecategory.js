import * as mini_dialogActions from '../../../redux/actions/mini_dialog'
import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../../../layouts/App';
import { connect } from 'react-redux'
import Router from 'next/router'
import initialApp from '../../../src/initialApp'
import { getSpecialPriceCategories } from '../../../src/gql/specialPriceCategory'
import { bindActionCreators } from 'redux'
import * as appActions from '../../../redux/actions/app'
import * as snackbarActions from '../../../redux/actions/snackbar'
import Table from '../../../components/table/specialPriceCategory';
import {getItems} from '../../../src/gql/items';

const filters = [
    {name: 'A', value: 'A'},
    {name: 'B', value: 'B'},
    {name: 'C', value: 'C'},
    {name: 'D', value: 'D'},
    {name: 'Horeca', value: 'Horeca'},
]

const SpecialPriceCategory = React.memo((props) => {
    //props
    let {organization, filter} = props.app;
    const {setFilter} = appActions;
    //ref
    const contentRef = useRef();
    //items
    let [items, setItems] = useState([]);
    //organization
    useEffect(() => {(async () => {
        //category
        setFilter(null)
        //items
        if(organization)
            setItems(await getItems({organization, search: ''}))
        else
            setItems([])
    })()}, [organization])
    //specialPriceByItem
    let [specialPriceByItem, setSpecialPriceByItem] = useState({});
    useEffect(() => {
        (async () => {
            specialPriceByItem = {}
            if(filter&&organization) {
                const specialPriceCategories = await getSpecialPriceCategories({category: filter, organization})
                for(const specialPriceCategory of specialPriceCategories) {
                    specialPriceByItem[specialPriceCategory.item._id] = specialPriceCategory.price
                }
            }
            setSpecialPriceByItem(specialPriceByItem)
        })()
    }, [filter, organization])
    //double
    const double = contentRef.current&&contentRef.current.offsetWidth>=810
    //middleList
    const middleList = items?Math.ceil(items.length/2):0
    //render
    return (
        <App searchShow organizations={true} filters={filters} cityShow  pageName='Специальная цена категория' >
            <Head>
                <title>Специальная цена категория</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div ref={contentRef} style={{display: 'flex', flexDirection: 'row', marginBottom: 30}}>
                <Table list={double?items.slice(0, middleList):items} specialPriceByItem={specialPriceByItem} setSpecialPriceByItem={setSpecialPriceByItem}/>
                {double?<Table middleList={middleList} list={items.slice(middleList)} specialPriceByItem={specialPriceByItem} setSpecialPriceByItem={setSpecialPriceByItem}/>:null}
            </div>
        </App>
    )
})

SpecialPriceCategory.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['admin', 'суперорганизация', 'организация', 'менеджер'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {data: {}};
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