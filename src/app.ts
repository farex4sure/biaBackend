import express from 'express';
import dotenv from 'dotenv';
import { json, urlencoded } from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';
import morgan from 'morgan';
import routes from './modules/index';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// Middleware
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:3003', 'https://webtray.ng'];

app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            'https://web-tray.vercel.app',
            'https://webtray.ng',
            'http://localhost:3000',
            'http://localhost:3003'
        ];
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            return callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 hours
}));


app.use(json());
app.use(urlencoded({ extended: true }));
app.use(morgan('dev'));	// Log requests to the console
app.use(cookieParser());

// Mount routes
app.use('/api/v1', routes);

// Error handling middleware
app.use(errorHandler);

export default app;
