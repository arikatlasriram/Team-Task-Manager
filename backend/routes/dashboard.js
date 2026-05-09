const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard — Aggregated stats for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all projects user is part of
    const projects = await Project.find({ 'members.user': userId });
    const projectIds = projects.map((p) => p._id);

    // Determine admin projects vs member projects
    const adminProjectIds = projects
      .filter((p) => p.members.find((m) => m.user.toString() === userId.toString() && m.role === 'Admin'))
      .map((p) => p._id);

    // Tasks visible to user:
    // - Admin sees all tasks in admin projects
    // - Member sees only assigned tasks in member projects
    const memberProjectIds = projectIds.filter(
      (id) => !adminProjectIds.some((aid) => aid.toString() === id.toString())
    );

    const tasks = await Task.find({
      $or: [
        { project: { $in: adminProjectIds } },
        { project: { $in: memberProjectIds }, assignedTo: userId },
      ],
    }).populate('assignedTo', 'name email');

    const now = new Date();

    // Stats
    const totalTasks = tasks.length;

    const byStatus = {
      Todo: tasks.filter((t) => t.status === 'Todo').length,
      InProgress: tasks.filter((t) => t.status === 'InProgress').length,
      Done: tasks.filter((t) => t.status === 'Done').length,
    };

    const overdueTasks = tasks.filter(
      (t) => t.dueDate && t.status !== 'Done' && new Date(t.dueDate) < now
    ).length;

    // Tasks per user (for admin projects only)
    const perUserMap = {};
    tasks.forEach((task) => {
      if (task.assignedTo) {
        const key = task.assignedTo._id.toString();
        if (!perUserMap[key]) {
          perUserMap[key] = { user: task.assignedTo, count: 0 };
        }
        perUserMap[key].count++;
      }
    });
    const tasksPerUser = Object.values(perUserMap).sort((a, b) => b.count - a.count);

    // Recent overdue task details
    const overdueTaskList = tasks
      .filter((t) => t.dueDate && t.status !== 'Done' && new Date(t.dueDate) < now)
      .slice(0, 5)
      .map((t) => ({
        _id: t._id,
        title: t.title,
        dueDate: t.dueDate,
        priority: t.priority,
        assignedTo: t.assignedTo,
      }));

    // Priority breakdown
    const byPriority = {
      Low: tasks.filter((t) => t.priority === 'Low').length,
      Medium: tasks.filter((t) => t.priority === 'Medium').length,
      High: tasks.filter((t) => t.priority === 'High').length,
    };

    res.json({
      totalTasks,
      byStatus,
      overdueTasks,
      tasksPerUser,
      overdueTaskList,
      byPriority,
      totalProjects: projects.length,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error: err.message });
  }
});

module.exports = router;
