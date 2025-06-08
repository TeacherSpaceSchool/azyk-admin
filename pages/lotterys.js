import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import App from '../layouts/App';
import CardLotterys from '../components/lotterys/CardLotterys';
import pageListStyle from '../src/styleMUI/lotterys/lotterysList'
import {getLotterys} from '../src/gql/lottery'
import { connect } from 'react-redux'
import { urlMain } from '../redux/constants/other'
import LazyLoad from 'react-lazyload';
import CardLotterysPlaceholder from '../components/lotterys/CardLotterysPlaceholder'
import { getClientGqlSsr } from '../src/getClientGQL'
import initialApp from '../src/initialApp'
import { useRouter } from 'next/router'
import Router from 'next/router'
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Link from 'next/link';
const height = 350

const Lotterys = React.memo((props) => {
    const classes = pageListStyle();
    const { data } = props;
    const { profile } = props.user;
    let [pagination, setPagination] = useState(100);
    const checkPagination = ()=>{
        if(pagination<data.lotterys.length){
            setPagination(pagination+100)
        }
    }
    const router = useRouter()
    const [color, setColor] = useState('#000000');
    useEffect(()=>{
        let black = true
        let countdownRef = setInterval(() => {
            setColor(black?'#ffb300':'#000000')
            black = !black
        }, 1000)
        return ()=>{
            clearInterval(countdownRef)
        }
    }, []);
    return (
        <App checkPagination={checkPagination} pageName={'Лотереи'}>
            <Head>
                <title>Лотереи</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className={classes.page}>
                <div className='count'>
                    {`Всего: ${data.lotterys.length}`}
                </div>
                {data.lotterys?data.lotterys.map((element, idx)=> {
                    if(idx<pagination)
                        return(
                            <LazyLoad scrollContainer={'.App-body'} key={element._id} height={height} offset={[height, 0]} debounce={0} once={true}  placeholder={<CardLotterysPlaceholder height={height}/>}>
                                <CardLotterys color={color} element={element}/>
                            </LazyLoad>
                        )}
                ):null}
            </div>
            {['admin'].includes(profile.role)?
                <Link href='/lottery/edit/[id]' as={`/lottery/edit/new`}>
                    <Fab color='primary' aria-label='add' className={classes.fab}>
                        <AddIcon />
                    </Fab>
                </Link>
                :
                null
            }
        </App>
    )
})

Lotterys.getInitialProps = async function(ctx) {
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
        data: {
            ...await getLotterys(ctx.req?await getClientGqlSsr(ctx.req):undefined)
        },
    };
};

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user,
    }
}

export default connect(mapStateToProps)(Lotterys);