import express from "express";
import { uploadPropertys } from "../middleware/uploadImage.js";
import { isAuth } from "../middleware/auth.js";
import { isAdmin } from "../middleware/checkAdmin.js";
import { createProperty } from "../controllers/propertyController.js";

const propertyRoutes = express.Router();

// ............................................admin...............................>

propertyRoutes.post(
  "/create",
  isAuth,
  isAdmin,
  uploadPropertys,
  createProperty,
);

export default propertyRoutes;
