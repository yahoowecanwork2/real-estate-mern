import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendRegisterAndResendOtpMail from "../middleware/sendMailer.js";

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
    const otp = Math.floor(100000 + Math.random() * 1000000);

    const token = jwt.sign(
      {
        user,
        otp,
      },
      process.env.ACTIVATION_SECRET,
      {
        expiresIn: "5m",
      },
    );
    const data = {
      name,
      otp,
    };
    await sendRegisterAndResendOtpMail(email, "Real state", data);
    res.status(201).json({
      success: true,
      status: "success",
      message: "Otp send to your mail successfully",
      token: token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to register",
    });
  }
};
