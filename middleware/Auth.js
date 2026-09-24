const jwt = require("jsonwebtoken");
const { ApiError } = require("./errorHandler");

// Ye middleware check karta hai ki request ke saath valid JWT token hai ya nahi
// Agar token sahi hai to req.user set ho jaata hai, warna 401 error
function protect(req, res, next) {
  let token;

  // Token "Authorization: Bearer <token>" header mein aata hai
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ApiError(401, "Login zaroori hai - token nahi mila"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id: userId } - controllers mein req.user.id se access hoga
    next();
  } catch (error) {
    return next(new ApiError(401, "Token invalid ya expire ho gaya hai"));
  }
}

module.exports = { protect };