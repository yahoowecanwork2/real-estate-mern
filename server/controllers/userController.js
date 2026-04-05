import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createHash } from "crypto";
import sendRegisterAndResendOtpMail from "../middleware/sendMailer.js";
import sessionModal from "../models/session.js";
// register user
// export const registerUser = async (req, res) => {
//   try {
//     const { name, email, role, password } = req.body;
//     console.log(req.body);
//     const isAlreadyRegistered = await User.findOne({
//       $or: [{ name }, { email }],
//     });
//     if (isAlreadyRegistered) {
//       res.status(409).json({
//         message: "user or email already exist",
//       });
//     }
//     // hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedpassword = await bcrypt.hash(password, salt);
//     // create
//     const user = await User.create({
//       name,
//       email,
//       role,
//       password: hashedpassword,
//     });
//     const otp = Math.floor(100000 + Math.random() * 1000000);

//     const token = jwt.sign(
//       {
//         user,
//         otp,
//       },
//       process.env.ACTIVATION_SECRET,
//       {
//         expiresIn: "5m",
//       },
//     );
//     const data = {
//       name,
//       otp,
//     };
//     await sendRegisterAndResendOtpMail(email, "Real state", data);
//     res.status(201).json({
//       success: true,
//       status: "success",
//       message: "Otp send to your mail successfully",
//       token: token,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to register",
//     });
//   }
// };
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

    const refreshToken = jwt.sign(
      {
        user,
        otp,
      },
      process.env.ACTIVATION_SECRET,
      {
        expiresIn: "5m",
      },
    );
    // const refreshTokenHash = crypto
    //   .createHash("sha256")
    //   .update(refreshToken)
    //   .digest("hex");
    const refreshTokenHash = createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    console.log("Creating session...");
    const session = await sessionModal.create({
      user: user._id,
      refreshTokenHash,
      ip: req.ip,
      // ip: req.ip || "127.0.0.1",
      userAgent: req.headers["user-agent"],
      // userAgent: req.headers["user-agent"] || "unknown",
    });
    console.log("Session created 👉", session);
    const accesstoken = jwt.sign(
      {
        user,
        otp,
        sessionId: session._id,
      },
      process.env.ACTIVATION_SECRET,
      {
        expiresIn: "15m",
      },
    );
    const data = {
      name,
      otp,
    };
    await sendRegisterAndResendOtpMail(email, "Real state", data);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, //7days
    });

    res.status(201).json({
      success: true,
      status: "success",
      message: "Otp send to your mail successfully",
      token: accesstoken,
    });
  } catch (error) {
    console.log("ERROR 👉", error.message);
    console.log("FULL ERROR 👉", error);
    return res.status(500).json({
      success: false,
      message: "Failed to register",
    });
  }
};
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(409).json({
        message: "Invaild email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }
    const refreshToken = jwt.sign(
      {
        id: user._id,
      },
      process.env.ACTIVATION_SECRET,
      {
        expiresIn: "5m",
      },
    );

    const refreshTokenHash = createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    console.log("Creating  login session...");
    const session = await sessionModal.create({
      user: user._id,
      refreshTokenHash,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
    console.log("Session login created 👉", session);

    const accesstoken = jwt.sign(
      {
        id: user._id,
        sessionId: session._id,
      },
      process.env.ACTIVATION_SECRET,
      {
        expiresIn: "15m",
      },
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, //7days
    });

    res.status(201).json({
      success: true,
      status: "success",
      message: "login successfully",
      user: {
        user: user.name,
        email: user.email,
      },
      token: accesstoken,
    });
  } catch (error) {
    console.log("ERROR ", error.message);
    console.log("FULL ERROR ", error);
    return res.status(500).json({
      success: false,
      message: "Failed to login",
    });
  }
};
export const getMeUser = async (req, res) => {
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

    const accessToken = jwt.sign(
      {
        user,
        otp,
      },
      process.env.ACTIVATION_SECRET,
      {
        expiresIn: "15m",
      },
    );
    const refreshToken = jwt.sign(
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

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, //7days
    });

    res.status(201).json({
      success: true,
      status: "success",
      message: "Otp send to your mail successfully",
      token: accessToken,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to register",
    });
  }
};
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        message: "refresh token is not found",
      });
    }
    const decorded = jwt.verify(refreshToken, process.env.ACTIVATION_SECRET);

    const refreshTokenHash = createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const session = await sessionModal.findOne({
      refreshTokenHash,
      revoked: false,
    });
    if (!session) {
      return res.status(401).json({
        message: "invalid refresh token",
      });
    }

    const accessToken = jwt.sign(
      { id: decorded.id },
      process.env.ACTIVATION_SECRET,
      {
        expiresIn: "15m",
      },
    );
    const newRefreshToken = jwt.sign(
      { id: decorded.id },
      process.env.ACTIVATION_SECRET,
      {
        expiresIn: "7d",
      },
    );
    const newRefreshTokenHash = createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    session.refreshTokenHash = newRefreshTokenHash;
    await session.save();
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, //7days
    });
    res.status(201).json({
      success: true,
      status: "success",
      message: "Access token refreshed succesfullly",
      token: accessToken,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to refreshToken",
    });
  }
};
export const logoutToAll = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({
        message: "refresh token not found",
      });
    }

    // ✅ decode token
    const decoded = jwt.verify(refreshToken, process.env.ACTIVATION_SECRET);

    // ✅ logout from ALL devices (important change)
    await sessionModal.updateMany(
      {
        user: decoded.id,
        revoked: false,
      },
      {
        $set: { revoked: true },
      },
    );

    res.clearCookie("refreshToken");

    return res.status(200).json({
      success: true,
      message: "Logged out from all devices successfully",
    });
  } catch (error) {
    console.log("ERROR 👉", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to logout all devices",
    });
  }
};
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({
        message: "refresh token not found",
      });
    }
    const refreshTokenHash = createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const session = await sessionModal.findOne({
      refreshTokenHash,
      revoked: false,
    });
    if (!session) {
      return res.status(400).json({
        message: "invalid refresh token",
      });
    }
    session.revoked = true;
    await session.save();
    res.clearCookie("refreshToken");
    res.status(201).json({
      success: true,
      status: "success",
      message: "logged out successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to logout",
    });
  }
};
