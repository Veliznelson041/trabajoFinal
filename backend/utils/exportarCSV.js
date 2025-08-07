const { format } = require('fast-csv');
const stream = require('stream');
const filtrarCampos = require('./filtrarCampos');

async function exportarCSV(datos, res, camposSeleccionados) {
  const datosFiltrados = filtrarCampos(datos, camposSeleccionados);

  const csvStream = format({ headers: true });
  const readableStream = new stream.PassThrough();

  // Encabezado HTTP
  res.setHeader('Content-Disposition', 'attachment; filename=reporte.csv');
  res.setHeader('Content-Type', 'text/csv');

  readableStream.pipe(res);
  csvStream.pipe(readableStream);

  datosFiltrados.forEach(item => csvStream.write(item));
  csvStream.end();
}

module.exports = exportarCSV;

