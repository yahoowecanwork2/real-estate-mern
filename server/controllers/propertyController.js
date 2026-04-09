import slugify from "slugify";
import { generatePropertyId } from "../utiles/idGerater.js";
import Property from "../models/property.js";

// .......................................create..............................>
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
    console.log("ERROR ", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create property",
    });
  }
};
// .........................................getall.............................>
export const getAllProperties = async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;

    const total = await Property.countDocuments();

    const properties = await Property.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      properties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch properties",
    });
  }
};
// ...............................................single...................................>
export const getSingleProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findById(id).populate(
      "owner",
      "name email",
    );

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json({ success: true, property });
  } catch (error) {
    res.status(500).json({ message: "Error fetching property" });
  }
};
// ....................................update...................................>
export const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;

    let property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // 🔐 only owner or admin
    if (
      property.owner.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const updatedData = {
      ...req.body,
    };

    if (req.body.address) {
      updatedData.address =
        typeof req.body.address === "string"
          ? JSON.parse(req.body.address)
          : req.body.address;
    }

    if (req.body.amenities) {
      updatedData.amenities =
        typeof req.body.amenities === "string"
          ? JSON.parse(req.body.amenities)
          : req.body.amenities;
    }

    // images update (optional)
    if (req.files?.length > 0) {
      updatedData.images = req.files.map((file) => ({
        url: file.path,
      }));
    }

    property = await Property.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "Property updated",
      property,
    });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};
// .........................................delete............................................>
export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // 🔐 only owner or admin
    if (
      property.owner.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await property.deleteOne();

    res.status(200).json({
      success: true,
      message: "Property deleted",
    });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};
// ...........................................search................................>
export const searchProperties = async (req, res) => {
  try {
    const {
      search,
      propertyType,
      listingType,
      city,
      minPrice,
      maxPrice,
      bedrooms,
      furnished,
      amenities,
      page = 1,
      limit = 5,
    } = req.body;

    const query = {};

    // 🔍 search (title + description)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // 🎯 filters
    if (propertyType) query.propertyType = propertyType;
    if (listingType) query.listingType = listingType;
    if (city) query["address.city"] = city;
    if (bedrooms) query.bedrooms = Number(bedrooms);
    if (furnished) query.furnished = furnished;

    // 💰 price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // 🧩 amenities filter (array match)
    if (amenities && amenities.length > 0) {
      query.amenities = { $all: amenities };
    }

    // 📊 pagination
    const total = await Property.countDocuments(query);

    const properties = await Property.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      properties,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Search failed",
    });
  }
};
// ................................................filterproperties..........................>
export const filterProperties = async (req, res) => {
  try {
    const { furnished, propertyType, listingType, city } = req.body;

    const query = {};

    // 🎯 filters
    if (furnished) query.furnished = furnished;
    if (propertyType) query.propertyType = propertyType;
    if (listingType) query.listingType = listingType;
    if (city) query["address.city"] = city;

    const properties = await Property.find(query).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Filter failed",
    });
  }
};
// ....................................................status...........................>
export const updatePropertyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (
      property.owner.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    property.status = status;
    await property.save();

    res.status(200).json({
      success: true,
      message: "Status updated",
      property,
    });
  } catch (error) {
    res.status(500).json({ message: "Status update failed" });
  }
};
// ..............................stats.......................................>
export const getAdminStats = async (req, res) => {
  try {
    const totalProperties = await Property.countDocuments();

    const available = await Property.countDocuments({ status: "available" });
    const sold = await Property.countDocuments({ status: "sold" });
    const rented = await Property.countDocuments({ status: "rented" });

    res.status(200).json({
      success: true,
      stats: {
        totalProperties,
        status: {
          available,
          sold,
          rented,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch stats",
    });
  }
};
// ......................................status button................>
export const getPropertiesByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    // ✅ valid check (optional but good)
    const validStatus = ["available", "sold", "rented"];

    if (!validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const properties = await Property.find({ status }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch properties",
    });
  }
};
