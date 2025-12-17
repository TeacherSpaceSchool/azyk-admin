import {formatAmount, pdDDMMMMYYYY} from '../../../src/lib';

export default ({list, forwarderData, date, ordersData}) => {
    const columns = [
        {title: '№',          style: 'width: 6mm;'},
        {title: forwarderData?'Клиент':'Экспедитор', style: 'width: 48mm;'},
        {title: 'Товар',      style: 'width: 48mm;'},
        {title: 'Кол-во',     style: 'width: 20mm;'},
        {title: 'Уп-ок',      style: 'width: 20mm;'},
        {title: 'Сумма',     style: 'width: 20mm;'},
        {title: 'Тоннаж',     style: 'width: 20mm;'},
    ];

    let html = `
    <p style="font-size: 11pt;">Акционная накладная ${pdDDMMMMYYYY(date)}</p>
    ${forwarderData?`<p>Экспедитор: ${forwarderData.name}</p>`:''}
    <table>
      <thead>
        <tr>
          ${columns.reduce((acc, col) => acc + `<th style="${col.style}">${col.title}</th>`, '')}
        </tr>
      </thead>
      <tbody>
        ${list.reduce((acc, row, idx) => {
        return acc + `
              <tr>
                <td style="${columns[0].style}">${idx+1}</td>
                <td style="${columns[1].style}">${formatAmount(row[0])}</td>
                <td style="${columns[2].style}">${formatAmount(row[1])}</td>
                <td style="${columns[3].style}">${formatAmount(row[2])}</td>
                <td style="${columns[4].style}">${formatAmount(row[3])}</td>
                <td style="${columns[5].style}">${formatAmount(row[4])}</td>
                <td style="${columns[6].style}">${formatAmount(row[5])}</td>
              </tr>
            `
    }, '')}
          <tr>
            <td style="border: none;${columns[0].style}"></td>
            <td style="border: none;text-align:right;${columns[1].style}">Итого:</td>
            <td style="border: none;${columns[2].style}"></td>
            <td style="border: none;${columns[3].style}">${formatAmount(ordersData.countAll)}</td>
            <td style="border: none;${columns[4].style}">${formatAmount(ordersData.packageAll)}</td>
            <td style="border: none;${columns[5].style}">${formatAmount(ordersData.priceAll)}</td>
            <td style="border: none;${columns[6].style}">${formatAmount(ordersData.weightAll)}</td>
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