import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { getProfile, updateProfile, deleteProfile, addContact, acceptContactInvite, toggleContactStatus, searchUsers } from '../controllers/userController.js';

const router = Router();
router.use(auth);

/*
  #swagger.tags = ['Users']
  #swagger.description = 'Get current authenticated user profile.'
*/
router.get('/profile', getProfile);
/*
  #swagger.tags = ['Users']
  #swagger.description = 'Update profile data such as email, password and role. Contacts are not modified here.'
  #swagger.parameters['body'] = {
    in: 'body',
    description: 'Profile update payload',
    schema: {
      $email: 'user@example.com',
      $password: 'newStrongPassword',
      role: 'admin'
    }
  }
*/
router.put('/profile', updateProfile);
/*
  #swagger.tags = ['Users']
  #swagger.description = 'Delete the current authenticated user profile.'
*/
router.delete('/profile', deleteProfile)
/*
  #swagger.tags = ['Users']
  #swagger.description = 'Send a contact invite to another user.'
  #swagger.parameters['body'] = {
    in: 'body',
    description: 'Contact request payload',
    schema: { contact_username: 'friend_username' }
  }
*/
router.post('/contacts', addContact);
/*
  #swagger.tags = ['Users']
  #swagger.description = 'Accept a pending contact invite from another user.'
  #swagger.parameters['body'] = {
    in: 'body',
    description: 'Accept contact invite payload',
    schema: { contact_username: 'friend_username' }
  }
*/
router.put('/contacts', acceptContactInvite);
/*
  #swagger.tags = ['Users']
  #swagger.description = 'Toggle a contact between accepted and blocked.'
  #swagger.parameters['id'] = { description: 'Contact subdocument ID', in: 'path', required: true, type: 'string' }
*/
router.patch('/contacts/:id', toggleContactStatus);
/*
  #swagger.tags = ['Users']
  #swagger.description = 'Search users by username or email. Optional limit query parameter controls the maximum number of results.'
  #swagger.parameters['term'] = { description: 'Search keyword', in: 'path', required: true, type: 'string' }
  #swagger.parameters['limit'] = { description: 'Maximum number of results', in: 'query', required: false, type: 'integer' }
*/
router.get('/search/:term', searchUsers);

export default router;

