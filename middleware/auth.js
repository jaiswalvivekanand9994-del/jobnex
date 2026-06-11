const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer '))
      token = req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Not authorised' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user || !req.user.isActive) return res.status(401).json({ success: false, message: 'User inactive' });
    next();
  } catch (err) { return res.status(401).json({ success: false, message: 'Token invalid' }); }
};

const restrict = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ success: false, message: `Role ${req.user.role} not allowed` });
  next();
};

const requirePlan = (...plans) => (req, res, next) => {
  if (!plans.includes(req.user.plan))
    return res.status(403).json({ success: false, message: 'Upgrade plan to access this', upgrade: true });
  next();
};

module.exports = { protect, restrict, requirePlan };
