const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const register = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ msg: 'Email-i tashmë ekziston!' });

    
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    
    const user = await User.create({
      fullName,
      email,
      password: hash,
      role,          
    });

    res.status(201).json({ msg: 'Regjistrim i suksesshëm!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Gabim në server.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ msg: 'Përdoruesi nuk u gjet.' });

    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Fjalëkalim i gabuar.' });

    
    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

    res.json({ token, user: { id: user.id, fullName: user.fullName, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Gabim në server.' });
  }
};


const getStaff = async (req, res) => {
  try {
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Unauthorized access' });
    }
    
    const staff = await User.findAll({
      attributes: ['id', 'fullName', 'email', 'role'],
      order: [['fullName', 'ASC']]
    });
    
    res.json(staff);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const updateStaff = async (req, res) => {
  try {
    // Only admin can update staff
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Unauthorized access' });
    }
    
    const { id } = req.params;
    const { fullName, email, password, role } = req.body;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Update user data
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.role = role || user.role;
    
    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    
    await user.save();
    
    res.json({ msg: 'User updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const deleteStaff = async (req, res) => {
  try {
    // Only admin can delete staff
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Unauthorized access' });
    }
    
    const { id } = req.params;
    
    // Don't allow deleting yourself
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ msg: 'Cannot delete your own account' });
    }
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    await user.destroy();
    
    res.json({ msg: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { register, login, getStaff, updateStaff, deleteStaff };
