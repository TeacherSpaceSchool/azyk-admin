import * as mini_dialogActions from '../../../redux/actions/mini_dialog'
import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import App from '../../../layouts/App';
import { connect } from 'react-redux'
import Router from 'next/router'
import initialApp from '../../../src/initialApp'
import { getSpecialPriceClients } from '../../../src/gql/specialPrice'
import { bindActionCreators } from 'redux'
import * as appActions from '../../../redux/actions/app'
import * as snackbarActions from '../../../redux/actions/snackbar'
import Table from '../../../components/table/specialPriceClient';
import {getItems} from '../../../src/gql/items';

const SpecialPriceClient = React.memo((props) => {
    //props
    let {organization} = props.app;
    //ref
    const contentRef = useRef();
    //client
    let [client, setClient] = useState(null);
    //items
    let [items, setItems] = useState([]);
    //organization
    useEffect(() => {(async () => {
        //client
        setClient(null)
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
            if(client&&organization) {
                const specialPriceCategories = await getSpecialPriceClients({client: client._id, organization})
                for(const specialPriceClient of specialPriceCategories) {
                    specialPriceByItem[specialPriceClient.item._id] = specialPriceClient.price
                }
            }
            setSpecialPriceByItem(specialPriceByItem)
        })()
    }, [client, organization])
    //double
    const double = contentRef.current&&contentRef.current.offsetWidth>=810
    //middleList
    const middleList = items?Math.ceil(items.length/2):0
    //render
    return (
        <App searchShow organizations={true} cityShow  pageName='Специальная цена клиента' >
            <Head>
                <title>Специальная цена клиента</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div ref={contentRef} style={{display: 'flex', flexDirection: 'row', marginBottom: 30}}>
                <Table list={double?items.slice(0, middleList):items} specialPriceByItem={specialPriceByItem} setSpecialPriceByItem={setSpecialPriceByItem} client={client} setClient={setClient}/>
                {double?<Table middleList={middleList} list={items.slice(middleList)} specialPriceByItem={specialPriceByItem} setSpecialPriceByItem={setSpecialPriceByItem} client={client} setClient={setClient}/>:null}
            </div>
        </App>
    )
})

SpecialPriceClient.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['admin', 'суперорганизация', 'организация', 'менеджер'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    ctx.store.getState().app.organization = '5e00a5c0f2cd0f4f82eac3db'
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

export default connect(mapStateToProps, mapDispatchToProps)(SpecialPriceClient);