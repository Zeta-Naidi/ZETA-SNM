const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token non fornito" });
  }

  // Verifica il token
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token non valido" });
    }

    req.user = decoded;
    next();
  });
}

module.exports = verifyToken;
