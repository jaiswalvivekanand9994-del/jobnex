require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('../models/User');
const Job      = require('../models/Job');
const { News } = require('../models/models');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([User.deleteMany(), Job.deleteMany(), News.deleteMany()]);
  console.log('🗑  Cleared existing data');

  // ── Create Admin User ──────────────────────────────────────────────────────
  const admin = await User.create({
    name:     'Super Admin',
    email:    process.env.ADMIN_EMAIL || 'admin@jobsindia.ai',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    role:     'admin',
    plan:     'enterprise',
  });
  console.log(`👤 Admin created: ${admin.email}`);

  // ── Seed Jobs ──────────────────────────────────────────────────────────────
  const jobs = await Job.insertMany([
    { title:'Senior Software Engineer', company:'TechMahindra', logo:'T', color:'#FF6B2B', type:'private', category:'IT', location:'Pune, Maharashtra', salary:'₹18–28 LPA', salaryMin:1800000, salaryMax:2800000, experience:'3–6 Years', education:'B.Tech/MCA', description:'Build scalable backend systems using Java & Microservices for enterprise clients globally.', skills:['Java','Spring Boot','AWS','Microservices'], lastDate:new Date(Date.now()+30*86400000), badges:['new','open'], status:'active', views:4240, applications:58, postedBy:admin._id },
    { title:'IBPS PO 2025 — Probationary Officer', company:'IBPS', logo:'B', color:'#0A3D62', type:'govt', category:'Banking', location:'Pan India', salary:'₹52,000/month', salaryMin:624000, salaryMax:624000, experience:'Fresher', education:'Any Graduate', description:'Join public sector banks as Probationary Officer. Job security, pension and DA benefits included.', skills:['Reasoning','English','Quant','Banking GK'], lastDate:new Date(Date.now()+45*86400000), badges:['govt','urgent'], status:'active', views:18400, applications:4200, postedBy:admin._id },
    { title:'UX Designer', company:'Flipkart', logo:'F', color:'#FF6B2B', type:'private', category:'IT', location:'Bangalore, KA', salary:'₹12–20 LPA', salaryMin:1200000, salaryMax:2000000, experience:'2–4 Years', education:'BDes/B.Tech', description:'Design beautiful, accessible user experiences for 300M+ Indian shoppers on Flipkart.', skills:['Figma','User Research','Prototyping','Design Systems'], lastDate:new Date(Date.now()+14*86400000), badges:['new','open'], status:'active', views:3120, applications:90, postedBy:admin._id },
    { title:'RRB NTPC — Graduate Level Posts', company:'Railway Recruitment Board', logo:'R', color:'#0EA5E9', type:'govt', category:'Railways', location:'All Zones', salary:'₹19,900–35,400/month', salaryMin:238800, salaryMax:424800, experience:'Fresher', education:'Any Graduate', description:'Join Indian Railways for a secure government career. 35,208 vacancies across 21 railway zones.', skills:['General Awareness','Maths','Reasoning'], lastDate:new Date(Date.now()+60*86400000), badges:['govt','new'], status:'active', views:24100, applications:8400, postedBy:admin._id },
    { title:'Product Manager — Payments', company:'Paytm', logo:'P', color:'#00B3A8', type:'private', category:'Finance', location:'Noida, UP', salary:'₹20–35 LPA', salaryMin:2000000, salaryMax:3500000, experience:'4–7 Years', education:'MBA/B.Tech', description:'Lead product strategy for India\'s largest digital payments platform. Own roadmap from 0 to 1.', skills:['Product Strategy','SQL','Analytics','UX'], lastDate:new Date(Date.now()+17*86400000), badges:['open'], status:'active', views:2890, applications:42, postedBy:admin._id },
    { title:'SSC CGL 2025 — Combined Graduate Level', company:'Staff Selection Commission', logo:'S', color:'#00B96B', type:'govt', category:'Central Govt', location:'Pan India', salary:'₹25,500–81,100/month', salaryMin:306000, salaryMax:973200, experience:'Fresher', education:'Any Graduate', description:'Recruitment to Group B and C posts under central govt. 17,727 total vacancies announced.', skills:['General Studies','English','Maths','Reasoning'], lastDate:new Date(Date.now()+70*86400000), badges:['govt','open'], status:'active', views:32400, applications:12400, postedBy:admin._id },
    { title:'Data Scientist — AI/ML', company:'Infosys', logo:'I', color:'#8B5CF6', type:'private', category:'IT', location:'Hyderabad, TS', salary:'₹15–25 LPA', salaryMin:1500000, salaryMax:2500000, experience:'2–5 Years', education:'B.Tech/M.Tech', description:'Work on cutting-edge ML models for Fortune 500 clients. TensorFlow, PyTorch and cloud experience preferred.', skills:['Python','TensorFlow','SQL','Statistics'], lastDate:new Date(Date.now()+24*86400000), badges:['new','open'], status:'active', views:5610, applications:124, isPwdFriendly:true, postedBy:admin._id },
    { title:'UPSC Civil Services 2025', company:'Union Public Service Commission', logo:'U', color:'#F43F5E', type:'govt', category:'UPSC', location:'Pan India', salary:'₹56,100–2,50,000/month', salaryMin:673200, salaryMax:3000000, experience:'Fresher', education:'Any Graduate (21–32 yrs)', description:'India\'s most prestigious exam. IAS, IPS, IFS and 24 allied services. Join the All India Services.', skills:['GS Paper I-IV','Essay','CSAT','Optional Subject'], lastDate:new Date(Date.now()+82*86400000), badges:['govt','urgent'], status:'active', views:48200, applications:18400, postedBy:admin._id },
    { title:'HR Business Partner', company:'Wipro Ltd.', logo:'W', color:'#FF6B2B', type:'private', category:'Management', location:'Chennai, TN', salary:'₹8–14 LPA', salaryMin:800000, salaryMax:1400000, experience:'3–5 Years', education:'MBA (HR)', description:'Support 5000+ employee HR operations. Drive talent acquisition, engagement and L&D strategies.', skills:['HR Analytics','Recruitment','Labor Law','HRIS'], lastDate:new Date(Date.now()+29*86400000), badges:['open'], status:'active', views:1840, applications:28, postedBy:admin._id },
    { title:'Army Technical Entry — 10+2 TES', company:'Indian Army', logo:'⚔', color:'#16A34A', type:'govt', category:'Defence', location:'Pan India', salary:'₹56,100/month + allowances', salaryMin:673200, salaryMax:673200, experience:'Fresher', education:'10+2 PCM 70%+', description:'Join Indian Army as an officer through Technical Entry Scheme. 90 vacancies for PCM students.', skills:['PCM','Physical Fitness','Determination'], lastDate:new Date(Date.now()+9*86400000), badges:['govt','closing'], status:'active', views:8920, applications:2840, postedBy:admin._id },
    { title:'Content Writer — Hindi & English', company:'Dainik Jagran Digital', logo:'D', color:'#F43F5E', type:'private', category:'Media', location:'Delhi NCR', salary:'₹4–7 LPA', salaryMin:400000, salaryMax:700000, experience:'1–3 Years', education:'BA/MA Journalism', description:'Write engaging news articles and digital content in Hindi and English for India\'s largest newspaper.', skills:['Hindi Writing','SEO','MS Word','Research'], lastDate:new Date(Date.now()+11*86400000), badges:['new','open'], status:'active', views:920, applications:14, postedBy:admin._id },
    { title:'NABARD Grade A Officer 2025', company:'NABARD', logo:'N', color:'#0EA5E9', type:'govt', category:'Banking', location:'Pan India', salary:'₹44,500/month', salaryMin:534000, salaryMax:534000, experience:'Fresher', education:'Any Graduate', description:'National Bank for Agriculture and Rural Development Officer recruitment. 152 posts across disciplines.', skills:['Economics','Agriculture','Finance','GK'], lastDate:new Date(Date.now()+44*86400000), badges:['govt','new'], status:'active', views:6200, applications:1240, postedBy:admin._id },
  ]);
  console.log(`💼 ${jobs.length} jobs seeded`);

  // ── Seed News ──────────────────────────────────────────────────────────────
  const news = await News.insertMany([
    { title:'SSC CGL 2025 Official Notification Released', tag:'Notification', emoji:'📋', bg:'linear-gradient(135deg,#0A3D62,#1A5C9A)', description:'SSC has released official notification for CGL 2025. Total 17,727 vacancies announced across departments.', category:'notification', status:'published', postedBy:admin._id },
    { title:'IBPS PO 2025 Online Application Starts', tag:'Apply Now', emoji:'🏦', bg:'linear-gradient(135deg,#1A5C9A,#2E86C1)', description:'IBPS Probationary Officer recruitment for 4,455 posts in public sector banks. Apply before Jul 15.', category:'notification', status:'published', postedBy:admin._id },
    { title:'RRB NTPC Result 2025 — Direct Link', tag:'Result', emoji:'📊', bg:'linear-gradient(135deg,#00B96B,#00876A)', description:'Railway Recruitment Board has published NTPC CBT 1 result. Check your roll number on the official site.', category:'result', status:'published', postedBy:admin._id },
    { title:'UPSC Civil Services 2025 Prelims Admit Card', tag:'Admit Card', emoji:'🎫', bg:'linear-gradient(135deg,#F43F5E,#BE185D)', description:'UPSC CSE 2025 Prelims admit card available. Exam on June 22. Download from upsc.gov.in.', category:'admit-card', status:'published', postedBy:admin._id },
    { title:'Top 10 Tips to Crack Government Job Interviews', tag:'Career Tip', emoji:'💡', bg:'linear-gradient(135deg,#FF6B2B,#FF8C55)', description:'Expert tips from IAS/IPS toppers on how to ace government job interviews in 2025.', category:'career-tip', status:'published', postedBy:admin._id },
    { title:'SBI Clerk 2025 Answer Key Released', tag:'Answer Key', emoji:'📝', bg:'linear-gradient(135deg,#8B5CF6,#6D28D9)', description:'State Bank of India has released the official answer key for Clerk exam held on June 2, 2025.', category:'answer-key', status:'published', postedBy:admin._id },
  ]);
  console.log(`📰 ${news.length} news articles seeded`);

  console.log('\n✅ Database seeded successfully!');
  console.log(`\n🔑 Admin login:`);
  console.log(`   Email:    ${admin.email}`);
  console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'admin123'}\n`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
