import jwt from "jsonwebtoken";
import User from "../models/user.js";
export const isAuth = async (req, res, next) => {
  try {
    console.log("HEADER 👉", req.headers.authorization);
    console.log("MIDDLEWARE SECRET 👉", process.env.ACTIVATION_SECRET);

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];
    console.log("TOKEN RECEIVED 👉", token);

    const decoded = jwt.verify(token, process.env.ACTIVATION_SECRET);

    console.log("DECODED 👉", decoded);

    req.user = await User.findById(decoded.id).select("-password");

    next();
  } catch (error) {
    console.log("❌ FULL JWT ERROR 👉", error);
    console.log("❌ ERROR MESSAGE 👉", error.message);

    return res.status(401).json({
      message: error.message, // 👈 IMPORTANT CHANGE
    });
  }
};
