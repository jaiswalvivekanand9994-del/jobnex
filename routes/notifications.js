const router     = require('express').Router();
const nodemailer = require('nodemailer');
const twilio     = require('twilio');
const User       = require('../models/User');
const { protect, restrict } = require('../middleware/auth');

const mailer = nodemailer.createTransport({ host:process.env.SMTP_HOST, port:Number(process.env.SMTP_PORT)||587, secure:false, auth:{ user:process.env.SMTP_USER, pass:process.env.SMTP_PASS } });
const twilioClient = process.env.TWILIO_ACCOUNT_SID ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) : null;

const sendEmail = (opts) => mailer.sendMail({ from: process.env.EMAIL_FROM, ...opts });
const sendWA = (to, body) => {
  if (!twilioClient) throw new Error('Twilio not configured');
  return twilioClient.messages.create({ from: process.env.TWILIO_WHATSAPP_FROM, to: `whatsapp:${to}`, body });
};

// POST /api/notifications/contact (public)
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name||!email||!message) return res.status(400).json({ success:false, message:'Name, email and message required' });
    await sendEmail({ to: process.env.ADMIN_EMAIL, subject: `[Contact] ${subject||'New Message'} — ${name}`, html: `<h3>From: ${name} (${email})</h3><p>${message}</p>` });
    await sendEmail({ to: email, subject: '✅ Message received — Multi Job India', html: `<p>Hi ${name}, thanks for contacting us! We reply within 24 hrs. — Team Multi Job India 🇮🇳</p>` });
    res.json({ success:true, message:'Message sent successfully' });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
});

// POST /api/notifications/email/broadcast (admin)
router.post('/email/broadcast', protect, restrict('admin'), async (req, res) => {
  try {
    const { subject, html, filter={} } = req.body;
    const users = await User.find({ isActive:true, ...filter }).select('email name');
    let sent=0, failed=0;
    for (const u of users) {
      try { await sendEmail({ to:u.email, subject, html: html.replace('{{name}}',u.name) }); sent++; }
      catch { failed++; }
    }
    res.json({ success:true, sent, failed, total:users.length });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
});

// POST /api/notifications/whatsapp/broadcast (admin)
router.post('/whatsapp/broadcast', protect, restrict('admin'), async (req, res) => {
  try {
    const { message } = req.body;
    const users = await User.find({ whatsappOptIn:true, isActive:true, phone:{ $ne:'' } }).select('phone name');
    let sent=0, failed=0;
    for (const u of users) {
      try { await sendWA(u.phone, message.replace('{{name}}',u.name)); sent++; }
      catch { failed++; }
    }
    res.json({ success:true, sent, failed, total:users.length });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
});

// POST /api/notifications/whatsapp/single (admin)
router.post('/whatsapp/single', protect, restrict('admin'), async (req, res) => {
  try {
    await sendWA(req.body.phone, req.body.message);
    res.json({ success:true, message:'WhatsApp sent' });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
});

module.exports = { router, sendEmail, sendWA };
