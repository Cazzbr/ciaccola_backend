import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { getMessages, createMessage } from '../controllers/messageController.js';

const router = Router();

router.use(auth);

router.get('/:chatId', getMessages);
router.post('/:chatId', createMessage);

export default router;
