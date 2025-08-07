
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const filtrarCampos = require('./filtrarCampos');

async function exportarExcel(datos, res, camposSeleccionados) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Reporte de Usuarios');

  const now = new Date();
  worksheet.mergeCells('A1', `${String.fromCharCode(65 + camposSeleccionados.length)}1`);
  worksheet.getCell('A1').value = 'Reporte de Usuarios';
  worksheet.getCell('A1').font = { bold: true, size: 16 };
  worksheet.getCell('A2').value = `Fecha: ${now.toLocaleDateString()} - Hora: ${now.toLocaleTimeString()}`;

  worksheet.addRow([]);
  worksheet.addRow([...camposSeleccionados.map(c => c.toUpperCase()), 'FOTO']);
  worksheet.getRow(4).font = { bold: true };

  datos.forEach((fila, i) => {
    const filaFiltrada = filtrarCampos([fila], camposSeleccionados)[0];
    const filaData = camposSeleccionados.map(campo => filaFiltrada[campo] || '');
    const row = worksheet.addRow([...filaData, '']);

    const rowIndex = row.number;

    // Insertar imagen si existe
    if (fila.imagen_persona && fs.existsSync(fila.imagen_persona)) {
      try {
        const imageId = workbook.addImage({
          filename: fila.imagen_persona,
          extension: path.extname(fila.imagen_persona).replace('.', '')
        });

        worksheet.addImage(imageId, {
          tl: { col: camposSeleccionados.length, row: rowIndex - 1 },
          ext: { width: 50, height: 50 }
        });
      } catch (e) {
        console.log('⚠️ Error al insertar imagen:', e.message);
      }
    }
  });

  worksheet.addRow([]);
  worksheet.addRow(['Fin del reporte']);

  res.setHeader('Content-Disposition', 'attachment; filename=reporte.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  await workbook.xlsx.write(res);
  res.end();
}

module.exports = exportarExcel;
