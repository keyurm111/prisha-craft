const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  try {
    // 1) Getting token and check if it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "You are not logged in! Please log in to get access."
      });
    }

    // 2) Verification token
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET is not defined in environment variables");
      return res.status(500).json({
        status: "error",
        message: "Internal server configuration error"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: "fail",
        message: "The user belonging to this token no longer exists."
      });
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  } catch (err) {
    // Only log unexpected errors, not standard auth failures like "invalid signature"
    if (err.name !== 'JsonWebTokenError' && err.name !== 'TokenExpiredError') {
      console.error("❌ Auth System Error:", err.message);
    }
    res.status(401).json({
      status: "fail",
      message: `Authentication failed: ${err.message}`
    });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to perform this action"
      });
    }

    next();
  };
};
