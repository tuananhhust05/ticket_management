const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

// Get all tickets
router.get('/tickets', auth, async (req, res) => {
  try {
    const { status, priority, assignee, search, project } = req.query;
    const filter = {};

    if (project) filter.project = project;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tickets = await Ticket.find(filter)
      .populate('project', 'name')
      .populate('assignee', 'username fullName avatar')
      .populate('reporter', 'username fullName avatar')
      .populate('comments.user', 'username fullName avatar')
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single ticket
router.get('/tickets/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('project', 'name owner members')
      .populate('assignee', 'username fullName avatar')
      .populate('reporter', 'username fullName avatar')
      .populate('comments.user', 'username fullName avatar');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create ticket
router.post('/tickets', auth, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional(),
  body('project').notEmpty().withMessage('Project is required'),
  body('status').optional().isIn(['Pending', 'In Progress', 'Completed', 'Cancelled']),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Urgent'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const Project = require('../models/Project');
    const project = await Project.findById(req.body.project);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user has access to project
    const hasAccess = project.owner.toString() === req.user._id.toString() ||
      project.members.some(m => m.user.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ error: 'You do not have access to this project' });
    }

    const ticket = new Ticket({
      ...req.body,
      reporter: req.user._id
    });

    await ticket.save();
    await ticket.populate('project', 'name');
    await ticket.populate('reporter', 'username fullName avatar');

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update ticket
router.put('/tickets/:id', [
  body('title').optional().trim().notEmpty(),
  body('status').optional().isIn(['Pending', 'In Progress', 'Completed', 'Cancelled']),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Urgent'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('assignee', 'username fullName avatar')
      .populate('reporter', 'username fullName avatar')
      .populate('comments.user', 'username fullName avatar');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除票务
router.delete('/tickets/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add comment
router.post('/tickets/:id/comments', auth, [
  body('content').trim().notEmpty().withMessage('Comment content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    ticket.comments.push({
      user: req.user._id,
      content: req.body.content
    });

    await ticket.save();
    await ticket.populate('comments.user', 'username fullName avatar');
    await ticket.populate('assignee', 'username fullName avatar');
    await ticket.populate('reporter', 'username fullName avatar');

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


