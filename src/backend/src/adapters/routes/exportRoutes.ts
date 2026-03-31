/**
 * Export Routes
 */
import express from 'express';
import { ExportController } from '../controllers/ExportController';
import { authenticate } from '../../infrastructure/middleware/auth';

const router = express.Router();
const exportController = new ExportController();

// Export routes (require authentication)
router.get('/export/csv', authenticate, (req, res, next) => exportController.exportCSV(req, res, next));
router.get('/export/excel', authenticate, (req, res, next) => exportController.exportExcel(req, res, next));
router.get('/export/json', authenticate, (req, res, next) => exportController.exportJSON(req, res, next));

export default router;
