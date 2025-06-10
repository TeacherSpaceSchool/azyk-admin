import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import App from '../layouts/App';
import { connect } from 'react-redux'
import { getBrandOrganizations } from '../src/gql/items'
import { getReviews } from '../src/gql/review'
import pageListStyle from '../src/styleMUI/review/reviewList'
import CardReviews from '../components/review/CardReview'
import { getClientGqlSsr } from '../src/getClientGQL'
import initialApp from '../src/initialApp'
import Router from 'next/router'

const Reviews = React.memo((props) => {
    const classes = pageListStyle();
    const { profile } = props.user;
    const { data } = props;
    let [list, setList] = useState(data.reviews);
    const { filter, organization } = props.app;
    let [paginationWork, setPaginationWork] = useState(true);
    const checkPagination = async()=>{
        if(paginationWork){
            let addedList = (await getReviews({organization: organization, filter: filter, skip: list.length})).reviews
            if(addedList.length>0){
                setList([...list, ...addedList])
            }
            else
                setPaginationWork(false)
        }
    }
    const getList = async()=>{
        setList((await getReviews({organization: organization, filter: filter, skip: 0})).reviews)
        setPaginationWork(true);
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
    }
    useEffect(()=>{
        (async () => {
            await getList()
        })()
    },[filter, organization])
    return (
        <App organizations checkPagination={checkPagination} setList={setList} list={list} filters={data.filterReview} pageName='Отзывы'>
            <Head>
                <title>Отзывы</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className={classes.page}>
                {
                    profile.role==='client'?
                        <CardReviews list={list} organizations={data.brandOrganizations} setList={setList}/>
                        :
                        null
                }
                {
                    list?list.map((element, idx)=> {
                            return(
                                <CardReviews list={list} idx={idx} element={element} organizations={data.brandOrganizations} setList={setList}/>
                            )}
                    ):null
                }
            </div>
        </App>
    )
})

Reviews.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!['admin', 'client', 'суперорганизация', 'организация'].includes(ctx.store.getState().user.profile.role))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {
            ...await getBrandOrganizations({search: '', sort: 'name', filter: ''}, ctx.req?await getClientGqlSsr(ctx.req):undefined),
            ...await getReviews({skip: 0, filter: ''}, ctx.req?await getClientGqlSsr(ctx.req):undefined),
        }
    };
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

export default connect(mapStateToProps)(Reviews);