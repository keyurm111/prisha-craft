const Testimonial = require("../models/Testimonial");

exports.getAllTestimonials = async (req, res) => {
  try {
    const filter = {};
    if (req.query.featured !== undefined) {
      filter.featured = req.query.featured === "true";
    }
    const testimonials = await Testimonial.find(filter).sort("order -createdAt");
    res.status(200).json({
      status: "success",
      results: testimonials.length,
      data: { testimonials }
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.getTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ status: "fail", message: "Testimonial not found" });
    }
    res.status(200).json({
      status: "success",
      data: { testimonial }
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.createTestimonial = async (req, res) => {
  try {
    const newTestimonial = await Testimonial.create(req.body);
    res.status(201).json({
      status: "success",
      data: { testimonial: newTestimonial }
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!testimonial) {
      return res.status(404).json({ status: "fail", message: "Testimonial not found" });
    }
    res.status(200).json({
      status: "success",
      data: { testimonial }
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ status: "fail", message: "Testimonial not found" });
    }
    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};
