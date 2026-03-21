const jwt = require("jsonwebtoken");

exports.authenticateToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token manquant" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalide" });
  }
};

exports.authenticate = exports.authenticateToken; // Alias pour compatibilité

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Accès refusé" });
    }
    next();
  };
};

// Middleware pour vérifier si l'utilisateur est admin
exports.isAdmin = (req, res, next) => {
  // Accepter ADMIN_MESRS ou ADMIN
  if (req.user.role !== "ADMIN_MESRS" && req.user.role !== "ADMIN") {
    return res.status(403).json({ 
      message: "Accès refusé. Seuls les administrateurs peuvent effectuer cette action.",
      userRole: req.user.role // Pour debug
    });
  }
  next();
};

// Alias pour requireAdmin
exports.requireAdmin = exports.isAdmin;
