// repudiation.ts

import * as express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// function for Repudiation 
export const logUserActivity = (req: express.Request): void => {
  const logEntry = `${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${req.ip}\n`;
  fs.appendFileSync(path.join(__dirname, 'userActivity.log'), logEntry);
};

//  Repudiation 
router.use((req, res, next) => {
  logUserActivity(req);

  next();
});


export default router;
