import express from 'express';
import visionRouter from './azure/azure.router';

const router = express.Router();

router.use('/azure', visionRouter);

export default router;