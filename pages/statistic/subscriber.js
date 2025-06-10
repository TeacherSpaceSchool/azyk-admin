import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as userActions from '../../redux/actions/user'
import { getSubscribers } from '../../src/gql/subscriber'
import pageListStyle from '../../src/styleMUI/subscriber/subscriberList'
import CardSubscriber from '../../components/subscriber/CardSubscriber'
import { getClientGqlSsr } from '../../src/getClientGQL'
import initialApp from '../../src/initialApp'
import Router from 'next/router'

const Subscriber = React.memo((props) => {
    const classes = pageListStyle();
    const { data } = props;
    let [list, setList] = useState(data.subscribers);
    let [failed, setFailed] = useState(0);
    let [delivered, setDelivered] = useState(0);
    useEffect(()=>{
        for(let i=0; i<data.subscribers.length; i++){
            if(data.subscribers[i].status==='доставлено')
                delivered+=1
            else
                failed+=1
        }
        setFailed(failed)
        setDelivered(delivered)
    })

    let [showStat, setShowStat] = useState(false);
    let [pagination, setPagination] = useState(100);
    const checkPagination = ()=>{
        if(pagination<list.length){
            setPagination(pagination+100)
        }
    }
    return (
        <App searchShow={true} checkPagination={checkPagination} pageName='Подписчики'>
            <Head>
                <title>Подписчики</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className='count' onClick={()=>setShowStat(!showStat)}>
                {`Всего: ${list.length}`}
                {
                    showStat?
                        <>
                        <br/>
                        <br/>
                        {`Доставлено: ${delivered}`}
                        <br/>
                        <br/>
                        {`Провалено: ${failed}`}
                        </>
                        :
                        null
                }
            </div>
            <div className={classes.page}>
                {list?list.map((element, idx)=> {
                        if(idx<pagination)
                            return(
                                <CardSubscriber key={element._id} setList={setList} element={element}/>
                            )}
                ):null}
            </div>
        </App>
    )
})

Subscriber.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(ctx.store.getState().user.profile.role!=='admin')
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: await getSubscribers(ctx.req?await getClientGqlSsr(ctx.req):undefined)
    };
};

function mapStateToProps (state) {
    return {
        user: state.user,
        app: state.app,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userActions: bindActionCreators(userActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Subscriber);