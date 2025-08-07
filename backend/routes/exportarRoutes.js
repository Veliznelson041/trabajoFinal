// backend/routes/exportarRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const path = require('path');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { Parser } = require('json2csv');
const fs = require('fs');


router.get('/exportar/pdf', async (req, res) => {
  try {
    const { id, campos } = req.query;
    if (!id || !campos) return res.status(400).send('Faltan datos');

    const camposArray = campos.split(',');
    const query = `SELECT ${camposArray.join(',')} FROM personas WHERE id = ?`;
    const [rows] = await db.query(query, [id]);

    if (!rows || rows.length === 0) return res.status(404).send('Persona no encontrada');

    const persona = rows[0];

    const doc = new PDFDocument();
    const logoPath = path.join(__dirname, '../../uploads/logo.png');

    res.setHeader('Content-disposition', 'attachment; filename=persona.pdf');
    res.setHeader('Content-type', 'application/pdf');
    doc.pipe(res);

    // Logo
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 40, { width: 80 });
    }

    // Encabezado
    doc.fontSize(16).text('Informe de Persona', { align: 'center' });
    doc.fontSize(10).text(`Fecha: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, { align: 'center' });
    doc.moveDown();

    // Datos
    camposArray.forEach((campo) => {
      doc.fontSize(12).text(`${campo}: ${persona[campo]}`);
    });

    // Pie de página con número de página
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(9).text(`Página ${i + 1} de ${pageCount}`, 0, doc.page.height - 50, {
        align: 'center'
      });
    }

    doc.end();
  } catch (error) {
    console.error("Error al exportar PDF:", error);
    res.status(500).send('Error al exportar PDF');
  }
});


module.exports = router;



router.get('/exportar/csv', async (req, res) => {
  try {
    const { id, campos } = req.query;
    if (!id || !campos) {
      return res.status(400).send('Faltan datos para exportar');
    }

    const camposArray = campos.split(',');
    const query = `SELECT ${camposArray.join(',')} FROM personas WHERE id = ?`;
    const [rows] = await db.query(query, [id]);

    if (!rows || rows.length === 0) {
      return res.status(404).send('Persona no encontrada.');
    }

    const parser = new Parser({ fields: camposArray });
    const csv = parser.parse(rows[0]);

    res.setHeader('Content-disposition', 'attachment; filename=persona.csv');
    res.setHeader('Content-type', 'text/csv');
    res.send(csv);

  } catch (error) {
    console.error("Error al exportar CSV:", error);
    res.status(500).send('Error al exportar CSV');
  }
});

router.get('/exportar/xlsx', async (req, res) => {
  try {
    const { id, campos } = req.query;
    if (!id || !campos) return res.status(400).send('Faltan datos');

    const camposArray = campos.split(',');
    const query = `SELECT ${camposArray.join(',')} FROM personas WHERE id = ?`;
    const [rows] = await db.query(query, [id]);

    if (!rows || rows.length === 0) return res.status(404).send('Persona no encontrada');
    const persona = rows[0];

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Datos Persona');

    // Imagen
    const logoPath = path.join(__dirname, '../../uploads/logo.png');
    if (fs.existsSync(logoPath)) {
      const imageId = workbook.addImage({
        filename: logoPath,
        extension: 'png'
      });
      worksheet.addImage(imageId, {
        tl: { col: 0, row: 0 },
        ext: { width: 120, height: 80 }
      });
    }

    // Encabezado
    worksheet.mergeCells('A5', 'C5');
    worksheet.getCell('A5').value = 'Informe de Persona';
    worksheet.getCell('A5').font = { bold: true, size: 14 };
    worksheet.getCell('A5').alignment = { horizontal: 'center' };

    worksheet.mergeCells('A6', 'C6');
    worksheet.getCell('A6').value = `Fecha: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    worksheet.getCell('A6').alignment = { horizontal: 'center' };

    // Datos
    worksheet.addRow([]);
    worksheet.addRow(camposArray); // encabezado
    worksheet.addRow(camposArray.map(campo => persona[campo])); // datos

    // Pie de página para impresión
    worksheet.headerFooter.oddFooter = '&C Página &P de &N';
    worksheet.headerFooter.oddHeader = '&CInforme de Persona\n&D &T';

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=persona.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error al exportar XLSX:", error);
    res.status(500).send('Error al exportar XLSX');
  }
});





module.exports = router;
