import { Router } from 'express';
import { register, login, forgotPassword } from '../controllers/authController.js';

const router = Router();

/*
  #swagger.tags = ['Auth']
  #swagger.description = 'Register a new user.'
*/
router.post('/register', register);
/*
  #swagger.tags = ['Auth']
  #swagger.description = 'Authenticate a user and return a JWT token.'
*/
router.post('/login', login);
/*
  #swagger.tags = ['Auth']
  #swagger.description = 'Request a password reset email.'
*/
router.post('/forgot-password', forgotPassword);
export default router;

