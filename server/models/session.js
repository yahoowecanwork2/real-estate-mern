import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: [true, "useris required"],
    },
    refreshTokenHash: {
      type: String,
      required: [true, "refresh token hash is required"],
    },
    ip: {
      type: String,
      required: [true, "Ip address is required"],
    },
    userAgent: {
      type: String,
      required: [true, "user agent is required"],
    },
    revoked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);
const sessionModal = mongoose.model("Session", sessionSchema);
export default sessionModal;
