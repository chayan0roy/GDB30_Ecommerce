const express = require('express');
const router = express.Router();
const User = require('../modules/userSchema');

const bcrypt = require('bcryptjs')
const dotenv = require('dotenv');
const generateToken = require('../utils/generateToken')
const checkUserStatus = require('../middleware/checkUserStatus')
dotenv.config();
const passport = require('passport');

const fs = require('fs');
const path = require('path');
const { singleImageUpload } = require('../middleware/multer')



const emailVerification = true;


router.post('/register', async (req, res) => {
    try {
        const { username, email, password, phoneNumber } = req.body;

        if (!username || !email || !password || !phoneNumber) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existUser = await User.findOne({ email });

        if (existUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newSalt = await bcrypt.genSalt(Number(process.env.SALT))
        const hashPassword = await bcrypt.hash(password, newSalt)

        const newUser = new User({ username, email, password: hashPassword, phoneNumber });
        await newUser.save();

        // sendOtpVerificationEmail(req, res, newUser);


        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
})





// User Email Verification
router.post('/verifyEmail', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ status: "failed", message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({ status: "failed", message: "Email doesn't exists" });
        }

        if (existingUser.is_verified) {
            return res.status(400).json({ status: "failed", message: "Email is already verified" });
        }

        // const emailVerification = await EmailVerificationModel.findOne({ userId: existingUser._id, otp });
        if (!emailVerification) {
            if (!existingUser.is_verified) {
                await sendEmail(req, res, existingUser)
                return res.status(400).json({ status: "failed", message: "Invalid OTP, new OTP sent to your email" });
            }
            return res.status(400).json({ status: "failed", message: "Invalid OTP" });
        }

        const currentTime = new Date();
        const expirationTime = new Date(emailVerification.createdAt.getTime() + 15 * 60 * 1000);
        if (currentTime > expirationTime) {
            await sendEmail(req, res, existingUser)
            return res.status(400).json({ status: "failed", message: "OTP expired, new OTP sent to your email" });
        }

        existingUser.is_verified = true;
        await existingUser.save();

        const { auth_token } = await generateToken(existingUser)

        // await EmailVerificationModel.deleteMany({ userId: existingUser._id });
        res.status(200).json({
            status: true,
            role: existingUser.role,
            auth_token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "failed", message: "Unable to verify email, please try again later" });
    }
})





router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existUser = await User.findOne({ email });

        if (!existUser) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        const isMatch = await bcrypt.compare(password, existUser.password)
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid' });
        }

        const { auth_token } = await generateToken(existUser)

        res.status(200).json({ message: 'Login successful', auth_token });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
})


router.get('/profile', passport.authenticate('jwt', { session: false }), checkUserStatus, async (req, res) => {
    try {
        const userId = req.user.id

        const existUser = await User.findById(userId);

        if (!existUser) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        res.status(200).json({ existUser });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
})


router.post('/upload-profile-picture', passport.authenticate('jwt', { session: false }), checkUserStatus, singleImageUpload, async (req, res) => {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded.' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.image) {
            const oldImagePath = path.join(__dirname, '..', user.image);

            fs.unlink(oldImagePath, (err) => {
                if (err) {
                    console.warn('Failed to delete old image:', err.message);
                } else {
                    console.log('Old profile image deleted successfully.');
                }
            });
        }

        user.image = req.file.path;
        await user.save();

        res.status(200).json({
            message: 'Profile picture updated successfully',
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});





module.exports = router;