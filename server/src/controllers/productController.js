const { Product, Category } = require("../models/Product");

exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({
      status: "success",
      data: { product }
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    // 1) Filtering
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields", "search"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Advanced filtering (Price ranges etc)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    
    let filter = JSON.parse(queryStr);

    // Search functionality
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } }
      ];
    }

    let query = Product.find(filter).populate("category");

    // 2) Sorting
    if (req.query.sort && req.query.sort !== "") {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      // Default ranking logic: Higher number = Higher priority
      if (filter.category) {
        query = query.sort("-categoryRanking -overallRanking -createdAt");
      } else {
        query = query.sort("-overallRanking -createdAt");
      }
    }

    // 3) Field Limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // 4) Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 12;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // Execute query
    const products = await query;
    const totalCount = await Product.countDocuments(filter);

    res.status(200).json({
      status: "success",
      totalCount,
      results: products.length,
      data: { products }
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) throw new Error("Product not found");
    res.status(200).json({
      status: "success",
      data: { product }
    });
  } catch (err) {
    res.status(404).json({ status: "fail", message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!product) throw new Error("Product not found");
    res.status(200).json({
      status: "success",
      data: { product }
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.updateRankings = async (req, res) => {
  try {
    const { rankings } = req.body;
    if (!rankings || !Array.isArray(rankings)) throw new Error("Rankings array is required");

    const bulkOps = rankings.map(item => {
      const updateData = {};
      if (item.overallRanking !== undefined) updateData.overallRanking = item.overallRanking;
      if (item.categoryRanking !== undefined) updateData.categoryRanking = item.categoryRanking;

      return {
        updateOne: {
          filter: { _id: item._id },
          update: { $set: updateData }
        }
      };
    });

    await Product.bulkWrite(bulkOps);
    res.status(200).json({ status: "success", message: "Product rankings updated" });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};
