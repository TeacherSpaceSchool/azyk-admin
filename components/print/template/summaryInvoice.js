import {checkFloat, formatAmount, isEmpty, pdDDMMYYYY} from '../../../src/lib';

export default ({list, forwarderData, date, filter}) => {
    const columns = [
        {title: '№', style: 'width: 6.5mm;'},
        {title: 'Товар', style: 'width: 104mm;'},
        {title: 'Кол-во', style: 'width: 20mm;'},
        {title: 'Уп-ок', style: 'width: 20mm;'},
        {title: 'Сумма', style: 'width: 20mm;'},
        {title: 'Тоннаж', style: 'width: 20mm;'},
    ]
    let rowIdx = 1;
    let invoiceData
    let html = `
    ${list.reduce((acc, row, idx) => {
        
        const prevRow = list[idx - 1]
        const nextRow = list[idx + 1]
        const isFirst = isEmpty(prevRow)||prevRow[0]!==row[0]
        const isLast = isEmpty(nextRow)||nextRow[0]!==row[0]
        if(isFirst) {
            invoiceData = {countAll: 0, packageAll: 0, priceAll: 0, weightAll: 0}
            rowIdx = 1
            acc += `
              <p style="font-size: 11pt;text-align:center;page-break-before: always; margin-top: 5mm">Общий отпуск от ${pdDDMMYYYY(date)}</p>
              <p>Склад: ${row[0]}</p>
              <p style="display: flex; justify-content: space-between;">
                <span>Экспедитор: ${forwarderData.name}</span>
                ${filter ? `<span>Рейс: ${filter}</span>` : ''}
              </p>
            <table>
              <thead>
                <tr>
                  ${columns.reduce((acc, col) => acc + `<th style="${col.style}">${col.title}</th>`, '')}
                </tr>
              </thead>
              <tbody>
            `
        }
        else rowIdx += 1
        acc += `
              <tr>
                <td style="${columns[0].style}">${rowIdx}</td>
                <td style="${columns[1].style}">${row[1] || ''}</td>
                <td style="${columns[2].style}">${formatAmount(row[2] || '')}</td>
                <td style="${columns[3].style}">${formatAmount(row[3] || '')}</td>
                <td style="${columns[4].style}">${formatAmount(row[4] || '')}</td>
                <td style="${columns[5].style}">${formatAmount(row[5] || '')}</td>
              </tr>
            `
        invoiceData.countAll = checkFloat(invoiceData.countAll + checkFloat(row[2]))
        invoiceData.packageAll = checkFloat(invoiceData.packageAll + checkFloat(row[3]))
        invoiceData.priceAll = checkFloat(invoiceData.priceAll + checkFloat(row[4]))
        invoiceData.weightAll = checkFloat(invoiceData.weightAll + checkFloat(row[5]))
        if(isLast)
            acc += `
              <tr>
                <td style="border: none;${columns[0].style}"></td>
                <td style="border: none;text-align:right;${columns[1].style}">Итого:</td>
                <td style="border: none;${columns[2].style}">${formatAmount(invoiceData.countAll)}</td>
                <td style="border: none;${columns[3].style}">${formatAmount(invoiceData.packageAll)}</td>
                <td style="border: none;${columns[5].style}">${formatAmount(invoiceData.priceAll)}</td>
                <td style="border: none;${columns[5].style}">${formatAmount(invoiceData.weightAll)}</td>
              </tr>
              </tbody>
            </table>
            <br/>
            <p style="display: flex; justify-content: space-between;">
              <span>Отпустил __________</span>
              <span>Получил __________</span>
            </p>
            `
        return acc
    }, '')}
  `;

    return html;
}