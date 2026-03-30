import express from "express";

const userRoutes = express.Router();

// routes
userRoutes.get("/", (req, res) => {
  res.send("User route working");
});

export default userRoutes;
