import {formatAmount, getClientTitle, pdDDMMMMYYYY} from '../../../src/lib';

export default ({histories, element}) => {
    let html = `
      <div style="font-size: 9pt; width: 100mm; padding: 5mm; border: 1px solid black">
        <center>
            <p style="font-size: 11pt; font-weight: bold; margin-bottom: 2px;">КВИТАНЦИЯ О ПРИЁМЕ ОПЛАТЫ</p>
            <p style="font-size: 10pt; margin-top: 0;">(КОНСИГНАЦИЯ)</p>
        </center>
        <hr style="border: 0; border-top: 1px solid #000; margin: 10px 0;">
        <p style="margin: 2px 0;">Дата: ${pdDDMMMMYYYY(element.createdAt)}</p>
        ${histories && histories[0] ? `
            <p style="margin: 2px 0;">Вноситель: ${histories[0].employment.name}</p>
            <p style="margin: 2px 0;">Должность: ${histories[0].user.role}</p>
        ` : ''}
        <hr style="border: 0; border-top: 1px dashed #000; margin: 10px 0;">
        <p style="margin: 2px 0;">Контрагент: ${getClientTitle(element.client)}</p>
        <p style="margin: 2px 0;">Сумма: ${formatAmount(element.amount)} сом</p>
        <hr style="border: 0; border-top: 1px solid #000; margin: 10px 0;">
        <p style="margin: 10px 0 2px 0;">Подпись вносителя: ______________________</p>
        <p style="font-size: 8pt; margin: 2px 0;">Примечание: Передаётся в кассу вместе с деньгами</p>
      </div>
`;

    return html;
}