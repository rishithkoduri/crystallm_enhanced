require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Models
const User = require('./models/User');
const Generation = require('./models/Generation'); 

// Middleware
const protect = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';

// App Middleware
app.use(cors({ origin: true, credentials: true }));
// INCREASE JSON LIMIT: Base64 images are large, so we must increase the payload limit!
app.use(express.json({ limit: '10mb' })); 

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Successfully connected to MongoDB Atlas!'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

  mongoose.connection.on('disconnected', () => {
    console.error('❌ MongoDB disconnected! Check your network or Atlas whitelist.');
});

mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected successfully!');
});

// ==========================================
// 1. AUTHENTICATION ROUTES
// ==========================================

app.post('/api/auth/register', async (req, res) => {
  console.log("➡️ Registration attempt received for:", req.body.email);
  try {
    const { name, email, password, dob } = req.body; 
    
    if (!name || !email || !password || !dob) {
      console.log("❌ Error: Missing required fields");
      return res.status(400).json({ status: 'error', message: 'All fields, including DOB, are required.' });
    }

    let user = await User.findOne({ email });
    if (user) {
      console.log("❌ Error: Email already exists in database");
      return res.status(400).json({ status: 'error', message: 'Email already cleared for access.' });
    }

    console.log("⏳ Creating new user securely...");
    user = new User({ name, email, password, dob }); 
    await user.save();
    console.log("✅ User saved to MongoDB perfectly!");

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ status: 'success', token, user: { id: user._id, name: user.name, role: user.role, profilePic: user.profilePic } });
  } catch (error) {
    console.error("❌ Registration CRASH:", error);
    res.status(500).json({ status: 'error', message: 'Registration failed: ' + error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  console.log("➡️ Login attempt for:", req.body.email);
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log("❌ Error: User not found");
      return res.status(400).json({ status: 'error', message: 'Not registered.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Error: Password mismatch");
      return res.status(400).json({ status: 'error', message: 'Invalid credentials.' });
    }

    console.log("✅ Login successful!");
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ status: 'success', token, user: { id: user._id, name: user.name, role: user.role, profilePic: user.profilePic } });
  } catch (error) {
    console.error("❌ Login CRASH:", error);
    res.status(500).json({ status: 'error', message: 'Login failed.' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  console.log("➡️ Password reset attempt for:", req.body.email);
  try {
    const { email, dob, newPassword } = req.body; 
    
    if (!email || !dob || !newPassword) {
      return res.status(400).json({ status: 'error', message: 'Email, DOB, and new key are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'No clearance found for that email.' });
    }

    if (user.dob !== dob) {
      console.log("❌ Error: DOB verification failed");
      return res.status(400).json({ status: 'error', message: 'Date of Birth verification failed.' });
    }

    user.password = newPassword;
    await user.save();

    console.log("✅ Access Key reset successfully!");
    res.status(200).json({ status: 'success', message: 'Access Key updated successfully.' });
  } catch (error) {
    console.error("❌ Reset CRASH:", error);
    res.status(500).json({ status: 'error', message: 'Failed to reset Access Key.' });
  }
});

app.post('/api/auth/profile-pic', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.profilePic = req.body.profilePic; 
    await user.save();
    console.log("✅ Profile picture updated!");
    res.status(200).json({ status: 'success', profilePic: user.profilePic });
  } catch (error) { 
    console.error("❌ Profile Pic CRASH:", error);
    res.status(500).json({ status: 'error', message: 'Failed to update profile picture.' }); 
  }
});

app.delete('/api/auth/delete-account', protect, async (req, res) => {
  try {
    await Generation.deleteMany({ userId: req.user.id }); 
    await User.findByIdAndDelete(req.user.id);            
    console.log("🚨 User account permanently deleted.");
    res.status(200).json({ status: 'success', message: 'Account permanently deleted.' });
  } catch (error) { 
    console.error("❌ Delete Account CRASH:", error);
    res.status(500).json({ status: 'error', message: 'Failed to delete account.' }); 
  }
});


// ==========================================
// 2. PROTECTED ROUTES (Requires login token)
// ==========================================

app.post('/api/generate', protect, async (req, res) => {
    try {
        // Updated to extract z
        const { formula, targetEnergy, spaceGroup, z } = req.body;
        
        console.log(`➡️ Requesting RTX 4060 GPU generation for: ${formula}`);

        const PYTHON_API_URL = "http://127.0.0.1:8000";

        // Call Python Engine with new Z param
        const pythonResponse = await fetch(`${PYTHON_API_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                formula: formula || "", 
                targetEnergy: targetEnergy || "", 
                spaceGroup: spaceGroup || "",
                z: z || "" // Send Z
            })
        });

        if (!pythonResponse.ok) throw new Error(`Python API failed with status: ${pythonResponse.status}`);
        
        const modelData = await pythonResponse.json(); 
        
        const cifData = modelData.cifData;
        const generatedPrompt = modelData.prompt;
        const finalEnergy = modelData.energy;

        // Save to DB including Z
        const newGeneration = new Generation({
            userId: req.user.id, 
            formula, 
            targetEnergy: finalEnergy,
            spaceGroup, 
            z, // Save Z
            cifData: cifData
        });
        await newGeneration.save();
        
        console.log("✅ Generation successful and saved to MongoDB!");

        res.status(200).json({ status: "success", data: newGeneration, cifData: cifData, prompt: generatedPrompt });

    } catch (error) {
        console.error("❌ Pipeline error:", error.message);
        res.status(500).json({ status: "error", message: "Failed to process generation on RTX 4060.", detail: error.message });
    }
});

app.get('/api/history', protect, async (req, res) => {
  try {
    const userHistory = await Generation.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: userHistory });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch history' });
  }
});

app.delete('/api/history/all', protect, async (req, res) => {
  try {
    await Generation.deleteMany({ userId: req.user.id });
    console.log("🗑️ All generation history wiped for user.");
    res.status(200).json({ status: 'success', message: 'All history wiped.' });
  } catch (error) { 
    console.error("❌ Delete All History CRASH:", error);
    res.status(500).json({ status: 'error', message: 'Failed to wipe history.' }); 
  }
});

app.delete('/api/history/:id', protect, async (req, res) => {
  try {
    const deletedRecord = await Generation.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deletedRecord) return res.status(404).json({ status: 'error', message: 'Record not found' });
    res.status(200).json({ status: 'success', message: 'Record deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to delete' });
  }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});