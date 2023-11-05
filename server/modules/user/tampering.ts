// tempering.ts

import * as express from 'express';
import { UserDB } from '../../models/userModel';
import crypto from 'crypto';
import { register, login } from './user.validator';  
import Joi from 'joi';

const router = express.Router();

export const isDataIntegrityValid = (data: string, checksum: string): boolean => {
  const secret = 'some-secret-key';
  const hash = crypto.createHmac('sha256', secret).update(data).digest('hex');
  return hash === checksum;
};

export const validateInput = (input: any, schema: Joi.ObjectSchema): boolean => {
  const { error } = schema.validate(input);
  return !error;
};

// Tampering logic
router.post('/change-data', async (req, res) => {
  const { data, checksum } = req.body;

  if (!isDataIntegrityValid(data, checksum)) {
    return res.status(400).json({ message: 'Data integrity check failed' });
  }

  if (!validateInput(data, register.body)) {  
    return res.status(400).json({ message: 'Invalid input' });
  }

  res.status(200).json({ message: 'Data changed successfully' });
});

export default router;
