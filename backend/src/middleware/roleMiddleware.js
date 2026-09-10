const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    // B18: check req.user existence first — accessing .role on undefined crashes
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        status: "failed",
        message: "forbidden access",
      });
    }else{
        next()
    }
  };
};

module.exports = roleMiddleware
