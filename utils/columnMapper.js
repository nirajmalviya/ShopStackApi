// utils/columnMapper.js
const product = require('../modules/product')
const normalize = (str) =>
  str?.toString().toLowerCase().replace(/\s/g, "");

const columnMap = {
  productbrand: ["brandname", "brand", "company"],
  productname: ["productname", "name", "title"],
  productdescription: ["details", "description", "materials"],
  productrate: ["price", "mrp", "cost", "rate"],
  productimage: ["url", "image", "images"]
};

const mapRowToSchema = (row) => {
  let mapped = {};

  Object.keys(columnMap).forEach((schemaKey) => {
    const possible = columnMap[schemaKey];

    Object.keys(row).forEach((excelKey) => {
      if (possible.includes(normalize(excelKey))) {
        mapped[schemaKey] = row[excelKey];
      }
    });
  });

  // fix image array
  if (mapped.productimage && typeof mapped.productimage === "string") {
    mapped.productimage = [mapped.productimage];
  }

  // convert rate to number
  if (mapped.productrate) {
    mapped.productrate = Number(mapped.productrate);
  }

  return mapped;
};

module.exports = mapRowToSchema;
