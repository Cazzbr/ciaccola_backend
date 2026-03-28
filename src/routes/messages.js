import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { getMessages, createMessage, deleteMessage } from '../controllers/messageController.js';

const router = Router();

router.use(auth);

/*
  #swagger.tags = ['Messages']
  #swagger.description = 'Fetch messages in a chat for the authenticated user.'
  #swagger.parameters['chatId'] = { description: 'Chat room ID', in: 'path', required: true, type: 'string' }
  #swagger.parameters['limit'] = { description: 'Maximum number of messages', in: 'query', required: false, type: 'integer' }
  #swagger.parameters['before'] = { description: 'Fetch messages before this timestamp', in: 'query', required: false, type: 'string' }
*/
router.get('/:chatId', getMessages);
/*
  #swagger.tags = ['Messages']
  #swagger.description = 'Create a new message metadata object.'
  #swagger.parameters['chatId'] = { description: 'Chat room ID', in: 'path', required: true, type: 'string' }
  #swagger.parameters['body'] = {
    in: 'body',
    description: 'Message metadata payload',
    schema: {
      recipient_username: 'recipient_username',
      type: 'text',
      duration: 10
    }
  }
*/
router.post('/:chatId', createMessage);
router.delete('/:chatId/:id', deleteMessage);

export default router;
