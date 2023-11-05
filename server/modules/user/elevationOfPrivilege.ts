// elevationOfPrivilege.ts

import * as express from 'express';
import { UserDB } from '../../models/userModel';

const router = express.Router();

router.post('/change-role', async (req, res) => {
  try {
    const { username, newRole } = req.body;

    const user = await UserDB.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (newRole === 'admin' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Permission denied' });
    }

    user.role = newRole;
    await user.save();

    res.status(200).json({ message: 'Role changed successfully', data: { username: user.username, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
