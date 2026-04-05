import express from "express";
import {
  getMeUser,
  logout,
  refreshToken,
  registerUser,
} from "../controllers/userController.js";

const userRoutes = express.Router();

// routes
// register
userRoutes.post("/register", registerUser);
// get /api/auth/me
userRoutes.get("/get-me", getMeUser);
// get/api/auth/refresh-token
userRoutes.get("/refresh-token", refreshToken);
// get /api/auth/logout
userRoutes.get("/logout", logout);

export default userRoutes;
