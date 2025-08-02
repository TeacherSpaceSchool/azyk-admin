import React from 'react';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import cardOrganizationStyle from '../../src/styleMUI/organization/cardOrganization.js'
import { connect } from 'react-redux'


const CardOrganization = React.memo((props) => {
    const classes = cardOrganizationStyle();
    const {element} = props;
    const {isMobileApp} = props.app;
    return (
        <Card className={isMobileApp?classes.cardM:classes.cardD}>
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
        </Card>
    );
})

function mapStateToProps (state) {
    return {
        app: state.app
    }
}

export default connect(mapStateToProps)(CardOrganization)