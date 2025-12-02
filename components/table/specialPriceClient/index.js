import React, {useEffect, useRef, useState} from 'react';
import {connect} from 'react-redux';
import Row from './Row';
import {getClients} from '../../../src/gql/client';
import {getClientTitle, isEmpty} from '../../../src/lib';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import Autocomplete from '@material-ui/lab/Autocomplete';
import cardStyle from '../../../src/styleMUI/subbrand/cardSubbrand';

const Tables =  React.memo(({middleList, list, specialPriceByItem, setSpecialPriceByItem, client, setClient, app}) =>{
    const classes = cardStyle();
    const {isMobileApp, district, network, search} = app;
    let titleWidth = isMobileApp?250:300
    let widthNbmr = 60
    const columns = [
        {title: 'Название', style: {width: titleWidth}},
        {title: 'Цена', style: {width: widthNbmr}},
    ]
    //client
    const [clients, setClients] = useState([]);
    const [inputValue, setInputValue] = React.useState('');
    const searchTimeOut = useRef(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if(inputValue.length < 3) {
            setClients([]);
            if(open)
                setOpen(false)
            if(loading)
                setLoading(false)
        }
        else {
            if(!loading)
                setLoading(true)
            if(searchTimeOut.current)
                clearTimeout(searchTimeOut.current)
            searchTimeOut.current = setTimeout(async () => {
                setClients(await getClients({search: inputValue, sort: '-name', filter: 'all', district, network}))
                if(!open)
                    setOpen(true)
                setLoading(false)
            }, 500)
        }
    }, [inputValue]);
    const handleChange = event => setInputValue(event.target.value);
    let handleClient = (client) => {
        setClient(client)
        setOpen(false)
    };
    //render
    return <div style={{width: 'fit-content', background: 'white'}}>
        <div
            style={{display: 'flex', alignItems: 'center', zIndex: 1000, padding: 5, height: 48, position: 'sticky', background: 'white', top: 0, fontWeight: 600, borderRight: '1px solid #00000040', borderBottom: '1px solid #00000040'}}>
            {isEmpty(middleList)?<>
                <Autocomplete
                    style={{marginBottom: 0}}
                    onClose={() =>setOpen(false)}
                    open={open}
                    disableOpenOnFocus
                    className={classes.input}
                    options={clients}
                    getOptionLabel={option => getClientTitle(option)}
                    onChange={(event, newValue) => handleClient(newValue)}
                    noOptionsText='Ничего не найдено'
                    renderInput={params => (
                        <TextField error={!client} {...params} label='Выберите клиента' fullWidth
                                   onChange={handleChange}
                                   InputProps={{
                                       ...params.InputProps,
                                       endAdornment: (
                                           <React.Fragment>
                                               {loading ? <CircularProgress color='inherit' size={20} /> : null}
                                               {params.InputProps.endAdornment}
                                           </React.Fragment>
                                       ),
                                   }}
                        />
                    )}
                />
            </>:null}
        </div>
        <div className='tableHead' style={{top: 49}}>
        {columns.map((column, idx) => {
                return column?<React.Fragment key={`column${idx}`}>
                    <div className='tableCell' style={{...column.style, whiteSpace: 'nowrap'}}>
                        {column.title}
                    </div>
                    <div className='tableBorder'/>
                </React.Fragment>:null
            })}
        </div>
        {client&&list?list.map((item, idx) => {
            if(middleList)
                idx += middleList
            if(!search||item.name.toLowerCase().includes(search.toLowerCase())) return <Row key={item._id} client={client} item={item} columns={columns} specialPriceByItem={specialPriceByItem} setSpecialPriceByItem={setSpecialPriceByItem} idx={idx}
                        list={list} middleList={middleList}/>
        }):[]}
    </div>;
})

function mapStateToProps (state) {
    return {
        app: state.app,
    }
}

export default connect(mapStateToProps)(Tables)

