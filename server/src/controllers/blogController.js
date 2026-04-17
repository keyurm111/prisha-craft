const Blog = require("../models/Blog");

// @desc    Get all blogs
// @route   GET /api/v1/blogs
// @access  Public
exports.getAllBlogs = async (req, res) => {
  try {
    const { status, featured } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (featured) query.featured = featured === 'true';

    const blogs = await Blog.find(query).sort({ publishedAt: -1 });

    res.status(200).json({
      status: "success",
      results: blogs.length,
      data: {
        blogs
      }
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message
    });
  }
};

// @desc    Get single blog by slug or ID
// @route   GET /api/v1/blogs/:id
// @access  Public
exports.getBlog = async (req, res) => {
  try {
    const blog = await Blog.findOne({
      $or: [
        { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null },
        { slug: req.params.id }
      ].filter(cond => cond !== null)
    });

    if (!blog) {
      return res.status(404).json({
        status: "fail",
        message: "No blog found with that ID or slug"
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        blog
      }
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message
    });
  }
};

// @desc    Create new blog
// @route   POST /api/v1/blogs
// @access  Private/Admin
exports.createBlog = async (req, res) => {
  try {
    const newBlog = await Blog.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        blog: newBlog
      }
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message
    });
  }
};

// @desc    Update blog
// @route   PATCH /api/v1/blogs/:id
// @access  Private/Admin
exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!blog) {
      return res.status(404).json({
        status: "fail",
        message: "No blog found with that ID"
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        blog
      }
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message
    });
  }
};

// @desc    Delete blog
// @route   DELETE /api/v1/blogs/:id
// @access  Private/Admin
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({
        status: "fail",
        message: "No blog found with that ID"
      });
    }

    res.status(204).json({
      status: "success",
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message
    });
  }
};
