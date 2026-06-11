const router  = require('express').Router();
const User    = require('../models/User');
const Job     = require('../models/Job');
const { Application, Payment, News } = require('../models/models');
const { protect, restrict } = require('../middleware/auth');

router.use(protect, restrict('admin'));

// GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const dayAgo  = new Date(Date.now()-86400000);
    const weekAgo = new Date(Date.now()-7*86400000);
    const [totalJobs,totalUsers,totalApps,newUsersToday,appsToday,paidPayments,proSubs,entSubs,pendingApps,jobsByCategory,appsChart] = await Promise.all([
      Job.countDocuments({ status:'active' }),
      User.countDocuments({ role:'user' }),
      Application.countDocuments(),
      User.countDocuments({ createdAt: { $gte: dayAgo } }),
      Application.countDocuments({ createdAt: { $gte: dayAgo } }),
      Payment.aggregate([{ $match:{ status:'paid' } },{ $group:{ _id:null, total:{ $sum:'$amount' } } }]),
      User.countDocuments({ plan:'pro' }),
      User.countDocuments({ plan:'enterprise' }),
      Application.countDocuments({ status:'pending' }),
      Job.aggregate([{ $match:{ status:'active' } },{ $group:{ _id:'$category', count:{ $sum:1 } } },{ $sort:{ count:-1 } },{ $limit:8 }]),
      Application.aggregate([{ $match:{ createdAt:{ $gte:weekAgo } } },{ $group:{ _id:{ $dateToString:{ format:'%Y-%m-%d', date:'$createdAt' } }, count:{ $sum:1 } } },{ $sort:{ _id:1 } }]),
    ]);
    res.json({ success:true, stats:{ totalJobs,totalUsers,totalApps,newUsersToday,appsToday, revenueTotal:Math.round((paidPayments[0]?.total||0)/100), proSubs,entSubs,pendingApps }, jobsByCategory, appsChart });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { page=1, limit=20, role, plan, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (plan) filter.plan = plan;
    if (search) filter.$or = [{ name:new RegExp(search,'i') },{ email:new RegExp(search,'i') }];
    const skip  = (Number(page)-1)*Number(limit);
    const total = await User.countDocuments(filter);
    const users = await User.find(filter).sort('-createdAt').skip(skip).limit(Number(limit));
    res.json({ success:true, total, users });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
});

// PATCH /api/admin/users/:id
router.patch('/users/:id', async (req, res) => {
  try {
    const allowed = ['role','plan','planExpiry','isActive'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new:true });
    if (!user) return res.status(404).json({ success:false, message:'User not found' });
    res.json({ success:true, user });
  } catch (err) { res.status(400).json({ success:false, message:err.message }); }
});

// GET /api/admin/analytics
router.get('/analytics', async (req, res) => {
  try {
    const days = Number(req.query.days)||30;
    const from = new Date(Date.now()-days*86400000);
    const [userGrowth,appTrend,revenueTrend,topJobs] = await Promise.all([
      User.aggregate([{ $match:{ createdAt:{ $gte:from } } },{ $group:{ _id:{ $dateToString:{ format:'%Y-%m-%d', date:'$createdAt' } }, count:{ $sum:1 } } },{ $sort:{ _id:1 } }]),
      Application.aggregate([{ $match:{ createdAt:{ $gte:from } } },{ $group:{ _id:{ $dateToString:{ format:'%Y-%m-%d', date:'$createdAt' } }, count:{ $sum:1 } } },{ $sort:{ _id:1 } }]),
      Payment.aggregate([{ $match:{ status:'paid', createdAt:{ $gte:from } } },{ $group:{ _id:{ $dateToString:{ format:'%Y-%m-%d', date:'$createdAt' } }, total:{ $sum:'$amount' } } },{ $sort:{ _id:1 } }]),
      Job.find({ status:'active' }).sort('-views').limit(10).select('title company views applications'),
    ]);
    res.json({ success:true, userGrowth, appTrend, revenueTrend, topJobs });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
});

// News CRUD
router.get('/news', async (req, res) => {
  try { res.json({ success:true, news: await News.find().sort('-createdAt').limit(50) }); }
  catch (err) { res.status(500).json({ success:false, message:err.message }); }
});
router.post('/news', async (req, res) => {
  try { res.status(201).json({ success:true, article: await News.create({ ...req.body, postedBy: req.user._id }) }); }
  catch (err) { res.status(400).json({ success:false, message:err.message }); }
});
router.delete('/news/:id', async (req, res) => {
  try { await News.findByIdAndDelete(req.params.id); res.json({ success:true, message:'Deleted' }); }
  catch (err) { res.status(500).json({ success:false, message:err.message }); }
});

// GET /api/admin/export/jobs (CSV)
router.get('/export/jobs', async (req, res) => {
  try {
    const jobs = await Job.find({ status:'active' }).select('title company type category location salary lastDate views applications createdAt');
    const csv = 'Title,Company,Type,Category,Location,Salary,Last Date,Views,Applications,Posted\n' +
      jobs.map(j => `"${j.title}","${j.company}","${j.type}","${j.category}","${j.location}","${j.salary}","${j.lastDate?.toISOString().split('T')[0]}",${j.views},${j.applications},"${j.createdAt.toISOString().split('T')[0]}"`).join('\n');
    res.setHeader('Content-Type','text/csv');
    res.setHeader('Content-Disposition','attachment; filename="multijobindia-jobs.csv"');
    res.send(csv);
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
});

module.exports = router;
