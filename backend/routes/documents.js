const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const Document = require('../models/Document');
const { authenticate, authorize } = require('../middleware/auth');
const InkeepService = require('../services/inkeepService');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, search } = req.query;
    const query = {
      $or: [
        { owner: req.user.id },
        { collaborators: req.user.id }
      ]
    };

    if (status) query.status = status;
    if (type) query.type = type;
    if (search) {
      query.$text = { $search: search };
    }

    const documents = await Document.find(query)
      .populate('owner', 'name email')
      .populate('collaborators', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ updatedAt: -1 });

    const count = await Document.countDocuments(query);

    res.json({
      documents,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

router.get('/:id',
  authenticate,
  [param('id').isMongoId().withMessage('Invalid document ID')],
  handleValidationErrors,
  async (req, res) => {
    try {
      const document = await Document.findById(req.params.id)
        .populate('owner', 'name email')
        .populate('collaborators', 'name email');

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      if (document.owner._id.toString() !== req.user.id && 
          !document.collaborators.some(c => c._id.toString() === req.user.id)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(document);
    } catch (error) {
      console.error('Get document error:', error);
      res.status(500).json({ error: 'Failed to fetch document' });
    }
  }
);

router.post('/',
  authenticate,
  [
    body('title').notEmpty().trim().withMessage('Title is required'),
    body('type').isIn(['prd', 'spec', 'roadmap', 'user-story', 'epic', 'feature', 'other']),
    body('content').notEmpty().withMessage('Content is required')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const documentData = {
        ...req.body,
        owner: req.user.id,
        metadata: {
          version: 1,
          lastEditedBy: req.user.id
        }
      };

      const document = await Document.create(documentData);
      
      const inkeepService = new InkeepService();
      await inkeepService.indexDocument(document);

      const populatedDocument = await Document.findById(document._id)
        .populate('owner', 'name email')
        .populate('collaborators', 'name email');

      res.status(201).json(populatedDocument);
    } catch (error) {
      console.error('Create document error:', error);
      res.status(500).json({ error: 'Failed to create document' });
    }
  }
);

router.put('/:id',
  authenticate,
  [
    param('id').isMongoId().withMessage('Invalid document ID'),
    body('title').optional().trim(),
    body('content').optional(),
    body('status').optional().isIn(['draft', 'review', 'approved', 'published', 'archived'])
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const document = await Document.findById(req.params.id);

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      if (document.owner.toString() !== req.user.id && 
          !document.collaborators.includes(req.user.id)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      Object.keys(req.body).forEach(key => {
        if (req.body[key] !== undefined && key !== 'metadata') {
          document[key] = req.body[key];
        }
      });

      document.metadata.version += 1;
      document.metadata.lastEditedBy = req.user.id;

      await document.save();

      const inkeepService = new InkeepService();
      await inkeepService.indexDocument(document, true);

      const updatedDocument = await Document.findById(document._id)
        .populate('owner', 'name email')
        .populate('collaborators', 'name email');

      res.json(updatedDocument);
    } catch (error) {
      console.error('Update document error:', error);
      res.status(500).json({ error: 'Failed to update document' });
    }
  }
);

router.delete('/:id',
  authenticate,
  [param('id').isMongoId().withMessage('Invalid document ID')],
  handleValidationErrors,
  async (req, res) => {
    try {
      const document = await Document.findById(req.params.id);

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      if (document.owner.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Only document owner can delete' });
      }

      await document.deleteOne();

      res.json({ message: 'Document deleted successfully' });
    } catch (error) {
      console.error('Delete document error:', error);
      res.status(500).json({ error: 'Failed to delete document' });
    }
  }
);

router.post('/:id/collaborators',
  authenticate,
  [
    param('id').isMongoId().withMessage('Invalid document ID'),
    body('userId').isMongoId().withMessage('Invalid user ID')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const document = await Document.findById(req.params.id);

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      if (document.owner.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Only document owner can add collaborators' });
      }

      if (!document.collaborators.includes(req.body.userId)) {
        document.collaborators.push(req.body.userId);
        await document.save();
      }

      const updatedDocument = await Document.findById(document._id)
        .populate('collaborators', 'name email');

      res.json(updatedDocument.collaborators);
    } catch (error) {
      console.error('Add collaborator error:', error);
      res.status(500).json({ error: 'Failed to add collaborator' });
    }
  }
);

router.delete('/:id/collaborators/:userId',
  authenticate,
  [
    param('id').isMongoId().withMessage('Invalid document ID'),
    param('userId').isMongoId().withMessage('Invalid user ID')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const document = await Document.findById(req.params.id);

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      if (document.owner.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Only document owner can remove collaborators' });
      }

      document.collaborators = document.collaborators.filter(
        id => id.toString() !== req.params.userId
      );
      await document.save();

      res.json({ message: 'Collaborator removed successfully' });
    } catch (error) {
      console.error('Remove collaborator error:', error);
      res.status(500).json({ error: 'Failed to remove collaborator' });
    }
  }
);

module.exports = router;