const router  = require('express').Router();
const jwt     = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
const sendToken = (user, code, res) => res.status(code).json({
  success: true,
  token: signToken(user._id),
  user: { id: user._id, name: user.name, email: user.email, role: user.role, plan: user.plan },
});

// POST /api/auth/register
router.post('/register', [
  body('name').trim().notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
], async (req, res) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return res.status(400).json({ success: false, errors: errs.array() });
  try {
    if (await User.findOne({ email: req.body.email }))
      return res.status(400).json({ success: false, message: 'Email already registered' });
    const user = await User.create(req.body);
    sendToken(user, 201, res);
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/auth/login
router.post('/login', [body('email').isEmail(), body('password').notEmpty()], async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select('+password');
    if (!user || !(await user.comparePassword(req.body.password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account suspended' });
    user.lastLogin = new Date(); await user.save({ validateBeforeSave: false });
    sendToken(user, 200, res);
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => res.json({ success: true, user: req.user }));

// PATCH /api/auth/me
router.patch('/me', protect, async (req, res) => {
  try {
    const allowed = ['name','phone','state','skills','education','experience','whatsappOptIn','pushOptIn'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// POST /api/auth/change-password
router.post('/change-password', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(req.body.currentPassword)))
      return res.status(400).json({ success: false, message: 'Current password incorrect' });
    user.password = req.body.newPassword; await user.save();
    sendToken(user, 200, res);
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

module.exports = router;
