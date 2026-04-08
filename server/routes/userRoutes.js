import express from "express";
import {
  addItemToWishlist,
  clearWishlist,
  getAllUsers,
  getMeUser,
  getMyWishlistItems,
  getProfile,
  getSingleUser,
  getUserWishlistItems,
  loginUser,
  logout,
  logoutToAll,
  refreshToken,
  registerUser,
  removeFromWishlist,
  SearchUser,
  userUpdateProfile,
  userVerify,
} from "../controllers/userController.js";
import { isAdmin } from "../middleware/checkAdmin.js";
import { isAuth } from "../middleware/auth.js";

const userRoutes = express.Router();

// routes
// register
userRoutes.post("/register", registerUser);
// otp verify
userRoutes.post("/verify", userVerify);
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
userRoutes.get("/profile", isAuth, getProfile);
userRoutes.put("/profile-update", isAuth, userUpdateProfile);
// wistlist
userRoutes.get("/my-wishlist", isAuth, getMyWishlistItems);
userRoutes.put("/wishlist/add-item", isAuth, addItemToWishlist);
userRoutes.put("/wishlist/remove-item", isAuth, removeFromWishlist);
userRoutes.put("/wishlist/clear", isAuth, clearWishlist);
// .................................................adminroutes..............................>
userRoutes.post("/register", registerUser);

userRoutes.post("/verify", userVerify);
userRoutes.post("/login", isAdmin, loginUser);
userRoutes.get("/all-user", isAuth, isAdmin, getAllUsers);
userRoutes.get("/get-single/:userId", isAdmin, getSingleUser);
userRoutes.get("/user-wishlist/:userId", isAdmin, getUserWishlistItems);
userRoutes.get("/search", isAdmin, SearchUser);

export default userRoutes;
