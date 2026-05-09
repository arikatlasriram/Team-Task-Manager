const Project = require('../models/Project');

/**
 * Middleware to check if the authenticated user has Admin role in a project.
 * Requires :projectId in req.params or req.body.
 */
const requireAdmin = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id || req.body.projectId;
    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const member = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!member) {
      return res.status(403).json({ message: 'You are not a member of this project' });
    }

    if (member.role !== 'Admin') {
      return res.status(403).json({ message: 'Admin access required for this action' });
    }

    req.project = project;
    req.userRole = 'Admin';
    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error checking role', error: err.message });
  }
};

/**
 * Middleware to check if the authenticated user is a member of a project (any role).
 */
const requireMember = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id || req.body.projectId;
    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const member = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!member) {
      return res.status(403).json({ message: 'You are not a member of this project' });
    }

    req.project = project;
    req.userRole = member.role;
    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error checking membership', error: err.message });
  }
};

module.exports = { requireAdmin, requireMember };
