import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createHash } from "crypto";
import sendRegisterAndResendOtpMail from "../middleware/sendMailer.js";
import sessionModal from "../models/session.js";
// register user
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const isAlreadyRegistered = await User.findOne({ email });
    if (isAlreadyRegistered) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(password, salt);

    const otp = Math.floor(100000 + Math.random() * 900000);

    const activationToken = jwt.sign(
      {
        name,
        email,
        password: hashedpassword,
        role,

        otp,
      },
      process.env.ACTIVATION_SECRET,
      { expiresIn: "5m" },
    );

    await sendRegisterAndResendOtpMail(email, "Real Estate", {
      name,
      otp,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      activationToken,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Register failed",
    });
  }
};

export const userVerify = async (req, res) => {
  try {
    const { otp, activationToken } = req.body;

    const verify = jwt.verify(activationToken, process.env.ACTIVATION_SECRET);

    // ❌ token invalid
    if (!verify) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    // ❌ wrong otp
    if (verify.otp !== Number(otp)) {
      return res.status(400).json({
        message: "Wrong OTP",
      });
    }

    // ✅ check again (important)
    const existingUser = await User.findOne({ email: verify.email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    // ✅ FINAL USER CREATE (only here)
    const user = await User.create({
      name: verify.name,
      email: verify.email,
      password: verify.password,
      role: verify.role || "user",
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Verification failed",
    });
  }
};
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("BODY 👉", req.body);
    console.log("LOGIN SECRET 👉", process.env.ACTIVATION_SECRET);
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
        role: user.role, // ✅ IMPORTANT
      },
      process.env.ACTIVATION_SECRET,
      {
        expiresIn: "1d",
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
        role: user.role,

        sessionId: session._id,
      },
      process.env.ACTIVATION_SECRET,
      {
        expiresIn: "15m",
      },
    );
    console.log("ACCESS TOKEN ", accesstoken);

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
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch user",
    });
  }
};
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    // token verify
    if (!refreshToken) {
      return res.status(401).json({
        message: "refresh token is not found",
      });
    }

    const decorded = jwt.verify(refreshToken, process.env.ACTIVATION_SECRET);
    // hash token
    const refreshTokenHash = createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const session = await sessionModal.findOne({
      refreshTokenHash,
      revoked: false,
    });
    // chack session

    if (!session) {
      return res.status(401).json({
        message: "invalid refresh token",
      });
    }
    // new access token generate
    const accessToken = jwt.sign(
      { id: decorded.id },
      process.env.ACTIVATION_SECRET,
      {
        expiresIn: "15m",
      },
    );
    // new refresh token genrate
    const newRefreshToken = jwt.sign(
      {
        id: decorded.id,
        role: decorded.role,
      },
      process.env.ACTIVATION_SECRET,
      {
        expiresIn: "7d",
      },
    );
    // new hash create and save db
    const newRefreshTokenHash = createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");
    session.refreshTokenHash = newRefreshTokenHash;
    await session.save();
    // cookiee update
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
export const getProfile = async (req, res) => {
  try {
    // const userId = req.id;
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "Profile not found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Profile fetched successfully",
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to load user",
    });
  }
};
export const userUpdateProfile = async (req, res) => {
  try {
    const { name, email, phoneno, address } = req.body;
    const user = await User.findById(req.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const updateData = {};
    if (phoneno) {
      updateData.phoneno = phoneno;
    }
    if (name) {
      updateData.name = name;
    }
    if (email) {
      updateData.email = email;
    }

    if (
      address &&
      typeof address === "object" &&
      Object.keys(address).length > 0
    ) {
      updateData.address = address;
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.id,
      { $set: updateData },
      { new: true },
    );
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({
      success: false,
      message: "Error while updating profile",
    });
  }
};
// whishlist
export const getMyWishlistItems = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId).select("wishlist");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      count: user.wishlist.length,
      cart: user.wishlist,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch cart items",
    });
  }
};
// add itme to wishlist
export const addItemToWishlist = async (req, res) => {
  try {
    const userId = req.id;
    const { productId, imageUrl, price, slug, name, description } = req.body;
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "productId is required",
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const existingItem = user.wishlist.find(
      (item) => item.productId.toString() === productId,
    );
    if (existingItem) {
      return res.status(200).json({
        success: true,
        message: "Item already in wishlist",
        wishlist: user.wishlist,
      });
    }
    user.wishlist.push({
      productId,
      imageUrl,
      price,
      slug,
      name,
      description,
    });
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Item added to wishlist",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add item to wishlist",
    });
  }
};

// remove item to wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.id;
    const { productId } = req.body;
    console.log(productId);
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "productId is required",
      });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $pull: {
          wishlist: { productId: productId },
        },
      },
      { new: true },
    ).select("wishlist");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Item removed from wishlist",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove item from wishlist",
    });
  }
};

// clear wihslist
export const clearWishlist = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { wishlist: [] } },
      { new: true },
    ).select("wishlist");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "wishlist cleared successfully",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Clear wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to clear wishlist",
    });
  }
};

// .............................................admin apis...............>
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const totalUsers = await User.countDocuments();
    const users = await User.find({})
      .select("-password -name -email -wishlist  -address")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const totalPages = Math.ceil(totalUsers / limit);
    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
      pagination: {
        totalUsers,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};
export const getSingleUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("Get single user error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};
export const getUserWishlistItems = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }
    const user = await User.findById(userId).select("wishlist");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      cart: user.cart,
      totalItems: user.cart.length,
    });
  } catch (error) {
    console.error("Get cart error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
    });
  }
};
export const SearchUser = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const user = await User.findOne({
      $or: [
        { email: { $regex: q, $options: "i" } },
        { name: { $regex: q, $options: "i" } },
        { phoneno: { $regex: q, $options: "i" } },
      ],
    }).select("_id name email phoneno");

    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};
