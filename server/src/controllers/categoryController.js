const { Category } = require("../models/Product");

exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({
      status: "success",
      data: { category }
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort("-ranking name");
    res.status(200).json({
      status: "success",
      results: categories.length,
      data: { categories }
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!category) throw new Error("Category not found");
    res.status(200).json({
      status: "success",
      data: { category }
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.updateRankings = async (req, res) => {
  try {
    const { rankings } = req.body;
    if (!rankings || !Array.isArray(rankings)) throw new Error("Rankings array is required");

    const bulkOps = rankings.map(item => ({
      updateOne: {
        filter: { _id: item._id },
        update: { $set: { ranking: item.ranking } }
      }
    }));

    await Category.bulkWrite(bulkOps);
    res.status(200).json({ status: "success", message: "Category rankings updated" });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};
