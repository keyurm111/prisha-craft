const User = require("../models/User");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort("-createdAt");

    res.status(200).json({
      status: "success",
      results: users.length,
      data: {
        users
      }
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message
    });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const { name, phone, shippingAddress } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, shippingAddress },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser
      }
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message
    });
  }
};
