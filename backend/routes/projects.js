const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

// Get all projects (user is owner or member)
router.get('/projects', auth, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    })
      .populate('owner', 'username fullName avatar email')
      .populate('members.user', 'username fullName avatar email')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single project
router.get('/projects/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'username fullName avatar email')
      .populate('members.user', 'username fullName avatar email');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user has access
    const hasAccess = project.owner._id.toString() === req.user._id.toString() ||
      project.members.some(m => m.user._id.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create project
router.post('/projects', auth, [
  body('name').trim().notEmpty().withMessage('Project name is required'),
  body('description').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = new Project({
      ...req.body,
      owner: req.user._id,
      members: [{
        user: req.user._id,
        role: 'Admin',
        addedAt: new Date()
      }]
    });

    await project.save();
    await project.populate('owner', 'username fullName avatar email');
    await project.populate('members.user', 'username fullName avatar email');

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update project
router.put('/projects/:id', auth, [
  body('name').optional().trim().notEmpty(),
  body('status').optional().isIn(['Active', 'Archived', 'Completed'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is owner or admin member
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isAdmin = project.members.some(
      m => m.user.toString() === req.user._id.toString() && m.role === 'Admin'
    );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Only owner or admin can update project' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('owner', 'username fullName avatar email')
      .populate('members.user', 'username fullName avatar email');

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete project
router.delete('/projects/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Only owner can delete
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only owner can delete project' });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add member to project
router.post('/projects/:id/members', auth, [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('role').optional().isIn(['Admin', 'Developer', 'Tester', 'Viewer'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is owner or admin
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isAdmin = project.members.some(
      m => m.user.toString() === req.user._id.toString() && m.role === 'Admin'
    );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Only owner or admin can add members' });
    }

    // Check if user exists
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is already a member
    const isMember = project.members.some(
      m => m.user.toString() === req.body.userId
    );

    if (isMember) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    // Add member
    project.members.push({
      user: req.body.userId,
      role: req.body.role || 'Viewer',
      addedAt: new Date()
    });

    await project.save();
    await project.populate('owner', 'username fullName avatar email');
    await project.populate('members.user', 'username fullName avatar email');

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove member from project
router.delete('/projects/:id/members/:memberId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is owner or admin
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isAdmin = project.members.some(
      m => m.user.toString() === req.user._id.toString() && m.role === 'Admin'
    );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Only owner or admin can remove members' });
    }

    // Cannot remove owner
    if (req.params.memberId === project.owner.toString()) {
      return res.status(400).json({ error: 'Cannot remove project owner' });
    }

    project.members = project.members.filter(
      m => m.user.toString() !== req.params.memberId
    );

    await project.save();
    await project.populate('owner', 'username fullName avatar email');
    await project.populate('members.user', 'username fullName avatar email');

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search users (for adding to project)
router.get('/users/search', auth, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json([]);
    }

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { fullName: { $regex: q, $options: 'i' } }
      ],
      _id: { $ne: req.user._id } // Exclude current user
    })
      .select('username email fullName avatar')
      .limit(10);

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

