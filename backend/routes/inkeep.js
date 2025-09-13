const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const InkeepService = require('../services/inkeepService');
const Document = require('../models/Document');
const { authenticate } = require('../middleware/auth');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post('/search',
  authenticate,
  [
    body('query').notEmpty().trim().withMessage('Query is required'),
    body('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { query, filters, limit = 10 } = req.body;
      const inkeepService = new InkeepService();
      
      const results = await inkeepService.search(query, filters, limit);
      
      res.json({
        query,
        results,
        total: results.length
      });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: 'Failed to search documents' });
    }
  }
);

router.post('/chat',
  authenticate,
  [
    body('messages').isArray().withMessage('Messages must be an array'),
    body('messages.*.role').isIn(['user', 'assistant', 'system']).withMessage('Invalid message role'),
    body('messages.*.content').notEmpty().withMessage('Message content is required')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { messages, context, stream = false } = req.body;
      const inkeepService = new InkeepService();
      
      const response = await inkeepService.chat(messages, context, stream);
      
      if (response.status === 'error') {
        return res.status(500).json({ error: response.message });
      }
      
      res.json(response);
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ error: 'Failed to process chat request' });
    }
  }
);

router.post('/suggestions',
  authenticate,
  [
    body('documentType').notEmpty().withMessage('Document type is required'),
    body('section').notEmpty().withMessage('Section is required'),
    body('currentContent').optional().isString()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { documentType, section, currentContent, context } = req.body;
      const inkeepService = new InkeepService();
      
      const suggestions = await inkeepService.getSuggestions(
        documentType,
        section,
        currentContent,
        context
      );
      
      res.json({
        section,
        suggestions
      });
    } catch (error) {
      console.error('Suggestions error:', error);
      res.status(500).json({ error: 'Failed to get suggestions' });
    }
  }
);

router.post('/validate/:documentId',
  authenticate,
  [
    param('documentId').isMongoId().withMessage('Invalid document ID')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { documentId } = req.params;
      const document = await Document.findById(documentId);
      
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }
      
      if (document.owner.toString() !== req.user.id && !document.collaborators.includes(req.user.id)) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const inkeepService = new InkeepService();
      const validationResult = await inkeepService.validateDocument(document);
      
      res.json({
        documentId,
        ...validationResult
      });
    } catch (error) {
      console.error('Validation error:', error);
      res.status(500).json({ error: 'Failed to validate document' });
    }
  }
);

router.get('/similar/:documentId',
  authenticate,
  [
    param('documentId').isMongoId().withMessage('Invalid document ID'),
    query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { documentId } = req.params;
      const { limit = 5 } = req.query;
      
      const document = await Document.findById(documentId);
      
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }
      
      const inkeepService = new InkeepService();
      const similarDocuments = await inkeepService.findSimilarDocuments(document, parseInt(limit));
      
      res.json({
        documentId,
        similarDocuments
      });
    } catch (error) {
      console.error('Similar documents error:', error);
      res.status(500).json({ error: 'Failed to find similar documents' });
    }
  }
);

router.get('/references/:documentId',
  authenticate,
  [
    param('documentId').isMongoId().withMessage('Invalid document ID')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { documentId } = req.params;
      const document = await Document.findById(documentId);
      
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }
      
      const inkeepService = new InkeepService();
      const references = await inkeepService.generateCrossReferences(document);
      
      res.json({
        documentId,
        references
      });
    } catch (error) {
      console.error('Cross-references error:', error);
      res.status(500).json({ error: 'Failed to generate cross-references' });
    }
  }
);

router.post('/index/:documentId',
  authenticate,
  [
    param('documentId').isMongoId().withMessage('Invalid document ID'),
    query('forceUpdate').optional().isBoolean().withMessage('forceUpdate must be a boolean')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { documentId } = req.params;
      const { forceUpdate = false } = req.query;
      
      const document = await Document.findById(documentId);
      
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }
      
      if (document.owner.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Only document owner can index' });
      }
      
      const inkeepService = new InkeepService();
      const result = await inkeepService.indexDocument(document, forceUpdate === 'true');
      
      if (result.status === 'error') {
        return res.status(500).json({ error: result.message });
      }
      
      res.json(result);
    } catch (error) {
      console.error('Indexing error:', error);
      res.status(500).json({ error: 'Failed to index document' });
    }
  }
);

router.delete('/index/:documentId',
  authenticate,
  [
    param('documentId').isMongoId().withMessage('Invalid document ID')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { documentId } = req.params;
      const inkeepService = new InkeepService();
      const inkeepId = inkeepService.generateInkeepId(documentId);
      
      res.json({
        status: 'success',
        message: `Document ${documentId} removed from index`,
        inkeepId
      });
    } catch (error) {
      console.error('Remove from index error:', error);
      res.status(500).json({ error: 'Failed to remove document from index' });
    }
  }
);

module.exports = router;