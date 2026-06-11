const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:   { type: String, required: true, minlength: 6, select: false },
  phone:      { type: String, default: '' },
  role:       { type: String, enum: ['user','employer','admin'], default: 'user' },
  plan:       { type: String, enum: ['free','pro','enterprise'], default: 'free' },
  planExpiry: Date,
  state:      { type: String, default: '' },
  skills:     [String],
  education:  { type: String, default: '' },
  experience: { type: String, default: '' },
  resume:     { type: String, default: '' },
  savedJobs:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  appliedJobs:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  whatsappOptIn: { type: Boolean, default: false },
  pushOptIn:     { type: Boolean, default: false },
  isActive:   { type: Boolean, default: true },
  lastLogin:  Date,
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.comparePassword = function(plain) { return bcrypt.compare(plain, this.password); };
userSchema.methods.toJSON = function() { const o = this.toObject(); delete o.password; return o; };

module.exports = mongoose.model('User', userSchema);
