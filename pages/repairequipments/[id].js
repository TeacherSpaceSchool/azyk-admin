import Head from 'next/head';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import App from '../../layouts/App';
import { connect } from 'react-redux'
import { getRepairEquipments } from '../../src/gql/repairEquipment'
import pageListStyle from '../../src/styleMUI/equipment/equipmentList'
import CardRepairEquipment from '../../components/card/CardRepairEquipment'
import { getClientGqlSsr } from '../../src/getClientGQL'
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Link from 'next/link';
import Router from 'next/router'
import initialApp from '../../src/initialApp'
import { useRouter } from 'next/router'
import {formatAmount, unawaited} from '../../src/lib';

const filters = [{name: 'Все', value: ''}, {name: 'Обработка', value: 'обработка'}, {name: 'Отмена', value: 'отмена'}, {name: 'Принят', value: 'принят'}, {name: 'Выполнен', value: 'выполнен'}]

const RepairEquipments = React.memo((props) => {
    const classes = pageListStyle();
    const {data} = props;
    let [list, setList] = useState(data.repairEquipments);
    const {search, filter} = props.app;
    const {profile} = props.user;
    const router = useRouter()
    const searchTimeOut = useRef(null);
    const initialRender = useRef(true);
    const getList = async () => {
        setList(await getRepairEquipments({organization: router.query.id, search, filter}))
        setPagination(100);
        (document.getElementsByClassName('App-body'))[0].scroll({top: 0, left: 0, behavior: 'instant' });
    }
    useEffect(() => {
        if(!initialRender.current) unawaited(getList)
    }, [filter])
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
        <App checkPagination={checkPagination} searchShow filters={filters} pageName={'Ремонт оборудования'}>
            <Head>
                <title>Ремонт оборудования</title>
                <meta name='robots' content='noindex, nofollow'/>
            </Head>
            <div className='count'>
                Всего: {formatAmount(list.length)}
            </div>
            <div className={classes.page}>
                {list?list.map((element, idx)=> {
                    if(idx<pagination)
                        return(
                            <CardRepairEquipment idx={idx} key={element._id} list={list} setList={setList} element={element}/>
                        )}
                ):null}
            </div>
            {['admin', 'суперорганизация', 'организация', 'агент', 'менеджер'].includes(profile.role)?
                <Link href='/repairequipment/[id]' as={`/repairequipment/new`}>
                    <Fab color='primary' className={classes.fab}>
                        <AddIcon />
                    </Fab>
                </Link>
                :
                null
            }
        </App>
    )
})

RepairEquipments.getInitialProps = async function(ctx) {
    await initialApp(ctx)
    if(!(['admin', 'суперорганизация', 'организация', 'менеджер', 'агент', 'ремонтник'].includes(ctx.store.getState().user.profile.role)))
        if(ctx.res) {
            ctx.res.writeHead(302, {
                Location: '/contact'
            })
            ctx.res.end()
        } else
            Router.push('/contact')
    return {
        data: {
            repairEquipments: await getRepairEquipments({organization: ctx.query.id, search: '', filter: ''}, getClientGqlSsr(ctx.req))
        }
    };
};

function mapStateToProps (state) {
    return {
        user: state.user,
        app: state.app,
    }
}

export default connect(mapStateToProps)(RepairEquipments);