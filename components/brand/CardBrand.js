import React, {useState} from 'react';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import cardOrganizationStyle from '../../src/styleMUI/organization/cardOrganization.js'
import { connect } from 'react-redux'
import Link from 'next/link';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Done from '@material-ui/icons/Done';
import { checkInt, inputInt } from '../../src/lib'
import { setOrganization } from '../../src/gql/organization'
import { setSubBrand } from '../../src/gql/subBrand'
import CardActions from '@material-ui/core/CardActions';

const CardBrand = React.memo((props) => {
    const classes = cardOrganizationStyle();
    const { element, idx, setList, type } = props;
    let { list } = props;
    const { isMobileApp } = props.app;
    const { profile } = props.user;
    let [priotiry, setPriotiry] = useState(element.priotiry);
    return (
        isMobileApp&&(profile.role==='client'||type==='👁')?
            <Link href={`/${profile.role==='client'?'catalog':'brand'}/[id]`} as={`/${profile.role==='client'?'catalog':'brand'}/${element._id}`}>
                <Card className={classes.cardBrand}>
                    <img
                        className={classes.mediaBrand}
                        src={element.image}
                        alt={element.name}
                    />
                    <div className={classes.textBrand}>
                        {element.miniInfo?element.miniInfo:''}
                    </div>
                </Card>
            </Link>
            :
                <Card className={isMobileApp?classes.cardM:classes.cardD}>
                    <Link href={`/${profile.role==='client'?'catalog':'brand'}/[id]`} as={`/${profile.role==='client'?'catalog':'brand'}/${element._id}`}>
                        <CardActionArea>
                            <div className={classes.line}>
                            <img
                                className={classes.mediaO}
                                src={element.image}
                                alt={element.name}
                            />
                            <div className={classes.column}>
                                <h3 className={classes.input}>
                                    {element.name}
                                </h3>
                                {
                                    element.miniInfo?
                                        <div className={classes.value}>
                                            {element.miniInfo}
                                        </div>
                                        :
                                        null
                                }
                            </div>
                            </div>
                        </CardActionArea>
                    </Link>
                    {
                        profile.role==='admin'?
                            <CardActions>
                                <FormControl className={classes.input}>
                                    <InputLabel htmlFor={`adornment-priotiry${element._id}`}>Приоритет</InputLabel>
                                    <Input
                                        id={`adornment-priotiry${element._id}`}
                                        type={ isMobileApp?'number':'text'}
                                        value={priotiry}
                                        onChange={(event)=>{setPriotiry(inputInt(event.target.value))}}
                                        endAdornment={
                                            priotiry!=element.priotiry?
                                                <InputAdornment position='end'>
                                                    <IconButton aria-label='Задать цену' onClick={async ()=>{
                                                        priotiry = checkInt(priotiry)
                                                        if(element.type==='subBrand')
                                                            await setSubBrand({_id: element._id, priotiry})
                                                        else
                                                            await setOrganization({_id: element._id, priotiry})
                                                        list[idx].priotiry = priotiry
                                                        list = list.sort(function(a, b) {
                                                            return b.priotiry - a.priotiry
                                                        });
                                                        setList([...list])
                                                    }}>
                                                        <Done />
                                                    </IconButton>
                                                </InputAdornment>
                                                :
                                                null
                                        }
                                    />
                                </FormControl>
                            </CardActions>
                            :
                            null
                    }
                </Card>
    );
})

function mapStateToProps (state) {
    return {
        app: state.app,
        user: state.user
    }
}


export default connect(mapStateToProps)(CardBrand)