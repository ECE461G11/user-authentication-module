// security.controller.ts

import * as express from 'express';
import axios from 'axios';
import { UserDB } from '../../models/userModel';
import bcrypt from 'bcryptjs';

const router = express.Router();

export const isCaptchaValid = async (captchaResponse: string): Promise<boolean> => {
  const RECAPTCHA_ENDPOINT = 'https://www.google.com/recaptcha/api/siteverify';
  const SECRET_KEY = 'YOUR_RECAPTCHA_SECRET_KEY';
  const response = await axios.post(RECAPTCHA_ENDPOINT, null, {
    params: {
      secret: SECRET_KEY,
      response: captchaResponse,
    },
  });
  return response.data.success;
};

router.post('/secure-login', async (req, res) => {
  const { username, password, captchaResponse } = req.body;

  // CAPTCHA 
  if (!(await isCaptchaValid(captchaResponse))) {
    return res.status(400).json({ message: 'Invalid CAPTCHA' });
  }

  // user 
  const user = await UserDB.findOne({ username });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // password
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  res.status(200).json({ message: 'Login successful' });
});

export default router;
