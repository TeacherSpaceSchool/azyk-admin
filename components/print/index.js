export const printHTML = ({ title, data, template }) => {
    let html = `
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 5mm;
             width: 200mm; 
             transform-origin: top left; 
        }
        p {margin-bottom: 1mm; margin-top: 0}
      body, body * {
        font-size: 9pt;
      }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            font-weight: 500;
            border: 0.2mm solid #000;
            padding: 1mm;
            word-break: break-all;      /* ломает слово в любом месте */
            hyphens: auto;              /* пытается переносить по слогам, если возможно */
            overflow-wrap: break-word;
            text-align:left;
          }
          tr {
            page-break-inside: avoid; /* строки не разрывать */
          }
        @media print {
          @page {
            size: A4 portrait;
            margin: 5mm; /* поля страницы */
             width: 210mm; 
          }
        }
      </style>
    </head>
    <body>
            ${template(data)}
    </body>
    </html>
    `;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onafterprint = () => {if (!printWindow.closed) printWindow.close()};
    printWindow.print();
};