import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import router from './modules/user/user.routes';

dotenv.config();
const app = express();
app.use(cors());
const port = process.env.PORT || 8000;

app.use(express.json());
app.use('/api/user', router);

mongoose.connect(process.env.MONGO_URI!, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as any)
.then(() => {
  console.log('MongoDB connected!');

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

