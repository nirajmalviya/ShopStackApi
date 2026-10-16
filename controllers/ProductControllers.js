const productmodule = require("../modules/product");
const httpresponse = require("../utils/httpStatus");
const cloudinary = require("../configs/cloudinary.js");
const fs = require("fs");
const mapRowToSchema = require("../utils/columnMapper");
const { Readable } = require("stream");
const csvParser = require("csv-parser");
const XLSX = require("xlsx");

const Product = require("../modules/product.js");
const CreateProduct = async (req, res) => {
  const { productbrand, productname, productdescription, productrate } =
    req.body;

  try {
    const isexistprod = await productmodule.findOne({ productname });
    if (isexistprod) {
      return res.status(httpresponse.BAD_REQUEST).json({
        message: "product already exists",
      });
    }

    // ✅ MUST use req.files
    if (!req.files || req.files.length === 0) {
      return res.status(httpresponse.BAD_REQUEST).json({
        message: "No images uploaded",
      });
    }

    // ✅ Upload all images to Cloudinary
    const imageUrls = [];

    for (const file of req.files) {
      const uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: "uploads",
      });

      imageUrls.push(uploadResult.secure_url);

      // delete local file
      fs.unlinkSync(file.path);
    }

    const product = await productmodule.create({
      productbrand,
      productname,
      productdescription,
      productimage: imageUrls, // ARRAY
      productrate,
    });

    res.status(httpresponse.CREATED).json({
      message: `product ${product.productname} created successfully`,
      images: imageUrls,
    });
  } catch (err) {
    console.error(err);
    res.status(httpresponse.INTERNAL_SERVER).json({
      message: "internal server error",
    });
  }
};

const LoadAllProduct = async (req, res) => {
  let {pagination} = req.body
  try {
   
    let product = await productmodule.find({}).limit(pagination);
    res.send(product);
  } catch (err) {
    res.status(httpresponse.INTERNAL_SERVER).json({
      message: `internal server error`,
    });
  }
};

const LoadAllProductDetailsById = async (req, res) => {
  try {
    let { productmasterid } = req.body;
    if (!productmasterid)
      return res
        .status(httpresponse.CONFLICT)
        .json({ message: "please provide productmasterid" });
    let findproduct = await productmodule.findOne({ _id: productmasterid });
    if (!findproduct)
      res
        .status(httpresponse.NOT_FOUND)
        .josn({ message: `the product not found` });
    res.status(httpresponse.OK).josn({ message: "found product", findproduct });
  } catch (Err) {
    res
      .status(httpresponse.INTERNAL_SERVER)
      .json({ message: `Internal Server Error` });
  }
};

const UpdateProduct = async (req, res) => {
  try {
    let {
      _id,
      productbrand,
      productname,
      productdescription,
      productimage,
      productrate,
    } = req.body;
    let findprod = await productmodule.findOne({ _id });
    if (!findprod)
      return res
        .status(httpresponse.CONFLICT)
        .json({ message: `the product does not exist` });
    let updateproduct = await productmodule.findByIdAndUpdate(
      { _id },
      {
        productbrand,
        productname,
        productdescription,
        productimage,
        productrate,
      },
      { new: true },
    );
    res
      .status(httpresponse.OK)
      .json({ updateproduct, message: `updated successfully` });
  } catch (err) {
    res
      .status(httpresponse.INTERNAL_SERVER)
      .json({ message: `Internal Server Error` });
  }
};

const SearchProductByAny = async (req, res) => {
  try {
    const { searchquery } = req.body;

    if (!searchquery) {
      return res.status(400).json({
        message: "Search query required",
      });
    }

    const findproduct = await Product.find({
      $or: [
        { productname: { $regex: searchquery, $options: "i" } },
        { productbrand: { $regex: searchquery, $options: "i" } },
        { productdescription: { $regex: searchquery, $options: "i" } },
      ],
    });

    if (findproduct.length === 0) {
      return res.status(204).json({
        message: `Product "${searchquery}" not found`,
      });
    }

    res.status(200).json({
      message: "Product Found",
      data: findproduct,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

const DeleteProduct = async (req, res) => {
  try {
    let { _id } = req.body;
    let findprod = await productmodule.find({ _id });
    if (!findprod)
      return res
        .status(httpresponse.CONFLICT)
        .json({ message: `the product does not exist` });
    if (req.finduser.role === "admin") {
      let deleteprod = await productmodule.findByIdAndDelete({ _id });
      res.status(httpresponse.OK).json({ message: `product successfully` });
    } else {
      res
        .status(httpresponse.FORBIDDEN)
        .json({ message: `you cant access this method` });
    }
  } catch (Err) {
    res
      .status(httpresponse.INTERNAL_SERVER)
      .json({ message: `Internam server error`, error: Err.message });
  }
};

const parseCSV = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];

    const stream = Readable.from(buffer.toString());

    stream
      .pipe(csvParser())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
};

// helper → read Excel buffer
const parseExcel = (buffer) => {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet);
};

const bulkUploadProducts = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    let rows = [];

    // detect file type
    if (req.file.originalname.endsWith(".csv")) {
      rows = await parseCSV(req.file.buffer);
    } else {
      rows = parseExcel(req.file.buffer);
    }

    if (!rows.length) return res.status(400).json({ message: "File empty" });

    const validProducts = [];
    const failedRows = [];

    rows.forEach((row, index) => {
      const mapped = mapRowToSchema(row);

      if (
        mapped.productbrand &&
        mapped.productname &&
        mapped.productdescription &&
        mapped.productrate &&
        mapped.productimage
      ) {
        validProducts.push(mapped);
      } else {
        failedRows.push({ row: index + 1, data: row });
      }
    });

    if (!validProducts.length)
      return res.status(400).json({ message: "No valid data found" });

    const inserted = await Product.insertMany(validProducts);

    res.json({
      message: "Upload success",
      insertedCount: inserted.length,
      failedRows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  CreateProduct,
  LoadAllProduct,
  UpdateProduct,
  DeleteProduct,
  SearchProductByAny,
  bulkUploadProducts,
  LoadAllProductDetailsById,
};
