# 🇮🇳 Multi Job India — Backend API

Node.js + Express + MongoDB backend for the Multi Job India SaaS job portal.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy and configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI, API keys, etc.

# 3. Seed the database with sample data
npm run seed

# 4. Start the server
npm run dev        # development (auto-restart)
npm start          # production
```

Server runs at **http://localhost:3000**

---

## 📁 Project Structure

```
multijob-backend/
├── server.js              # Entry point
├── package.json
├── .env.example           # Environment variable template
├── config/
│   └── db.js              # MongoDB connection
├── models/
│   ├── User.js            # User schema
│   ├── Job.js             # Job schema
│   └── models.js          # Application, Payment, News schemas
├── routes/
│   ├── auth.js            # Register, login, profile
│   ├── jobs.js            # Job CRUD + search + filters
│   ├── applications.js    # Apply, track, update status
│   ├── payments.js        # Razorpay order + verify
│   ├── admin.js           # Dashboard, analytics, user mgmt
│   └── notifications.js   # Email (Nodemailer) + WhatsApp (Twilio)
├── middleware/
│   └── auth.js            # JWT protect + role guard
├── scripts/
│   └── seed.js            # Database seeder
└── public/
    └── index.html         # Place your multijob-india-saas.html here
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login → returns JWT |
| GET  | `/api/auth/me` | Get current user (auth required) |
| PATCH| `/api/auth/me` | Update profile |
| POST | `/api/auth/change-password` | Change password |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/jobs` | List all jobs (search, filter, paginate) |
| GET  | `/api/jobs/:id` | Single job (increments views) |
| POST | `/api/jobs` | Create job (admin/employer) |
| PATCH| `/api/jobs/:id` | Update job (admin) |
| DELETE| `/api/jobs/:id` | Delete job (admin) |
| POST | `/api/jobs/bulk` | Bulk approve/feature/delete (admin) |
| GET  | `/api/jobs/stats/summary` | Dashboard stats (admin) |

#### Job Query Params
```
GET /api/jobs?q=software+engineer&type=private&category=IT&location=Bangalore
              &salary=high&featured=true&pwd=true&remote=true&fresher=true
              &page=1&limit=12&sort=-createdAt
```

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/applications` | Submit application + resume upload |
| GET  | `/api/applications/mine` | User's applications |
| GET  | `/api/applications` | All applications (admin) |
| PATCH| `/api/applications/:id` | Update status (admin) |

### Payments (Razorpay)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify payment signature |
| GET  | `/api/payments/mine` | User's payment history |
| GET  | `/api/payments` | All payments (admin) |

#### Plans & Pricing
| Plan | Amount |
|------|--------|
| `pro` | ₹299/month |
| `enterprise` | ₹4,999/month |
| `job_basic` | ₹999 listing |
| `job_featured` | ₹2,999 listing |
| `job_hot` | ₹4,999 listing |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Full dashboard stats |
| GET | `/api/admin/users` | All users (search, filter) |
| PATCH | `/api/admin/users/:id` | Update user role/plan |
| GET | `/api/admin/analytics` | Growth charts data |
| GET | `/api/admin/news` | All news articles |
| POST | `/api/admin/news` | Create article |
| GET | `/api/admin/export/jobs` | Export jobs as CSV |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/notifications/email/broadcast` | Email blast to users |
| POST | `/api/notifications/whatsapp/broadcast` | WhatsApp blast (Twilio) |
| POST | `/api/notifications/contact` | Public contact form |

---

## 🔐 Authentication

All protected routes require the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Roles: `user` · `employer` · `admin`
Plans: `free` · `pro` · `enterprise`

---

## 💳 Razorpay Integration

1. Add your keys to `.env`
2. Frontend creates order → `POST /api/payments/create-order`
3. User pays via Razorpay checkout
4. Frontend verifies → `POST /api/payments/verify`
5. Backend validates signature → upgrades user plan automatically

---

## 📱 WhatsApp Alerts (Twilio)

1. Create a Twilio account at [console.twilio.com](https://console.twilio.com)
2. Enable WhatsApp sandbox or Business API
3. Add `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` to `.env`
4. Use `POST /api/notifications/whatsapp/broadcast` from the admin panel

---

## 🚀 Deploy to Production

### Railway / Render / Heroku
```bash
# Set environment variables on your platform
# Then deploy with git push
```

### MongoDB Atlas (free tier)
1. Create cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Get connection string → set as `MONGO_URI` in env

### Place the frontend
```bash
cp multijob-india-saas.html public/index.html
```
The server will serve it at `http://yoursite.com/`
Admin panel at `http://yoursite.com/#admin`

---

## 🧪 Test the API

```bash
# Health check
curl http://localhost:3000/api/health

# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Aarav","email":"aarav@gmail.com","password":"test123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@jobsindia.ai","password":"admin123"}'

# Get all jobs
curl http://localhost:3000/api/jobs
```

---

## 📞 Support

- 📧 support@jobsindia.ai  
- 🇮🇳 Made with ❤️ for Indian job seekers
