const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job:        { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:       { type: String, required: true },
  email:      { type: String, required: true },
  phone:      { type: String, default: '' },
  coverLetter:{ type: String, default: '' },
  resume:     { type: String, default: '' },
  aiScore:    { type: Number, default: 0 },
  status:     { type: String, enum: ['pending','shortlisted','rejected','hired'], default: 'pending' },
  notes:      { type: String, default: '' },
}, { timestamps: true });
applicationSchema.index({ job: 1, user: 1 }, { unique: true });

const paymentSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId:   { type: String, required: true },
  paymentId: { type: String, default: '' },
  amount:    { type: Number, required: true },
  currency:  { type: String, default: 'INR' },
  plan:      { type: String },
  status:    { type: String, enum: ['created','paid','failed','refunded'], default: 'created' },
  method:    { type: String, default: '' },
  receipt:   { type: String, default: '' },
}, { timestamps: true });

const newsSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  tag:        { type: String, default: 'News' },
  emoji:      { type: String, default: '📋' },
  bg:         { type: String, default: 'linear-gradient(135deg,#0A3D62,#1A5C9A)' },
  description:{ type: String, required: true },
  body:       { type: String, default: '' },
  category:   { type: String, default: 'notification' },
  views:      { type: Number, default: 0 },
  status:     { type: String, enum: ['published','draft'], default: 'published' },
  postedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = {
  Application: mongoose.model('Application', applicationSchema),
  Payment:     mongoose.model('Payment', paymentSchema),
  News:        mongoose.model('News', newsSchema),
};
