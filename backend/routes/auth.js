const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  authController.register
);

router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      await authController.login(req, res);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ msg: 'Server error', error: error.message });
    }
  }
);

router.get('/user', auth, authController.getUser);
router.put('/projects', auth, authController.updateProjects);
router.put('/user-data', auth, authController.updateUserData);

module.exports = router;