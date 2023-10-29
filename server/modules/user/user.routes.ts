import express from 'express';
import { userRegistration, userLogin } from './user.controller';
import { register, login } from './user.validator';
import { validate } from '../../middleware/validate';
const router = express.Router();

router.post('/register', validate(register), userRegistration);
router.post('/login', validate(login), userLogin);

export default router;

