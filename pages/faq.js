import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../layouts/App';
import CardFaq from '../components/card/CardFaq';
import pageListStyle from '../src/styleMUI/ads/adsList'
import {getFaqs} from '../src/gql/faq'
import { connect } from 'react-redux'
import { getClientGqlSsr } from '../src/getClientGQL'
import initialApp from '../src/initialApp'
import Router from 'next/router'
import {formatAmount} from '../src/lib';

const Faqs = React.memo((props) => {
    const classes = pageListStyle();
    const {data} = props;
    let [list, setList] = useState(data.faqs);
    const {search,} = props.app;
    const {profile} = props.user;
    const searchTimeOut = useRef(null);
    const initialRender = useRef(true);
    useEffect(() => {
            if(initialRender.current) 
                initialRender.current = false;
            else {
                if(searchTimeOut.current)
                    clearTimeout(searchTimeOut.current)
                searchTimeOut.current = setTimeout(async () => {
                    setList(await getFaqs({search}))
                    setPagination(100);
                    (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
                }, 500)
            }
    }, [search])
    const [pagination, setPagination] = useState(100);
    const checkPagination = useCallback(() => {
        if(pagination<list.length)
            setPagination(pagination => pagination+100)
    }, [pagination, list])
    return (
        <App checkPagination={checkPagination} searchShow pageName='Инструкции'>
            <Head>
                <title>Инструкции</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className={classes.page}>
                <div className='count'>
                    Всего: {formatAmount(list.length)}
                </div>
                {profile.role==='admin'?<CardFaq list={list} setList={setList}/>:null}
                {list?list.map((element, idx)=> {
                        if(idx<pagination)
                            return(
                                <CardFaq idx={idx} list={list} setList={setList} key={element._id} element={element}/>
                            )}
                ):null}
            </div>
        </App>
    )
})

Faqs.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!ctx.store.getState().user.profile.role)
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {faqs: await getFaqs({search: ''}, getClientGqlSsr(ctx.req))}
    };
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

export default connect(mapStateToProps)(Faqs);