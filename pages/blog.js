import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../layouts/App';
import pageListStyle from '../src/styleMUI/blog/blogList'
import {getBlogs} from '../src/gql/blog'
import CardBlog from '../components/card/CardBlog'
import { connect } from 'react-redux'
import { getClientGqlSsr } from '../src/getClientGQL'
import initialApp from '../src/initialApp'
import Router from 'next/router'
import {formatAmount} from '../src/lib';

const Blog = React.memo((props) => {
    const classes = pageListStyle();
    const {data} = props;
    let [list, setList] = useState(data.blogs);
    const {search} = props.app;
    const {profile} = props.user;
    const searchTimeOut = useRef(null);
    const initialRender = useRef(true);
    useEffect(() => {(async () => {
            if(initialRender.current) 
                initialRender.current = false;
            else {
                if(searchTimeOut.current)
                    clearTimeout(searchTimeOut.current)
                searchTimeOut.current = setTimeout(async () => {
                    setList(await getBlogs({search}))
                    setPagination(100);
                    (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
                }, 500)
            }
    })()}, [search])
    const [pagination, setPagination] = useState(100);
    const checkPagination = useCallback(() => {
        if(pagination<list.length)
            setPagination(pagination => pagination+100)
    }, [pagination, list])
    return (
        <App checkPagination={checkPagination} searchShow pageName='Блог'>
            <Head>
                <title>Блог</title>
                <meta name='robots' content='index, follow'/>
            </Head>
            <div className='count'>
                Всего: {formatAmount(list.length)}
            </div>
            <div className={classes.page}>
                {profile.role==='admin'?<CardBlog list={list} setList={setList}/>:null}
                {list?list.map((element, idx)=> {
                    if(idx<pagination) return <CardBlog idx={idx} key={element._id} list={list} setList={setList} element={element}/>
                }):null}
            </div>
        </App>
    )
})

Blog.getInitialProps = async function(ctx) {
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
        data: {blogs: await getBlogs({search: ''}, getClientGqlSsr(ctx.req))}
    };
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

export default connect(mapStateToProps)(Blog);