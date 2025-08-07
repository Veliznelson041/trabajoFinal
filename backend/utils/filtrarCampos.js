// backend/utils/filtrarCampos.js
function filtrarCampos(data, campos) {
  return data.map(obj =>
    Object.fromEntries(
      Object.entries(obj).filter(([key]) => campos.includes(key))
    )
  );
}

module.exports = filtrarCampos;
