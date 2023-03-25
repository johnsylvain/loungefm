import express from 'express';
import * as dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from "cors";
import pino from 'pino';
// import './database'
import api from "./routes/stream.routes";


dotenv.config()

const app = express();
app.use(helmet());
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

let http = require("http").Server(app);

app.use(api);

app.listen(process.env.PORT, () => {
  return logger.info(`Express is listening at http://localhost:${process.env.PORT}`);
});