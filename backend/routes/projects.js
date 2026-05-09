const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const authMiddleware = require('../middleware/auth');
const { requireAdmin, requireMember } = require('../middleware/role');

const router = express.Router();

// GET /api/projects — All projects for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({ 'members.user': req.user._id })
      .populate('owner', 'name email')
      .populate('members.user', 'name email')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch projects', error: err.message });
  }
});

// POST /api/projects — Create project
router.post(
  '/',
  authMiddleware,
  [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Project name must be 2–100 characters'),
    body('description').optional().trim().isLength({ max: 500 }).withMessage('Description max 500 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const { name, description } = req.body;
      const project = new Project({
        name,
        description,
        owner: req.user._id,
        members: [{ user: req.user._id, role: 'Admin' }],
      });
      await project.save();
      await project.populate('owner', 'name email');
      await project.populate('members.user', 'name email');
      res.status(201).json(project);
    } catch (err) {
      res.status(500).json({ message: 'Failed to create project', error: err.message });
    }
  }
);

// GET /api/projects/:id — Get single project
router.get('/:id', authMiddleware, requireMember, async (req, res) => {
  try {
    await req.project.populate('owner', 'name email');
    await req.project.populate('members.user', 'name email');
    res.json({ project: req.project, userRole: req.userRole });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch project', error: err.message });
  }
});

// PUT /api/projects/:id — Update project (Admin only)
router.put(
  '/:id',
  authMiddleware,
  requireAdmin,
  [
    body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),
    body('description').optional().trim().isLength({ max: 500 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    try {
      const { name, description } = req.body;
      if (name) req.project.name = name;
      if (description !== undefined) req.project.description = description;
      await req.project.save();
      await req.project.populate('owner', 'name email');
      await req.project.populate('members.user', 'name email');
      res.json(req.project);
    } catch (err) {
      res.status(500).json({ message: 'Failed to update project', error: err.message });
    }
  }
);

// DELETE /api/projects/:id — Delete project (Admin only)
router.delete('/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    await Task.deleteMany({ project: req.project._id });
    await req.project.deleteOne();
    res.json({ message: 'Project and all its tasks deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete project', error: err.message });
  }
});

// POST /api/projects/:id/members — Add member (Admin only)
router.post(
  '/:id/members',
  authMiddleware,
  requireAdmin,
  [body('email').isEmail().normalizeEmail().withMessage('Valid email is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    try {
      const { email, role = 'Member' } = req.body;

      const userToAdd = await User.findOne({ email });
      if (!userToAdd) {
        return res.status(404).json({ message: 'No user found with that email' });
      }

      const alreadyMember = req.project.members.some(
        (m) => m.user.toString() === userToAdd._id.toString()
      );
      if (alreadyMember) {
        return res.status(409).json({ message: 'User is already a member of this project' });
      }

      req.project.members.push({ user: userToAdd._id, role });
      await req.project.save();
      await req.project.populate('members.user', 'name email');
      res.json(req.project);
    } catch (err) {
      res.status(500).json({ message: 'Failed to add member', error: err.message });
    }
  }
);

// DELETE /api/projects/:id/members/:userId — Remove member (Admin only)
router.delete('/:id/members/:userId', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.project.owner.toString()) {
      return res.status(400).json({ message: 'Cannot remove the project owner' });
    }

    req.project.members = req.project.members.filter(
      (m) => m.user.toString() !== userId
    );
    await req.project.save();

    // Unassign tasks from removed member
    await Task.updateMany(
      { project: req.project._id, assignedTo: userId },
      { $set: { assignedTo: null } }
    );

    await req.project.populate('members.user', 'name email');
    res.json(req.project);
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove member', error: err.message });
  }
});

// GET /api/projects/:id/tasks — Get tasks for project
router.get('/:id/tasks', authMiddleware, requireMember, async (req, res) => {
  try {
    let query = { project: req.project._id };

    // Members only see their assigned tasks
    if (req.userRole === 'Member') {
      query.assignedTo = req.user._id;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks', error: err.message });
  }
});

module.exports = router;
