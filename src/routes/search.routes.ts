import { Router } from 'express';
import * as searchController from '../controllers/search.controller';

const router = Router();

router.get('/contractors', searchController.searchContractors);

export default router;
