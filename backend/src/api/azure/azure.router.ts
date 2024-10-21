import express from 'express';
import { analyzeImageController } from './azure.controller';

const router = express.Router();
router.post('/analyze', analyzeImageController);


export default router;