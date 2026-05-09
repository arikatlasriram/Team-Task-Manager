const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Helper: get user's role in a project
const getUserRole = (project, userId) => {
  const member = project.members.find((m) => m.user.toString() === userId.toString());
  return member ? member.role : null;
};

// POST /api/tasks — Create task (Admin only)
router.post(
  '/',
  authMiddleware,
  [
    body('title').trim().isLength({ min: 2, max: 150 }).withMessage('Title must be 2–150 characters'),
    body('projectId').notEmpty().withMessage('Project ID is required'),
    body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority'),
    body('status').optional().isIn(['Todo', 'InProgress', 'Done']).withMessage('Invalid status'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const { title, description, dueDate, priority, status, projectId, assignedTo } = req.body;

      const project = await Project.findById(projectId);
      if (!project) return res.status(404).json({ message: 'Project not found' });

      const role = getUserRole(project, req.user._id);
      if (!role) return res.status(403).json({ message: 'You are not a member of this project' });
      if (role !== 'Admin') return res.status(403).json({ message: 'Only Admins can create tasks' });

      // Validate assignedTo is a project member
      if (assignedTo) {
        const isMember = project.members.some((m) => m.user.toString() === assignedTo);
        if (!isMember) {
          return res.status(400).json({ message: 'Assigned user is not a member of this project' });
        }
      }

      const task = new Task({
        title,
        description,
        dueDate,
        priority: priority || 'Medium',
        status: status || 'Todo',
        project: projectId,
        assignedTo: assignedTo || null,
        createdBy: req.user._id,
      });

      await task.save();
      await task.populate('assignedTo', 'name email');
      await task.populate('createdBy', 'name email');

      res.status(201).json(task);
    } catch (err) {
      res.status(500).json({ message: 'Failed to create task', error: err.message });
    }
  }
);

// GET /api/tasks/:id — Get single task
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    const role = getUserRole(project, req.user._id);
    if (!role) return res.status(403).json({ message: 'Access denied' });

    // Members can only view their own assigned tasks
    if (role === 'Member' && task.assignedTo?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch task', error: err.message });
  }
});

// PUT /api/tasks/:id — Update task
router.put(
  '/:id',
  authMiddleware,
  [
    body('title').optional().trim().isLength({ min: 2, max: 150 }),
    body('priority').optional().isIn(['Low', 'Medium', 'High']),
    body('status').optional().isIn(['Todo', 'InProgress', 'Done']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ message: 'Task not found' });

      const project = await Project.findById(task.project);
      const role = getUserRole(project, req.user._id);
      if (!role) return res.status(403).json({ message: 'Access denied' });

      if (role === 'Member') {
        // Members can only update STATUS of their own tasks
        if (task.assignedTo?.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: 'You can only update your own assigned tasks' });
        }
        if (req.body.status) task.status = req.body.status;
      } else {
        // Admins can update everything
        const { title, description, dueDate, priority, status, assignedTo } = req.body;
        if (title) task.title = title;
        if (description !== undefined) task.description = description;
        if (dueDate !== undefined) task.dueDate = dueDate;
        if (priority) task.priority = priority;
        if (status) task.status = status;
        if (assignedTo !== undefined) {
          if (assignedTo) {
            const isMember = project.members.some((m) => m.user.toString() === assignedTo);
            if (!isMember) return res.status(400).json({ message: 'Assigned user is not a member' });
          }
          task.assignedTo = assignedTo || null;
        }
      }

      await task.save();
      await task.populate('assignedTo', 'name email');
      await task.populate('createdBy', 'name email');
      res.json(task);
    } catch (err) {
      res.status(500).json({ message: 'Failed to update task', error: err.message });
    }
  }
);

// DELETE /api/tasks/:id — Delete task (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    const role = getUserRole(project, req.user._id);
    if (role !== 'Admin') return res.status(403).json({ message: 'Only Admins can delete tasks' });

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task', error: err.message });
  }
});

module.exports = router;
