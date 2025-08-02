import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../../../../layouts/App';
import pageListStyle from '../../../../src/styleMUI/blog/blogList'
import {outXMLAdsShoros, districtsOutXMLAdsShoros} from '../../../../src/gql/outxmladsazyk'
import CardOutXMLAds from '../../../../components/card/CardOutXMLAds'
import { connect } from 'react-redux'
import { getClientGqlSsr } from '../../../../src/getClientGQL'
import initialApp from '../../../../src/initialApp'
import Router from 'next/router'
import { useRouter } from 'next/router'
import {unawaited} from '../../../../src/lib';

const OutXMLAds = React.memo((props) => {
    const router = useRouter()
    const classes = pageListStyle();
    const {data} = props;
    let [list, setList] = useState(data.outXMLAdsShoros);
    let [districts, setDistricts] = useState(data.districts);
    const {search, sort} = props.app;
    const initialRender = useRef(true);
    const searchTimeOut = useRef(null);
    const getList = async () => {
        // eslint-disable-next-line no-undef
        setList(await outXMLAdsShoros({search, organization: router.query.id}))
        setPagination(100);
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant'});
    }
    useEffect(() => {
        if(!initialRender.current) {
            if(searchTimeOut.current)
                clearTimeout(searchTimeOut.current)
            searchTimeOut.current = setTimeout(() => unawaited(getList), 500)
        }
    }, [search])
    useEffect(() => {
        if(initialRender.current) {
            initialRender.current = false;
        }
        else {
            unawaited(getList)
        }
    }, [sort])
    const [pagination, setPagination] = useState(100);
    const checkPagination = useCallback(() => {
        if(pagination<list.length)
            setPagination(pagination => pagination+100)
    }, [pagination, list])
    return (
        <App checkPagination={checkPagination} searchShow pageName='Акционная интеграции 1С'>
            <Head>
                <title>Акционная интеграции 1С</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className='count'>
                {`Всего: ${list.length}`}
            </div>
            <div className={classes.page}>
                {districts.length?<CardOutXMLAds organization={router.query.id} districts={districts} setDistricts={setDistricts} list={list} setList={setList}/>:null}
                {list?list.map((element, idx)=> {
                        if(idx<pagination)
                            return(
                                <CardOutXMLAds key={element._id} setDistricts={setDistricts} list={list} setList={setList}  districts={districts} idx={idx} element={element}/>
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
    // eslint-disable-next-line no-undef
    const [outXMLAdsShorosData, districtsData] = await Promise.all([
        outXMLAdsShoros({search: '', organization: ctx.query.id}, getClientGqlSsr(ctx.req)),
        districtsOutXMLAdsShoros({organization: ctx.query.id}, getClientGqlSsr(ctx.req))
    ])
    return {
        data: {
            outXMLAdsShoros: outXMLAdsShorosData,
            districts: districtsData
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