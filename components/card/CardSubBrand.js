import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import cardSubBrandStyle from '../../src/styleMUI/subbrand/cardSubbrand'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as mini_dialogActions from '../../redux/actions/mini_dialog'
import * as snackbarActions from '../../redux/actions/snackbar'
import Link from 'next/link';
import CardActionArea from '@material-ui/core/CardActionArea';

const CardSubBrand = React.memo((props) => {
    const classes = cardSubBrandStyle();
    const {element} = props;
    const {isMobileApp} = props.app;
    return (
        <Link href='/subbrand/[id]' as={`/subbrand/${element._id}`}>
            <Card className={isMobileApp?classes.cardM:classes.cardD}>
                <CardActionArea>
                    <CardContent>
                        <div className={classes.row} style={{alignItems: 'start'}}>
                            <label htmlFor={element?element._id:'add'}>
                                <img
                                    className={classes.mediaO}
                                    src={element.image}
                                    alt={'Изменить'}
                                    loading='lazy'
                                />
                            </label>
                            <div>
                                <div className={classes.nameField} style={{color: 'black'}}>
                                    {element.organization.name}
                                </div>
                                <div className={classes.nameField} style={{color: 'black'}}>
                                    {element.name}
                                </div>
                                <div>
                                    {element.miniInfo}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </CardActionArea>
            </Card>
        </Link>
    );
})

function mapStateToProps (state) {
    return {
        user: state.user,
        app: state.app
    }
}

function mapDispatchToProps(dispatch) {
    return {
        mini_dialogActions: bindActionCreators(mini_dialogActions, dispatch),
        snackbarActions: bindActionCreators(snackbarActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CardSubBrand)