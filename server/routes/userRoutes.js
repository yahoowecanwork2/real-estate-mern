import express from "express";
import {
  getMeUser,
  loginUser,
  logout,
  logoutToAll,
  refreshToken,
  registerUser,
} from "../controllers/userController.js";

const userRoutes = express.Router();

// routes
// register
userRoutes.post("/register", registerUser);
// login
userRoutes.post("/login", loginUser);

// get /api/auth/me
userRoutes.get("/get-me", getMeUser);
// get/api/auth/refresh-token
userRoutes.get("/refresh-token", refreshToken);
// get /api/auth/logout
userRoutes.get("/logout", logout);
// logout to all
userRoutes.get("/logout-all", logoutToAll);

export default userRoutes;
