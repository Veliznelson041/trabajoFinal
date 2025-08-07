const express = require('express');
const router = express.Router();
const db = require('../db'); // tu conexión a PostgreSQL
const ExcelJS = require('exceljs');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const fs = require('fs');

// Ruta general: PDF, XLSX, CSV
router.get('/exportar/:formato', async (req, res) => {
  const { formato } = req.params;
  const { campos, id } = req.query;

  if (!id || !campos) return res.status(400).send('Faltan datos para exportar.');

  const camposArray = campos.split(',');
  const query = `SELECT ${camposArray.join(',')} FROM personas WHERE persona_id = $1`;

  try {
    const { rows } = await db.query(query, [id]);
    const datos = rows[0];

    if (!datos) return res.status(404).send('Persona no encontrada.');

    if (formato === 'pdf') {
      const doc = new PDFDocument();
      res.setHeader('Content-disposition', 'attachment; filename=persona.pdf');
      res.setHeader('Content-type', 'application/pdf');

      doc.pipe(res);
      doc.fontSize(18).text('Datos de la persona', { underline: true });

      camposArray.forEach((campo) => {
        doc.fontSize(14).text(`${campo}: ${datos[campo]}`);
      });

      doc.end();

    } else if (formato === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Datos');

      worksheet.addRow(camposArray);               // encabezado
      worksheet.addRow(camposArray.map(c => datos[c]));  // datos

      res.setHeader('Content-disposition', 'attachment; filename=persona.xlsx');
      res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      await workbook.xlsx.write(res);
      res.end();

    } else if (formato === 'csv') {
      const parser = new Parser({ fields: camposArray });
      const csv = parser.parse(datos);

      res.setHeader('Content-disposition', 'attachment; filename=persona.csv');
      res.setHeader('Content-type', 'text/csv');
      res.send(csv);
    } else {
      res.status(400).send('Formato no soportado.');
    }

  } catch (err) {
    console.error(err);
    res.status(500).send('Error al exportar datos.');
  }
});

module.exports = router;
