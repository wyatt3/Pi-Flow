import express from 'express';
import * as RelayCtrl from '../controllers/relayController.js';

const router = express.Router();

router.get('/', RelayCtrl.list);
router.post('/', RelayCtrl.create);
router.post('/:id/:action(on|off)', RelayCtrl.manualToggle);

export default router;
