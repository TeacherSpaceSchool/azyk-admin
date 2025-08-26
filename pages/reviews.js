import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../layouts/App';
import { connect } from 'react-redux'
import { getReviews } from '../src/gql/review'
import pageListStyle from '../src/styleMUI/review/reviewList'
import CardReviews from '../components/card/CardReview'
import { getClientGqlSsr } from '../src/getClientGQL'
import initialApp from '../src/initialApp'
import Router from 'next/router'
import {getOrganizations} from '../src/gql/organization';
import {unawaited} from '../src/lib';
import {viewModes} from '../src/enum';
import Table from '../components/table/reviews';

const filters = [{name: 'Все', value: ''}, {name: 'Обработка', value: 'обработка'}]

const Reviews = React.memo((props) => {
    const classes = pageListStyle();
    const initialRender = useRef(true);
    const {profile} = props.user;
    const {data} = props;
    let [list, setList] = useState(data.reviews);
    const {filter, organization, viewMode} = props.app;
    const paginationWork = useRef(true);
    const checkPagination = useCallback(async () => {
        if(paginationWork.current) {
            paginationWork.current = false
            let addedList = await getReviews({organization, filter, skip: list.length})
            if(addedList.length) {
                setList([...list, ...addedList])
                paginationWork.current = true
            }
        }
    }, [organization, filter, list])
    const getList = async () => {
        setList(await getReviews({organization, filter, skip: 0}))
        paginationWork.current = true;
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
    }
    useEffect(() => {
        if(initialRender.current) {
            initialRender.current = false;
        }
        else {
            unawaited(getList)
        }
    }, [filter, organization])
    return (
        <App organizations checkPagination={checkPagination} list={list} setList={setList} filters={filters} pageName='Отзывы'>
            <Head>
                <title>Отзывы</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className={classes.page} style={viewMode===viewModes.table?{paddingTop: 0}:{}}>
                {list?profile.role==='client'||viewMode===viewModes.card?
                        <>
                            {
                                profile.role==='client'?
                                    <CardReviews organizations={data.organizations} list={list} setList={setList}/>
                                    :
                                    null
                            }
                            {
                                list?list.map((element, idx) => {
                                    return(
                                        <CardReviews key={element._id} idx={idx} element={element} organizations={data.organizations} list={list} setList={setList}/>
                                    )}
                                ):null
                            }
                        </>
                        :
                        <Table list={list}/>
                    :null}
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
    // eslint-disable-next-line no-undef
    const [organizations, reviews] = await Promise.all([
        getOrganizations({city: ctx.store.getState().app.city, search: '', filter: ''}, getClientGqlSsr(ctx.req)),
        getReviews({skip: 0, filter: ''}, getClientGqlSsr(ctx.req))
    ])
    return {
        data: {
            organizations,
            reviews
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