const express = require("express")
const router = express.Router()
const auth = require("../../middleware/authMiddleWare")
const upload = require("../../middleware/upload");
const { CreateProduct,  } = require("../../controllers/ProductControllers")
const { LoadAllProduct } = require("../../controllers/ProductControllers")
const { UpdateProduct } = require("../../controllers/ProductControllers")
const { DeleteProduct } = require("../../controllers/ProductControllers")
const { SearchProductByAny } = require("../../controllers/ProductControllers")
const {bulkUploadProducts} = require("../../controllers/ProductControllers")
const {LoadAllProductDetailsById} = require("../../controllers/ProductControllers")
 const xlsxupload = require("../../middleware/xlsxupload")

router.post("/CreateProduct", auth,upload.array("images", 5),CreateProduct)
router.post("/LoadAllProduct", auth,LoadAllProduct)
router.post("/LoadAllProductDetailsById",LoadAllProductDetailsById)
router.post("/UpdateProduct", auth,UpdateProduct)
router.post("/DeleteProduct", auth,DeleteProduct)
router.post("/SearchProductByAny",SearchProductByAny)


router.post(
  "/bulk-upload",
  xlsxupload.single("file"),
bulkUploadProducts
);
module.exports = router