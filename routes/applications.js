const router  = require('express').Router();
const multer  = require('multer');
const path    = require('path');
const { Application } = require('../models/models');
const Job     = require('../models/Job');
const { protect, restrict } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, process.env.UPLOAD_DIR || 'uploads'),
  filename:    (req, file, cb) => cb(null, `resume-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
  limits: { fileSize: (Number(process.env.MAX_FILE_SIZE_MB)||5) * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    ['.pdf','.doc','.docx'].includes(path.extname(file.originalname).toLowerCase()) ? cb(null, true) : cb(new Error('Only PDF/DOC/DOCX'));
  },
});

// POST /api/applications
router.post('/', protect, upload.single('resume'), async (req, res) => {
  try {
    const { jobId, name, email, phone, coverLetter } = req.body;
    const job = await Job.findById(jobId);
    if (!job || job.status !== 'active') return res.status(400).json({ success: false, message: 'Job not available' });
    if (await Application.findOne({ job: jobId, user: req.user._id }))
      return res.status(400).json({ success: false, message: 'Already applied' });
    const app = await Application.create({ job: jobId, user: req.user._id, name, email, phone, coverLetter, resume: req.file?.filename || '' });
    await Job.findByIdAndUpdate(jobId, { $inc: { applications: 1 } });
    res.status(201).json({ success: true, application: app });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// GET /api/applications/mine
router.get('/mine', protect, async (req, res) => {
  try {
    const apps = await Application.find({ user: req.user._id }).populate('job','title company type salary lastDate').sort('-createdAt');
    res.json({ success: true, applications: apps });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/applications (admin)
router.get('/', protect, restrict('admin'), async (req, res) => {
  try {
    const { status, page=1, limit=20 } = req.query;
    const filter = status ? { status } : {};
    const skip = (Number(page)-1)*Number(limit);
    const total = await Application.countDocuments(filter);
    const apps  = await Application.find(filter).populate('job','title company').populate('user','name email').sort('-createdAt').skip(skip).limit(Number(limit));
    res.json({ success: true, total, applications: apps });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PATCH /api/applications/:id (admin)
router.patch('/:id', protect, restrict('admin'), async (req, res) => {
  try {
    const app = await Application.findByIdAndUpdate(req.params.id, { status: req.body.status, notes: req.body.notes }, { new: true });
    if (!app) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, application: app });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

module.exports = router;
