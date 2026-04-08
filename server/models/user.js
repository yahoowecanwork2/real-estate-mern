import mongoose from "mongoose";
const wishlistItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    price: {
      type: String,
      default: "",
    },
    slug: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
  },
  { _id: false },
);
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    address: {
      locality: { type: String, default: "" },
      city: { type: String, default: "" },
      pinCode: { type: String, default: "" },
      state: { type: String, default: "" },
    },
    image: {
      type: String,
      default: "",
    },
    wishlist: [wishlistItemSchema],
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("Users", userSchema);

export default User;
