import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    propertyType: {
      type: String,
      enum: ["flat", "villa", "plot", "house"],
      required: true,
    },

    listingType: {
      type: String,
      enum: ["rent", "sale"],
      required: true,
    },

    bedrooms: {
      type: Number,
      default: 0,
    },

    bathrooms: {
      type: Number,
      default: 0,
    },

    area: {
      type: Number, // sqft
    },

    furnished: {
      type: String,
      enum: ["furnished", "semi-furnished", "unfurnished"],
    },

    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },

    images: [
      {
        url: String,
        public_id: String,
      },
    ],
    propertyId: {
      type: String,
      unique: true,
    },
    amenities: [
      {
        type: String,
        enum: ["parking", "lift", "gym", "pool", "security", "garden"],
      },
    ],

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["available", "sold", "rented"],
      default: "available",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Property", propertySchema);
