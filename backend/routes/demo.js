const express = require('express');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const router = express.Router();

router.post('/seed', async (req, res) => {
  try {
    // Clear existing (though in-memory is usually clean)
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});

    // 1. Create Admin
    const admin = new User({
      name: 'Project Admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });
    await admin.save();

    // 2. Create Regular Users
    const users = [];
    for (let i = 1; i <= 4; i++) {
      const user = new User({
        name: `Team Member ${i}`,
        email: `user${i}@example.com`,
        password: 'password123',
        role: 'user'
      });
      await user.save();
      users.push(user);
    }

    // 3. Create Project
    const project = new Project({
      name: 'Global Expansion Project',
      description: 'Coordinating with a team of 4 members to launch our platform globally.',
      owner: admin._id,
      members: [
        { user: admin._id, role: 'Admin' },
        ...users.map(u => ({ user: u._id, role: 'Member' }))
      ]
    });
    await project.save();

    // 4. Create Tasks
    const tasks = [
      {
        title: 'Initial Market Research',
        description: 'Assigned to Team Member 1 to begin phase 1.',
        priority: 'High',
        status: 'InProgress',
        project: project._id,
        assignedTo: users[0]._id,
        createdBy: admin._id
      },
      {
        title: 'Infrastructure Setup',
        description: 'Assigned to Team Member 2.',
        priority: 'Medium',
        status: 'Todo',
        project: project._id,
        assignedTo: users[1]._id,
        createdBy: admin._id
      }
    ];

    await Task.insertMany(tasks);

    res.json({
      message: 'Demo data seeded successfully! 🚀',
      accounts: {
        admin: { email: 'admin@example.com', password: 'password123' },
        users: users.map(u => ({ email: u.email, password: 'password123' }))
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Seeding failed', error: err.message });
  }
});

module.exports = router;
