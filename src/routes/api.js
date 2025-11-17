import express from 'express';
import RelayController from '../controllers/relayController.js';
import ScheduleController from '../controllers/scheduleController.js';

const router = express.Router();

router.get('/relays/', RelayController.getAll);
router.post('/relays/', RelayController.create);
router.post('/relays/:id/', RelayController.update);
router.delete('/relays/:id/', RelayController.delete);

router.post('/schedule/', ScheduleController.create);
// router.post('/schedule/:id/cancel', ScheduleController.cancel);

export default router;
