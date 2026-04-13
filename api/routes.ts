import { Router } from 'express';
import ScrapeController from './controllers/ScrapeController';
import ResultsController from './controllers/ResultsController';

const router = Router();

// API routes
router.post('/scrape', ScrapeController.scrape);
router.get('/results', ResultsController.getResults);

export default router;