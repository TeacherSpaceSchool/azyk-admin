import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import { getAutos } from '../../src/gql/auto'
import { getEcspeditors } from '../../src/gql/employment'
import pageListStyle from '../../src/styleMUI/auto/autoList'
import CardAuto from '../../components/card/CardAuto'
import { getClientGqlSsr } from '../../src/getClientGQL'
import Router from 'next/router'
import initialApp from '../../src/initialApp'
import { useRouter } from 'next/router'
import {formatAmount, unawaited} from '../../src/lib';

const sorts = [{name: 'Тоннаж', field: 'tonnage'}]

const Autos = React.memo((props) => {
    const classes = pageListStyle();
    const {data} = props;
    let [list, setList] = useState(data.autos);
    const {search, sort} = props.app;
    const router = useRouter()
    const searchTimeOut = useRef(null);
    const initialRender = useRef(true);
    const getList = async () => {
        setList(await getAutos({search, sort, organization: router.query.id}))
        setPagination(100);
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
    }
    useEffect(() => {
        if(!initialRender.current) unawaited(getList)
    }, [sort])
    useEffect(() => {
            if(initialRender.current) 
                initialRender.current = false;
            else {
                if(searchTimeOut.current)
                    clearTimeout(searchTimeOut.current)
                searchTimeOut.current = setTimeout(() => unawaited(getList), 500)
            }
    }, [search])
    const [pagination, setPagination] = useState(100);
    const checkPagination = useCallback(() => {
        if(pagination<list.length)
            setPagination(pagination => pagination+100)
    }, [pagination, list])
    return (
        <App checkPagination={checkPagination} searchShow sorts={sorts} pageName={'Транспорт'}>
            <Head>
                <title>Транспорт</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className='count'>
                Всего: {formatAmount(list.length)}
            </div>
            <div className={classes.page}>
                <CardAuto organization={router.query.id} employments={data.ecspeditors} list={list} setList={setList}/>
                {list?list.map((element, idx)=> {
                    if(idx<pagination)
                        return(
                            <CardAuto organization={router.query.id} employments={data.ecspeditors} idx={idx} key={element._id} list={list} setList={setList} element={element}/>
                        )
                }):null}
            </div>
        </App>
    )
})

Autos.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['admin', 'суперорганизация', 'организация', 'менеджер'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    // eslint-disable-next-line no-undef
    const [autos, ecspeditors] = await Promise.all([
        getAutos({search: '', sort: '-createdAt', organization: ctx.query.id}, getClientGqlSsr(ctx.req)),
        getEcspeditors(ctx.query.id, getClientGqlSsr(ctx.req))
    ])
    return {
        data: {
            autos,
            ecspeditors
        }
    };
};

function mapStateToProps (state) {
    return {
        user: state.user,
        app: state.app,
    }
}

export default connect(mapStateToProps)(Autos);