import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import userRoutes from "../routes/userRoutes.js";

dotenv.config();
// import Razorpay from "razorpay";
// import morgan from "morgan";
// import cookieParser from "cookie-parser";
import dbConnect from "../config/dbConfig.js";

dbConnect();
const app = express();
// export const instance = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY,
//   key_secret: process.env.RAZORPAY_SECRET,
// });
app.use(express.json());

const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use("/api/v1/user", userRoutes);

app.get("/", (req, res) => {
  res.send("API running 🚀");
});
export default app;
