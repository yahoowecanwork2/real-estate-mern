import slugify from "slugify";
import { generatePropertyId } from "../utiles/idGerater.js";
import Property from "../models/property.js";

export const createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      propertyType,
      listingType,
      bedrooms,
      bathrooms,
      area,
      furnished,
      address,
      amenities,
    } = req.body;

    // ✅ validation
    if (!title || !price || !propertyType || !listingType) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    // ✅ images from multer
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => ({
        url: file.path, // local path
      }));
    }

    // ✅ generate slug + propertyId
    const slug = slugify(title, { lower: true });
    const propertyId = generatePropertyId(title);

    // ✅ create property
    const property = await Property.create({
      propertyId,
      title,
      slug,
      description,
      price,
      propertyType,
      listingType,
      bedrooms,
      bathrooms,
      area,
      furnished,
      address: address ? JSON.parse(address) : {},
      amenities: amenities ? JSON.parse(amenities) : [],

      images,
      owner: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Property created successfully",
      property,
    });
  } catch (error) {
    console.log("ERROR 👉", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create property",
    });
  }
};
