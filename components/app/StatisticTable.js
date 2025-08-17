import React, {useMemo} from 'react';
import MUIDataTable from 'mui-datatables';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import {exportToExcel} from '../../src/excel';
import {connect} from 'react-redux';
import {isNotEmpty} from '../../src/lib';

const StatisticTable =  React.memo(
    (props) =>{
        const {columns, row, filterHeight/*, type*/} = props;
        const {isMobileApp} = props.app;
        let data = row.map((row, idx)=>[idx+1, ...row.data])
        const muiTheme = useMemo(() => createMuiTheme({
            overrides: {
                MUIDataTable: {responsiveScroll: {maxHeight: `calc(100vh - (${isMobileApp?56:64}px + 40px + ${isNotEmpty(filterHeight)?filterHeight:99}px + ${isMobileApp?56:64}px + 53px + 8px))`, textOverflow: 'ellipsis', width: '100%', fontSize: 12, overflow: 'auto'}},
                MuiTableCell: {root: {fontSize: 14, wordWrap: 'break-word'}}, MUIDataTableBody: {emptyTitle: {fontSize: 14}},
                MuiPaper: {root: {width: '100%'}, elevation4: {boxShadow: 'none'}}
            }
        }), [])
        const options = {
            customSort: (data, colIndex, order) => {
                data = data.sort((a, b) => order==='desc'? parseInt(b.data[colIndex]) - parseInt(a.data[colIndex]) : parseInt(a.data[colIndex]) - parseInt(b.data[colIndex]));
                data = data.map((row, idx) => {
                    row.data[0]=idx+1
                    return row
                })
                return data
            },
            selectableRows: 'none',
            print: false,
            pagination: true,
            rowsPerPage: 100,
            rowsPerPageOptions: [100],
            count: data.length,
            responsive: 'scroll',
            onDownload: (buildHead, buildBody, columns, data) => {
                const parsedData = [[]]
                for(let i=0; i<columns.length; i++) parsedData[0].push(columns[i].name)
                for(let i=0; i<data.length; i++) {
                    for(let i1=0; i1<data[i].data.length; i1++)
                        if(isNotEmpty(data[i].data[i1]))
                            data[i].data[i1] = String(data[i].data[i1]).replace(/\./g, ',');
                    parsedData.push(data[i].data)
                }
                exportToExcel(parsedData)
                return false;
            }/*,
            onCellClick: (colData, colMeta) => {}*/
        }
        return <MuiThemeProvider theme={muiTheme}>
            <MUIDataTable
                data={data}
                columns={['#', ...columns]}
                options={options}
            />
        </MuiThemeProvider>;
    }
)

function mapStateToProps (state) {
    return {
        app: state.app
    }
}

export default connect(mapStateToProps)(StatisticTable)

