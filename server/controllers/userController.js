import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// register user
export const registerUser = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    console.log(req.body);
    const isAlreadyRegistered = await User.findOne({
      $or: [{ name }, { email }],
    });
    if (isAlreadyRegistered) {
      res.status(409).json({
        message: "user or email already exist",
      });
    }
    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(password, salt);
    // create
    const user = await User.create({
      name,
      email,
      role,
      password: hashedpassword,
    });
    const token = jwt.sign({ id: user._id }, process.env.ACTIVATION_SECRET, {
      expiresIn: "5m",
    });
    res.status(201).json(
      {
        message: "user register sccessfully",
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      token,
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify",
    });
  }
};
