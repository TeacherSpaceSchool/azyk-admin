import {checkFloat, formatAmount, getClientTitle, pdDDMMMMYYYY} from '../../../src/lib';
import {numberToWords} from '../../../src/numberToWord';

export default ({invoices, returneds, forwarderData, organizationData, agentByClient, date}) => {
    const columns = [
        {title: '№', style: 'width: 6mm;'},
        {title: 'Товар', style: `width: 100.5mm;`},
        {title: 'Кол-во', style: 'width: 20mm;'},
        {title: 'Уп-ок', style: 'width: 20mm;'},
        {title: 'Сумма', style: 'width: 20mm;'},
        {title: 'Тоннаж', style: 'width: 20mm;'},
    ]
    let list = []
    const returnedsByClient = {}
    for(const returned of returneds) {
        if(!returnedsByClient[returned.client._id])
            returnedsByClient[returned.client._id] = []
        returnedsByClient[returned.client._id].push(returned)
    }
    const invoicesByClient = {}
    for(const invoice of invoices) {
        if(!invoicesByClient[invoice.client._id])
            invoicesByClient[invoice.client._id] = []
        invoicesByClient[invoice.client._id].push(invoice)
    }
    const clients = Object.keys(invoicesByClient)
    for(const client of clients) {
        list = [...list, ...(invoicesByClient[client]||[]), ...(returnedsByClient[client]||[])]
        if(invoicesByClient[client]) delete invoicesByClient[client]
        if(returnedsByClient[client]) delete returnedsByClient[client]
    }
    list = [...list, ...Object.values(returnedsByClient).flat()]
    let html = `
        ${list.reduce((acc, invoice) => {
            const isInvoice = !!invoice.orders
            const items = invoice.orders||invoice.items
            let invoiceData = {countAll: 0, packageAll: 0, priceAll: 0, weightAll: 0}
            const invoiceS = `<div style="${items.length>13?'page-break-before: always':'min-height: 145mm'};">
            <p style="font-size: 11pt;">${organizationData.name} Накладная ${isInvoice?'Продажа':'Возврат'} №${invoice.number} от ${pdDDMMMMYYYY(date)} г.</p>
                ${organizationData.requisites?`<p>${organizationData.requisites}</p>`:''}
                <p style="font-weight: bold; margin-top: 10px">${invoice.address[2]!==invoice.client.name?`${invoice.client.name} `:''}${getClientTitle({address: [invoice.address]})}; ${invoice.client.inn?`ИНН: ${invoice.client.inn}; `:''}${invoice.client.phone&&invoice.client.phone.length?invoice.client.phone.reduce((acc, phone, idx) => acc+(phone?`${idx?', ':''}${phone}`:''), 'Тел: '):''}</p>
                ${isInvoice?`<p>Способ оплаты: ${invoice.paymentMethod}</p>`:''}
                <p>Экспедитор: ${forwarderData.name}</p>
                <p>Торговый агент: ${agentByClient[invoice.client._id].name}</p>
                <p>№ рейса: ${invoice.track}</p>
                ${invoice.info?`${<p>Примечание: ${invoice.info}</p>}`:''}
                <table>
                  <thead>
                    <tr>
                      ${columns.reduce((acc, col, idx) => {
                          if(isInvoice||idx!==3) acc += `<th style="${col.style}">${col.title}</th>`
                          return acc
                      }, '')}
                    </tr>
                  </thead>
                  <tbody>
                    ${items.reduce((acc, item, idx) => {
                        const itemName = item.item.name||item.item
                        const count = isInvoice?checkFloat(item.count - item.returned):item.count
                        const packaging = isInvoice?checkFloat(count/item.item.packaging):0
                        const allPrice = isInvoice?checkFloat(item.allPrice/item.count*count):item.allPrice
                        const weight = isInvoice?item.allTonnage:item.weight
                        invoiceData.countAll = checkFloat(invoiceData.countAll + count)
                        invoiceData.packageAll = checkFloat(invoiceData.packageAll + packaging)
                        invoiceData.priceAll = checkFloat(invoiceData.priceAll + allPrice)
                        invoiceData.weightAll = checkFloat(invoiceData.weightAll + weight)
                        return acc+`<tr>
                                <td style="${columns[0].style}">${idx+1}</td>
                                <td style="${columns[1].style}">${itemName}</td>
                                <td style="${columns[2].style}">${formatAmount(count)}</td>
                                ${isInvoice?`<td style="${columns[3].style}">${formatAmount(packaging)}</td>`:''}
                                <td style="${columns[4].style}">${formatAmount(allPrice)}</td>
                                <td style="${columns[5].style}">${formatAmount(weight)}</td>
                              </tr>`
                    }, '')}
                    <tr>
                      <td style="border: none;${columns[0].style}"></td>
                      <td style="border: none;text-align:right;${columns[1].style}">Итого:</td>
                      <td style="border: none;${columns[2].style}">${formatAmount(invoiceData.countAll)}</td>
                      ${isInvoice?`<td style="border: none;${columns[3].style}">${formatAmount(invoiceData.packageAll)}</td>`:''}
                      <td style="border: none;${columns[4].style}">${formatAmount(invoiceData.priceAll)}</td>
                      <td style="border: none;${columns[5].style}">${formatAmount(invoiceData.weightAll)}</td>
                    </tr>
                  </tbody>
                </table>
                <p style="font-weight: bold;">Сумма: ${numberToWords(invoiceData.priceAll)} сом ${invoiceData.priceAll.toString().split('.')[1]||'00'} тыйынов</p>
                <p>Долг на ${pdDDMMMMYYYY(date)} г.: ${invoice.consig||0} сом</p>
                <br/>
                <p style="display: flex; justify-content: space-between;">
                    <span>Отпустил __________</span>
                    <span>Получил __________</span>
                </p>
            </div>`;
            return acc+`<div style="page-break-before: always;">${invoiceS}${invoiceS}</div>`
        }, '')}
    `;
    return html;
}