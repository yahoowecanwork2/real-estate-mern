import jwt from "jsonwebtoken";

export const isAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.ACTIVATION_SECRET);

    req.user = decoded; // { id, sessionId }

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    try {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          message: "Access denied",
        });
      }
      next();
    } catch (error) {
      return res.status(500).json({
        message: "Role check failed",
      });
    }
  };
};
