const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

module.exports.authUser = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    // console.log("token :  ", token);

    if (!token && req.headers?.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        errors: [{ msg: "Unauthorized, No token provided" }],
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded._id);
    if (!user) {
      return res.status(404).json({
        errors: [{ msg: "User not found" }],
      });
    }

    req.user = user; // Attach user to request object
    next(); // Proceed to next middleware or route handler
  } catch (error) {
    console.log("Error while authenticating user:", error.message);
    res.status(500).json({
      errors: [{ msg: `Authentication failed  ${error.message}` }],
    });
  }
};
