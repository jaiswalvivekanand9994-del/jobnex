const router  = require('express').Router();
const { body, validationResult } = require('express-validator');
const Job     = require('../models/Job');
const { protect, restrict } = require('../middleware/auth');

// GET /api/jobs
router.get('/', async (req, res) => {
  try {
    const { q, type, category, location, salary, featured, pwd, remote, fresher, page=1, limit=12, sort='-createdAt' } = req.query;
    const filter = { status: 'active', lastDate: { $gte: new Date() } };
    if (q)        filter.$text = { $search: q };
    if (type)     filter.type = type;
    if (category) filter.category = new RegExp(category, 'i');
    if (location) filter.location = new RegExp(location, 'i');
    if (featured === 'true') filter.isFeatured = true;
    if (pwd      === 'true') filter.isPwdFriendly = true;
    if (remote   === 'true') filter.isRemote = true;
    if (fresher  === 'true') filter.experience = 'Fresher';
    if (salary === 'low')  filter.salaryMax = { $lte: 500000 };
    if (salary === 'mid')  { filter.salaryMin = { $gte: 500000 }; filter.salaryMax = { $lte: 1500000 }; }
    if (salary === 'high') filter.salaryMin = { $gte: 1500000 };
    const skip  = (Number(page)-1) * Number(limit);
    const total = await Job.countDocuments(filter);
    const jobs  = await Job.find(filter).sort(sort).skip(skip).limit(Number(limit)).select('-__v');
    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total/Number(limit)), jobs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/jobs/stats/summary
router.get('/stats/summary', protect, restrict('admin'), async (req, res) => {
  try {
    const [total, govt, pvt, featured, expiring] = await Promise.all([
      Job.countDocuments({ status: 'active' }),
      Job.countDocuments({ type: 'govt', status: 'active' }),
      Job.countDocuments({ type: 'private', status: 'active' }),
      Job.countDocuments({ isFeatured: true, status: 'active' }),
      Job.countDocuments({ lastDate: { $lte: new Date(Date.now()+3*86400000), $gte: new Date() } }),
    ]);
    res.json({ success: true, total, govt, pvt, featured, expiring });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/jobs/:id
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    await Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ success: true, job });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/jobs
router.post('/', protect, restrict('admin','employer'), [
  body('title').notEmpty(), body('company').notEmpty(),
  body('type').isIn(['govt','private']), body('description').notEmpty(),
  body('lastDate').isISO8601(),
], async (req, res) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return res.status(400).json({ success: false, errors: errs.array() });
  try {
    const job = await Job.create({ ...req.body, postedBy: req.user._id });
    res.status(201).json({ success: true, job });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// PATCH /api/jobs/:id
router.patch('/:id', protect, restrict('admin','employer'), async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, job });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// DELETE /api/jobs/:id
router.delete('/:id', protect, restrict('admin'), async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Job deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/jobs/bulk
router.post('/bulk', protect, restrict('admin'), async (req, res) => {
  try {
    const { ids, action } = req.body;
    if (!ids || !ids.length) return res.status(400).json({ success: false, message: 'No IDs provided' });
    if (action === 'delete') { await Job.deleteMany({ _id: { $in: ids } }); return res.json({ success: true, message: ids.length+' jobs deleted' }); }
    const updates = { approve:{status:'active'}, feature:{isFeatured:true}, unfeature:{isFeatured:false}, expire:{status:'expired'} };
    const result = await Job.updateMany({ _id: { $in: ids } }, updates[action] || {});
    res.json({ success: true, modified: result.modifiedCount });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
