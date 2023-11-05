// informationDisclosure.ts

import * as express from 'express';
import { UserDB } from '../../models/userModel';
import bcrypt from 'bcryptjs';

const router = express.Router();

router.get('/get-data', async (req, res) => {
  try {
    const { username } = req.query;

    const user = await UserDB.findOne({ username: username as string });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = {
      username: user.username,
      role: user.role,
    };

    res.status(200).json({ message: 'Data fetched successfully', data: userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
