
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const filtrarCampos = require('./filtrarCampos');

function exportarPDF(datos, res, camposSeleccionados) {
  const doc = new PDFDocument({ margin: 30, size: 'A4' });
  const fechaActual = new Date();
  const fechaFormateada = fechaActual.toLocaleDateString();
  const horaFormateada = fechaActual.toLocaleTimeString();

  const startX = 50;
  const startY = 100;
  const rowHeight = 60;
  const colWidth = 100;

  res.setHeader('Content-Disposition', 'attachment; filename=reporte.pdf');
  res.setHeader('Content-Type', 'application/pdf');
  doc.pipe(res);

  // Título
  doc.fontSize(18).text('Reporte de Usuarios', { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).text(`Fecha: ${fechaFormateada} - Hora: ${horaFormateada}`, { align: 'center' });
  doc.moveDown(2);

  // Encabezados
  camposSeleccionados.forEach((campo, i) => {
    doc.font('Helvetica-Bold').text(campo.toUpperCase(), startX + i * colWidth, startY);
  });
  const imgX = startX + camposSeleccionados.length * colWidth;
  doc.font('Helvetica-Bold').text('FOTO', imgX, startY);

  // Filas de datos
  datos.forEach((filaOriginal, rowIndex) => {
    const y = startY + (rowIndex + 1) * rowHeight;
    const filaFiltrada = filtrarCampos([filaOriginal], camposSeleccionados)[0];

    camposSeleccionados.forEach((campo, colIndex) => {
      const texto = filaFiltrada[campo] ?? '';
      doc.font('Helvetica').text(texto.toString(), startX + colIndex * colWidth, y);
    });

    // Imagen de la persona
    if (filaOriginal.imagen_persona && fs.existsSync(filaOriginal.imagen_persona)) {
      try {
        doc.image(filaOriginal.imagen_persona, imgX, y, { width: 40, height: 40 });
      } catch (e) {
        doc.text('[Error Img]', imgX, y);
      }
    } else {
      doc.text('[Sin imagen]', imgX, y);
    }
  });

  doc.end();
}

module.exports = exportarPDF;
