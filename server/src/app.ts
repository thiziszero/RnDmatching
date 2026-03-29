import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import announcementRouter from './routes/announcementRouter';

dotenv.config();

const app = express();

// 미들웨어
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({ 
    origin: ["http://localhost:5173"],
}));
app.use(express.json());

// API 응답 타입
interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
}

app.use('/api/announcement', announcementRouter);


// 서버 시작
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;