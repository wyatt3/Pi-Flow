import express from 'express';
import * as ScheduleCtrl from '../controllers/scheduleController.js';

const router = express.Router();

router.get('/', ScheduleCtrl.list);
router.post('/', ScheduleCtrl.create);
router.post('/:id/cancel', ScheduleCtrl.cancel);

export default router;
