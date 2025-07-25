const express = require('express');
const router = express.Router();
const User = require('../modules/userSchema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');




// POST /api/auth/register - User registration
router.post('/register', async (req, res) => {
	try {
		const { username, email, password, phoneNumber } = req.body;

		console.log(username);
		console.log(email);
		console.log(password);
		console.log(phoneNumber);
		
		// Check if user already exists
		let user = await User.findOne({ email });
		if (user) {
			return res.status(400).json({ message: 'User already exists' });
		}

		// Create new user
		user = new User({
			username,
			email,
			password,
			phoneNumber
		});

		// Hash password
		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(password, salt);

		await user.save();

		// Create token
		const token = jwt.sign({ id: user._id }, process.env.JWT_TOKEN_SECRET_KEY, {
			expiresIn: '30d'
		});
		console.log(token);
		

		res.status(201).json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error' });
	}
});

// POST /api/auth/login - User login
router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body;

		// Check if user exists
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ message: 'Invalid credentials' });
		}

		// Check password
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ message: 'Invalid credentials' });
		}

		// Create token
		const token = jwt.sign({ id: user._id }, process.env.JWT_TOKEN_SECRET_KEY, {
			expiresIn: '30d'
		});

		res.json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error' });
	}
});

// POST /api/auth/logout - User logout
router.post('/logout', passport.authenticate('jwt', { session: false }), async (req, res) => {
	// Since JWT is stateless, logout is handled client-side by removing the token
	res.json({ message: 'Logout successful' });
});

// GET /api/auth/me - Get current user profile
router.get('/me', passport.authenticate('jwt', { session: false }), async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select('-password');
		res.json(user);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error' });
	}
});

// PUT /api/auth/me - Update current user profile
router.put('/me', passport.authenticate('jwt', { session: false }), async (req, res) => {
	try {
		const { username, email, phoneNumber, profileImage } = req.body;

		const user = await User.findByIdAndUpdate(
			req.user.id,
			{ username, email, phoneNumber, profileImage },
			{ new: true }
		).select('-password');

		res.json(user);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error' });
	}
});

// PUT /api/auth/password - Change password
router.put('/password', passport.authenticate('jwt', { session: false }), async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body;

		const user = await User.findById(req.user.id);

		// Check current password
		const isMatch = await bcrypt.compare(currentPassword, user.password);
		if (!isMatch) {
			return res.status(400).json({ message: 'Current password is incorrect' });
		}

		// Hash new password
		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(newPassword, salt);

		await user.save();

		res.json({ message: 'Password updated successfully' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error' });
	}
});













//////////////////////////////////////////    ADMIN   /////////////////////////////////////



//  if (req.user.role !== 'admin') {
//         return res.status(403).json({ message: 'Admin access required' });
//     }




// GET /api/admin/users - Get all users (admin only)
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
	try {
		const users = await User.find().select('-password');
		res.json(users);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error' });
	}
});

// GET /api/admin/users/:id - Get user by ID (admin only)
router.get('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
	try {
		const user = await User.findById(req.params.id).select('-password');
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		res.json(user);
	} catch (err) {
		console.error(err);
		if (err.kind === 'ObjectId') {
			return res.status(404).json({ message: 'User not found' });
		}
		res.status(500).json({ message: 'Server error' });
	}
});

// PUT /api/admin/users/:id - Update user (admin only)
router.put('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
	try {
		const { username, email, phoneNumber, role, isActive } = req.body;

		const user = await User.findByIdAndUpdate(
			req.params.id,
			{ username, email, phoneNumber, role, isActive },
			{ new: true }
		).select('-password');

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		res.json(user);
	} catch (err) {
		console.error(err);
		if (err.kind === 'ObjectId') {
			return res.status(404).json({ message: 'User not found' });
		}
		res.status(500).json({ message: 'Server error' });
	}
});

// DELETE /api/admin/users/:id - Delete user (admin only)
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
	try {
		const user = await User.findByIdAndDelete(req.params.id);

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		res.json({ message: 'User deleted successfully' });
	} catch (err) {
		console.error(err);
		if (err.kind === 'ObjectId') {
			return res.status(404).json({ message: 'User not found' });
		}
		res.status(500).json({ message: 'Server error' });
	}
});




module.exports = router;