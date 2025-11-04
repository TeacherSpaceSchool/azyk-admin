import {formatAmount, pdDDMMYYYY} from '../../../src/lib';

export default ({list, forwarderData, date, filter, ordersData}) => {
    const columns = [
        {title: '№', style: 'width: 6.5mm;'},
        {title: 'Адрес', style: 'width: 50.34mm;'},
        {title: 'Отгр-но', style: 'width: 14.73mm;'},
        {title: 'К оплате', style: 'width: 14.73mm;'},
        {title: 'Тип оплаты', style: 'width: 24.39mm;'},
        {title: 'Возврат', style: 'width: 14.73mm;'},
        {title: 'Долг', style: 'width: 14.73mm;'},
        {title: 'СФ', style: 'width: 6.5mm;'},
        {title: 'Комментарий', style: 'width: 43.35mm;'}
    ]

    let html = `
    <p style="font-size: 11pt;">Отчет по деньгам ${pdDDMMYYYY(date)}</p>
    <p style="display: flex; justify-content: space-between;">
      <span>Экспедитор: ${forwarderData.name}</span>
      ${filter?`<span>Рейс: ${filter}</span>`:''}
    </p>
    <table>
      <thead>
        <tr>
          ${columns.reduce((acc, col) => acc + `<th style="${col.style}">${col.title}</th>`, '')}
        </tr>
      </thead>
      <tbody>
        ${list.reduce((acc, row, idx) => acc + `
          <tr>
            <td style="${columns[0].style}">${idx + 1}</td>
            <td style="${columns[1].style}">${row[0] || ''}</td>
            <td style="${columns[2].style}">${formatAmount(row[1] || '')}</td>
            <td style="${columns[3].style}">${formatAmount(row[2] || '')}</td>
            <td style="${columns[4].style}">${row[3] || ''}</td>
            <td style="${columns[5].style}">${formatAmount(row[4] || '')}</td>
            <td style="${columns[6].style}">${formatAmount(row[5] || '')}</td>
            <td style="${columns[7].style}">${row[6] || ''}</td>
            <td style="${columns[8].style};">${row[7] || ''}</td>
          </tr>
        `, '')}
          <tr>
            <td style="border: none;${columns[0].style}"></td>
            <td style="border: none;text-align:right;${columns[1].style}">Итого:</td>
            <td style="border: none;${columns[2].style}">${formatAmount(ordersData.allPrice)}</td>
            <td style="border: none;${columns[3].style}">${formatAmount(ordersData.paymentPrice)}</td>
            <td style="border: none;${columns[4].style}"></td>
            <td style="border: none;${columns[5].style}">${formatAmount(ordersData.returnedPrice)}</td>
            <td style="border: none;${columns[6].style}">${formatAmount(ordersData.consigPrice)}</td>
            <td style="border: none;${columns[7].style}"></td>
            <td style="border: none;${columns[8].style}"></td>
          </tr>
      </tbody>
    </table>
    <br/>
    <p style="display: flex; justify-content: space-between;">
      <span>Сдал __________</span>
      <span>Получил __________</span>
      <span>Проверил __________</span>
    </p>
  `;

    return html;
}