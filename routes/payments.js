const router   = require('express').Router();
const Razorpay = require('razorpay');
const crypto   = require('crypto');
const { Payment } = require('../models/models');
const User     = require('../models/User');
const { protect, restrict } = require('../middleware/auth');

const rzp = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });

const PLANS = {
  pro:          { amount: 29900,  desc: 'Pro Plan — 1 Month' },
  enterprise:   { amount: 499900, desc: 'Enterprise Plan — 1 Month' },
  job_basic:    { amount: 99900,  desc: 'Basic Job Listing — 30 days' },
  job_featured: { amount: 299900, desc: 'Featured Job Listing' },
  job_hot:      { amount: 499900, desc: 'Hot Job Listing + Blast' },
};

// POST /api/payments/create-order
router.post('/create-order', protect, async (req, res) => {
  try {
    const plan = PLANS[req.body.plan];
    if (!plan) return res.status(400).json({ success: false, message: 'Invalid plan' });
    const order = await rzp.orders.create({ amount: plan.amount, currency: 'INR', receipt: `rcpt_${req.user._id}_${Date.now()}`, notes: { userId: req.user._id.toString(), plan: req.body.plan } });
    const payment = await Payment.create({ user: req.user._id, orderId: order.id, amount: plan.amount, plan: req.body.plan, receipt: order.receipt });
    res.json({ success: true, orderId: order.id, amount: plan.amount, currency: 'INR', keyId: process.env.RAZORPAY_KEY_ID, desc: plan.desc });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/payments/verify
router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(razorpay_order_id+'|'+razorpay_payment_id).digest('hex');
    if (expected !== razorpay_signature) return res.status(400).json({ success: false, message: 'Verification failed' });
    const payment = await Payment.findOneAndUpdate({ orderId: razorpay_order_id }, { paymentId: razorpay_payment_id, status: 'paid', method: 'razorpay' }, { new: true });
    if (payment && ['pro','enterprise'].includes(payment.plan)) {
      const expiry = new Date(); expiry.setMonth(expiry.getMonth()+1);
      await User.findByIdAndUpdate(payment.user, { plan: payment.plan, planExpiry: expiry });
    }
    res.json({ success: true, message: 'Payment verified', payment });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/payments/mine
router.get('/mine', protect, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id, status: 'paid' }).sort('-createdAt');
    res.json({ success: true, payments });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/payments (admin)
router.get('/', protect, restrict('admin'), async (req, res) => {
  try {
    const { page=1, limit=20 } = req.query;
    const skip = (Number(page)-1)*Number(limit);
    const total = await Payment.countDocuments({ status: 'paid' });
    const payments = await Payment.find({ status: 'paid' }).populate('user','name email').sort('-createdAt').skip(skip).limit(Number(limit));
    res.json({ success: true, total, payments });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
