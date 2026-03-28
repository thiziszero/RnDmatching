import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// 미들웨어
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// API 응답 타입
interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
}

// 기본 라우트
app.get('/api/health', (_req: Request, res: Response<ApiResponse>) => {
  res.json({
    success: true,
    data: null,
    message: 'Server is running'
  });
});

// 서버 시작
// macOS는 5000번을 AirPlay 수신기가 쓰므로 기본값은 5050 사용
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;