const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const WindowSchema = new mongoose.Schema({
  i: String,
  x: Number,
  y: Number,
  w: Number,
  h: Number,
  content: String,
  bgColor: String,
  contentType: String
});

const ProjectSchema = new mongoose.Schema({
  id: String,
  name: String,
  windows: [WindowSchema]
});

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: 'default-avatar.png',
  },
  projects: [ProjectSchema],
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;