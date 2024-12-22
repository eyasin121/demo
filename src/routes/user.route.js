import express from 'express';
import User from '../model/user.model.js';
import generateToken from '../middleware/generateToken.js';




const router = express.Router();

// const authController = require('../controllers/auth.controller');

// register a new user
router.post('/register', async(req, res) => {
  try {
    
    const {email, password,username}  = req.body;
    const user = new User({email, password,username});
    // console.log("user", user)
    await user.save();
    res.status(201).json({ message: 'User created successfully!',user: user });

  } catch (error) {
     console.log("failed in register", error)
     res.status(500).json({ message: error.message });
  }
});


// login a user
router.post('/login', async(req, res) => {
  try {
    const {email, password} = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'user not found' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'password is incorrect' });
    }
    // generate token
    const token = await generateToken(user._id); // Generate token with user ID
    res.cookie('token', token, { httpOnly: true,
        secure: true, // Ensure this is true for HTTPS
        sameSite: 'None'});
    res.status(200).send({ message: 'Logged in successfully', token, user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        role: user.role
    } });
} catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send({ message: 'Login failed' });
}
});

// // Logout endpoint (optional)
router.post('/logout', (req, res) => {
res.clearCookie('token'); 
res.status(200).send({ message: 'Logged out successfully' });
});


// all users 

router.get('/users', async (req, res) => {
try {
    const users = await User.find({}, 'id email role');
    res.status(200).send(users);
} catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send({ message: 'Failed to fetch users' });
}
});

// // delete a user
router.delete('/users/:id', async (req, res) => {
try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
        return res.status(404).send({ message: 'User not found' });
    }
    res.status(200).send({ message: 'User deleted successfully' });
} catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send({ message: 'Failed to delete user' });
}
}) 

// // update a user role
router.put('/users/:id', async (req, res) => {
try {
    const { id } = req.params;
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) {
        return res.status(404).send({ message: 'User not found' });
    }
    res.status(200).send({ message: 'User role updated successfully', user });
} catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).send({ message: 'Failed to update user role' });
}
});


export default router;