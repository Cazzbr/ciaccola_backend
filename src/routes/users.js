import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { getProfile, updateProfile, deleteProfile, addContact, getContacts } from '../controllers/userController.js';

const router = Router();
router.use(auth);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.delete('/profile', deleteProfile)
router.post('/contacts', addContact);
router.get('/contacts', getContacts);

export default router;

