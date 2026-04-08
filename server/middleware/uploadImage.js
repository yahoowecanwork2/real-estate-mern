import multer from "multer";
import { rm } from "fs/promises";
import path from "path";
import { generatePropertyId } from "../utiles/idGerater.js";

// ✅ storage config
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },

  filename(req, file, cb) {
    const id = generatePropertyId();

    const ext = path.extname(file.originalname); // .jpg
    const name = path.basename(file.originalname, ext); // file name

    const fileName = `property_${name}_${id}${ext}`;
    cb(null, fileName);
  },
});

// ✅ file filter (only images allowed)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

// ✅ multer config
export const uploadPropertys = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
}).array("images", 10); // max 10 images

// ✅ safe remove files
export const removeFiles = async (filepath) => {
  try {
    await rm(filepath);
    console.log("File deleted:", filepath);
  } catch (error) {
    console.log("File delete error:", error.message);
  }
};
