import React from 'react';
import MUIDataTable from 'mui-datatables';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import Router from 'next/router'
import {exportToExcel} from "../../src/excel";

let getMuiTheme = () => createMuiTheme({
    overrides: {
        MUIDataTableBodyCell: {
            root: {
                textOverflow: 'ellipsis',
                maxHeight: '400px',
                maxWidth: '200px',
                overflow: 'hidden',
                wordWrap: 'break-word'
            }
        },
        MuiPaper: {
            root: {
                minWidth: '100%',
            },
            elevation4:{
                boxShadow: 'none'
            }
        }

    }
})

const MyTable =  React.memo(
    (props) =>{
        const { columns, row, type } = props;
        let data = row.map((row, idx)=>[idx+1, ...row.data])
        const options = {
            customSort: (data, colIndex, order) => {
                data = data.sort(function(a, b) {
                    return order==='desc'?
                        parseInt(b.data[colIndex]) - parseInt(a.data[colIndex])
                        :
                        parseInt(a.data[colIndex]) - parseInt(b.data[colIndex])
                });
                data = data.map((row, idx)=>{
                    row.data[0]=idx+1;
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
                for(let i=0; i<columns.length; i++) {
                    parsedData[0].push(columns[i].name)
                }
                for(let i=0; i<data.length; i++) {
                    for(let i1=0; i1<data[i].data.length; i1++) {
                        if (data[i].data[i1] !== null && data[i].data[i1] !== undefined) {
                            data[i].data[i1] = String(data[i].data[i1]).replace(/\./g, ',');
                        }
                    }

                    parsedData.push(data[i].data)
                }
                exportToExcel(parsedData)
                return false;
            },
            onCellClick: (colData, colMeta) => {
                if(type==='client'&&colMeta.colIndex===0&&row[colMeta.rowIndex]._id)
                    Router.push(`/statistic/client/${row[colMeta.rowIndex]._id}`);
            },
        };
        return (
            <div  style={{zoom: 0.94, width: '100%'}}>
                <MuiThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable
                        data={data}
                        columns={['#', ...columns]}
                        options={options}
                    />
                </MuiThemeProvider>
            </div>
        );
    }
)

export default MyTable;