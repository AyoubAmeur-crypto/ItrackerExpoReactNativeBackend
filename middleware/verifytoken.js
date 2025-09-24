const jwt = require('jsonwebtoken')


const verifyToken = (req, res, next) => {
    const token = req.cookies.token
  
    if (!token) {
      return res.status(401).json("Access Denied. No token provided.");
    }
  
    try {
      const verified = jwt.verify(token, process.env.SESSION_KEY);
      req.user = verified; 
      next();
    } catch (err) {
      return res.status(403).json("Invalid Token");
    }
  };


  module.exports = verifyToken