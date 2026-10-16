const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed =
      file.originalname.endsWith(".xlsx") ||
      file.originalname.endsWith(".xls") ||
      file.originalname.endsWith(".csv");

    if (allowed) cb(null, true);
    else cb(new Error("Only CSV or Excel allowed"));
  }
});

module.exports = upload;
