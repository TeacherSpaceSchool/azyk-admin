import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import App from '../../../layouts/App';
import pageListStyle from '../../../src/styleMUI/blog/blogList'
import {outXMLAdsShoros, districtsOutXMLAdsShoros} from '../../../src/gql/outxmladsazyk'
import CardOutXMLAds from '../../../components/outXmlAds/CardOutXMLAds'
import { connect } from 'react-redux'
import { urlMain } from '../../../redux/constants/other'
import LazyLoad from 'react-lazyload';
import { forceCheck } from 'react-lazyload';
import CardOutXMLAdsPlaceholder from '../../../components/outXmlAds/CardOutXMLAdsPlaceholder'
import { getClientGqlSsr } from '../../../src/getClientGQL'
import initialApp from '../../../src/initialApp'
import Router from 'next/router'
import { useRouter } from 'next/router'
const height = 189

const OutXMLAds = React.memo((props) => {
    const router = useRouter()
    const classes = pageListStyle();
    const { data } = props;
    let [list, setList] = useState(data.outXMLAdsShoros);
    let [districts, setDistricts] = useState(data.districts);
    const { search, sort } = props.app;
    const { profile } = props.user;
    useEffect(()=>{
        (async()=>{
            setList(await outXMLAdsShoros({organization: router.query.id, search}))
        })()
    },[sort, search])
    useEffect(()=>{
        (async()=>{
            setDistricts(await districtsOutXMLAdsShoros({organization: router.query.id}))
            setPagination(100)
            forceCheck()
        })()
    },[list])
    let [pagination, setPagination] = useState(100);
    const checkPagination = ()=>{
        if(pagination<list.length){
            setPagination(pagination+100)
        }
    }
    return (
        <App checkPagination={checkPagination} searchShow={true} pageName='Акционная интеграции 1С'>
            <Head>
                <title>Акционная интеграции 1С</title>
                <meta name='description' content='Азык – это онлайн платформа для заказа товаров оптом, разработанная специально для малого и среднего бизнеса.  Она объединяет производителей и торговые точки напрямую, сокращая расходы и повышая продажи. Азык предоставляет своим пользователям мощные технологии для масштабирования и развития своего бизнеса.' />
                <meta property='og:title' content='Акционная интеграции 1С' />
                <meta property='og:description' content='Азык – это онлайн платформа для заказа товаров оптом, разработанная специально для малого и среднего бизнеса.  Она объединяет производителей и торговые точки напрямую, сокращая расходы и повышая продажи. Азык предоставляет своим пользователям мощные технологии для масштабирования и развития своего бизнеса.' />
                <meta property='og:type' content='website' />
                <meta property='og:image' content={`${urlMain}/static/512x512.png`} />
                <meta property="og:url" content={`${urlMain}/outxmlads`} />
                <link rel='canonical' href={`${urlMain}/outxmlads`}/>
            </Head>
            <div className='count'>
                {`Всего: ${list.length}`}
            </div>
            <div className={classes.page}>
                {districts.length>0?<CardOutXMLAds organization={router.query.id} districts={districts} list={list} setList={setList}/>:null}
                {list?list.map((element, idx)=> {
                        if(idx<pagination)
                            return(
                                <LazyLoad scrollContainer={'.App-body'} key={element._id} height={height} offset={[height, 0]} debounce={0} once={true}  placeholder={<CardOutXMLAdsPlaceholder height={height}/>}>
                                    <CardOutXMLAds key={element._id} list={list} setList={setList}  districts={districts} idx={idx} element={element}/>
                                </LazyLoad>
                            )}
                ):null}
            </div>
        </App>
    )
})

OutXMLAds.getInitialProps = async function(ctx) {
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
        data: {
            outXMLAdsShoros: await outXMLAdsShoros({search: '', organization: ctx.query.id}, ctx.req?await getClientGqlSsr(ctx.req):undefined),
            districts: await districtsOutXMLAdsShoros({organization: ctx.query.id}, ctx.req?await getClientGqlSsr(ctx.req):undefined)
        }
    };
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

export default connect(mapStateToProps)(OutXMLAds);