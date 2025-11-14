import express from 'express';
import { RelayController } from '../controllers/relayController.js';
import * as ScheduleController from '../controllers/scheduleController.js';

const router = express.Router();

router.get('/relay/', RelayController.getAll);
router.post('/relay/', RelayController.create);
// router.post('/relay/:id/:action(on|off)', RelayController.manualToggle);

// router.get('/schedule/', ScheduleController.list);
// router.post('/schedule/', ScheduleController.create);
// router.post('/schedule/:id/cancel', ScheduleController.cancel);

export default router;
