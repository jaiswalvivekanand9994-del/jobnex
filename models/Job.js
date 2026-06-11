const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  company:     { type: String, required: true, trim: true },
  logo:        { type: String, default: '' },
  color:       { type: String, default: '#FF6B2B' },
  type:        { type: String, enum: ['govt','private'], required: true },
  category:    { type: String, required: true },
  location:    { type: String, required: true },
  salary:      { type: String, default: '' },
  salaryMin:   { type: Number, default: 0 },
  salaryMax:   { type: Number, default: 0 },
  experience:  { type: String, default: 'Fresher' },
  education:   { type: String, default: 'Any Graduate' },
  description: { type: String, required: true },
  skills:      [String],
  lastDate:    { type: Date, required: true },
  badges:      [String],
  isPwdFriendly: { type: Boolean, default: false },
  isRemote:    { type: Boolean, default: false },
  isFeatured:  { type: Boolean, default: false },
  featuredUntil: Date,
  status:      { type: String, enum: ['active','draft','expired','closed'], default: 'active' },
  views:       { type: Number, default: 0 },
  applications:{ type: Number, default: 0 },
  aiScore:     { type: Number, default: 0 },
  postedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  seoTitle:    { type: String, default: '' },
  seoTags:     [String],
}, { timestamps: true });

jobSchema.index({ title: 'text', company: 'text', description: 'text', skills: 'text' });
jobSchema.index({ type: 1, category: 1, status: 1 });
jobSchema.index({ lastDate: 1 });

module.exports = mongoose.model('Job', jobSchema);
