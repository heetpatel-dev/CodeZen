import express from 'express';
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from './routes/auth.route.js';
import problemRoutes from './routes/problem.route.js';
import executionRoutes from './routes/executeCode.route.js';
import submissionRoutes from './routes/submission.route.js';
import playlistRoutes from './routes/playlist.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5500;


app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
}));

app.use( express.json() );
app.use( cookieParser() );

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/problems", problemRoutes);
app.use("/api/v1/execute-code", executionRoutes);
app.use("/api/v1/submission", submissionRoutes);
app.use("/api/v1/playlist", playlistRoutes);


app.listen(PORT, () => {
    console.log(`Server is Running at Port: ${PORT}`)
})