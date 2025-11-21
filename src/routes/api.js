import express from 'express';
import RelayController from '../controllers/relayController.js';
import ScheduleController from '../controllers/scheduleController.js';

const router = express.Router();

router.get('/relays/', RelayController.getAll);
router.post('/relays/', RelayController.create);
router.post('/relays/:id/', RelayController.update);
router.delete('/relays/:id/', RelayController.delete);

router.post('/schedules/', ScheduleController.create);
router.post('/schedules/:id/', ScheduleController.update);
router.delete('/schedules/:id/', ScheduleController.delete);

export default router;
