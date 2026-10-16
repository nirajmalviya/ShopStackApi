const productmodule = require("../modules/product");
const httpresponse = require("../utils/httpStatus");
const cloudinary = require("../configs/cloudinary.js");
const fs = require("fs");

const CreateProduct = async (req, res) => {
  const { productbrand, productname, productdescription, productrate } = req.body;

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

module.exports = { CreateProduct };
