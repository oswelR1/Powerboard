const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { name, email, password, avatar } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    user = new User({ name, email, password, avatar });
    await user.save();
    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log('Login attempt:', email);
    let user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) {
        console.error('JWT sign error:', err);
        return res.status(500).json({ msg: 'Server error' });
      }
      console.log('Login successful');
      res.json({ token });
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.updateProjects = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    user.projects = req.body.projects;
    await user.save();
    res.json(user.projects);
  } catch (err) {
    console.error('Error updating projects:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Add this new controller function
exports.updateUserData = async (req, res) => {
  try {
    const { projects } = req.body;
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    user.projects = projects;
    
    // Use findOneAndUpdate instead of save to avoid version conflicts
    user = await User.findOneAndUpdate(
      { _id: req.user.id },
      { $set: { projects: projects } },
      { new: true, runValidators: true }
    );

    res.json(user.projects);
  } catch (err) {
    console.error('Error updating user data:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};