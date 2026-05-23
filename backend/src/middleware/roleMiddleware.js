const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role) || !req.user) {
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
