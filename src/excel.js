import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const exportToExcel = (data) => {
    const worksheet = XLSX.utils.aoa_to_sheet(data); // Преобразование массива в лист Excel
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    saveAs(fileData, 'data.xlsx');
};