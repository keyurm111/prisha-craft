const Slider = require("../models/Slider");

exports.getAllSliders = async (req, res) => {
  try {
    const sliders = await Slider.find().sort("order");
    res.status(200).json({
      status: "success",
      results: sliders.length,
      data: { sliders }
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.createSlider = async (req, res) => {
  try {
    const newSlider = await Slider.create(req.body);
    res.status(201).json({
      status: "success",
      data: { slider: newSlider }
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.updateSlider = async (req, res) => {
  try {
    const slider = await Slider.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!slider) {
      return res.status(404).json({ status: "fail", message: "Slider not found" });
    }
    res.status(200).json({
      status: "success",
      data: { slider }
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.deleteSlider = async (req, res) => {
  try {
    const slider = await Slider.findByIdAndDelete(req.params.id);
    if (!slider) {
      return res.status(404).json({ status: "fail", message: "Slider not found" });
    }
    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};
