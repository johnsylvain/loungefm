import express from 'express';
import * as dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from "cors";
import pino from 'pino';
import queue from "./engine/queue.engine";
import './database';

dotenv.config()

const logger = pino({ level: 'info' });
const app = express();

app.use(helmet());
app.use(morgan(`${process.env.MORGAN}`));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

(async () => {  
    await queue.loadTracks("audio");
    queue.play();

    app.get("/", (req, res) => {
        const { id, client } = queue.addClient();

        res.set({
            "Content-Type": "audio/mp3",
            "Transfer-Encoding": "chunked",
        }).status(200);

        client.pipe(res);

        req.on("close", () => {
            queue.removeClient(id);
        });
    });

    app.listen(process.env.PORT, () => {
        return logger.info(`Express is listening at http://localhost:${process.env.PORT}`);
    });
})();


