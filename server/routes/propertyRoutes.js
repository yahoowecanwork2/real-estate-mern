import express from "express";
import { uploadPropertys } from "../middleware/uploadImage.js";
import { isAuth } from "../middleware/auth.js";
import { isAdmin } from "../middleware/checkAdmin.js";
import {
  createProperty,
  deleteProperty,
  filterProperties,
  getAllProperties,
  getPropertiesByStatus,
  getSingleProperty,
  searchProperties,
  updateProperty,
  updatePropertyStatus,
} from "../controllers/propertyController.js";

const propertyRoutes = express.Router();
// ...................................userRoutes..................................>
propertyRoutes.get("/", getAllProperties);
propertyRoutes.get("/:id", getSingleProperty);
propertyRoutes.post("/search", searchProperties);
propertyRoutes.post("/filter", filterProperties);
// ............................................admin...............................>

propertyRoutes.post(
  "/create",
  isAuth,
  isAdmin,
  uploadPropertys,
  createProperty,
);
propertyRoutes.get("/", getAllProperties);
propertyRoutes.get("/:id", getSingleProperty);
propertyRoutes.post("/search", searchProperties);
propertyRoutes.put("/:id", isAuth, isAdmin, uploadPropertys, updateProperty);
propertyRoutes.post("/filter", filterProperties);
propertyRoutes.put("/status/:id", isAuth, isAdmin, updatePropertyStatus);
propertyRoutes.get("/status/:status", isAuth, isAdmin, getPropertiesByStatus);
propertyRoutes.delete("/:id", isAuth, isAdmin, deleteProperty);

export default propertyRoutes;
