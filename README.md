# 🇮🇳 JobNex.in — AI-Powered Job Portal

Full-stack SaaS job portal built with Node.js + MongoDB + HTML/CSS/JS.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — add your MONGO_URI

# 3. Seed database
npm run seed

# 4. Start server
npm run dev
```

## 🌐 URLs
| | URL |
|---|---|
| Public Site | http://localhost:3000 |
| Admin Panel | http://localhost:3000/admin |
| Admin Login | http://localhost:3000/admin/login |
| API Health  | http://localhost:3000/api/health |

## 🔑 Admin Login
- Email: `pappdeaf081@gmail.com`
- Password: `pappdeaf081`

## 📁 Structure
```
jobnex-final/
├── public/index.html    ← Full frontend (264KB)
├── server.js            ← Express entry point
├── package.json
├── .env.example         ← Copy to .env
├── config/db.js         ← MongoDB connection
├── middleware/auth.js   ← JWT + role guard
├── models/
│   ├── User.js
│   ├── Job.js
│   └── models.js        ← Application, Payment, News
├── routes/
│   ├── auth.js          ← Register, login, profile
│   ├── jobs.js          ← CRUD + search + filters
│   ├── applications.js  ← Apply + resume upload
│   ├── payments.js      ← Razorpay integration
│   ├── admin.js         ← Dashboard, analytics
│   └── notifications.js ← Email + WhatsApp
├── scripts/seed.js      ← Seeds 12 jobs + admin
└── uploads/             ← Resume file uploads
```

## 🔌 API Endpoints
- `POST /api/auth/register` — Sign up
- `POST /api/auth/login` — Log in
- `GET  /api/jobs` — List jobs (search, filter, paginate)
- `POST /api/applications` — Submit application
- `POST /api/payments/create-order` — Razorpay order
- `GET  /api/admin/dashboard` — Admin stats

## 💰 Monetisation
- **AdSense**: Add `ca-pub-XXXX` in Admin → AdSense
- **Razorpay**: Add keys in `.env` for payments
- **Pro Plan**: ₹299/month — WhatsApp + AI matching
- **Enterprise**: ₹4,999/month — API + custom branding

## 📱 Features
- 11 public pages (Home, Jobs, News, Education, PwD, Resume, Pricing...)
- 34 admin pages (Dashboard, Users, Analytics, AdSense, SEO, Live Monitor...)
- AI Job Matching (Claude API)
- Sign Up / Log In with user dropdown
- Dark Mode + High Contrast + Font Size accessibility
- Hindi / English language toggle
- WhatsApp alerts (Twilio)
- Email notifications (Nodemailer)
- Real-time live monitor
- CSV export
- Keyboard shortcuts

## 🇮🇳 Made with ❤️ for India
