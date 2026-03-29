import express from 'express';
const router = express.Router();
import { getList } from '../controllers/announcementControllers';

router.get('/list', getList);

export default router;