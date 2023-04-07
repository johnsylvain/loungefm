import express from 'express';
import * as dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from "cors";
import pino from 'pino';
import queue from "./engine/queue.engine";
import './database';
import path from  'path';
import fs from  'fs';
const ytdl = require('ytdl-core');
import { v4 as uuidv4 } from 'uuid';
import {playlist} from './playlist'

const reqOptions = {
  requestOptions: {
    headers: {
      Cookie:
        'CONSENT=YES+DE.de+V14+BX; VISITOR_INFO1_LIVE=kYpNG7OoCbY; PREF=al=de&f4=4000000; SID=3geAZGdQt9hIJxt0ST2xySpK_6yaw0kvNarw6v9JTDpZQoKQ5FK1nYqc3dXGQzpM4GRWbA.; __Secure-3PSID=3geAZGdQt9hIJxt0ST2xySpK_6yaw0kvNarw6v9JTDpZQoKQ_zINvfbB7jPNTk2I3oTLYg.; HSID=ApvJR6aSSMIpzAioX; SSID=A4qjlas1kBmX90vX0; APISID=uKTdp7kEoR-Th5wk/Ajvd4cTFRNTvsnnPY; SAPISID=h6Tyds3npH_icpOT/Ae34WsO4j7jVpaLFp; __Secure-3PAPISID=h6Tyds3npH_icpOT/Ae34WsO4j7jVpaLFp; LOGIN_INFO=AFmmF2swRQIhAOZ3RDhhitXMYTD-meEWipRIFho5YaO05aGgteYU2w9SAiA-OKgaB64v_a2AWsOfiJk1JJW6miXXu64EibIGjReNdg:QUQ3MjNmeGs2UTRLWDVYNDNnUVNGRFQ0bThEeGl0ZVpJd2haQldweWpJbFNLTEMtNlJHRmJGTlE2SDc3Rkdyb282elprUllkQnRqc0RJYnNiUzhYNnJ3MENBYjNkcmo2dnFqTFNtMDJCTTJBdV9MMlNvYmdiS2xaOFZvUjFsTk5OX0xFZGQ2M2x1SFZKbEZFSFJ1Z3RXeUxfXzNGZmxsZTdkV3dFWFBOUElMN1B0T0pKemw2aU1F; YSC=hgmjViK_jxo; SIDCC=AJi4QfHbV2YQFgcCjOAOdQG0JWvpGtoxBGtAhNp3rJyU223hoL_CV6Aj3BrLOiQYlZEgVrCwg1I; __Secure-3PSIDCC=AJi4QfGrxA6SlqFGd46AK01jAKdxmwFHWC9u4uFW1t4dnB3lhPCZ-3Gr-Bv2E5LK55HMANtVMQ',
    },
  },
};

dotenv.config()

const logger = pino({ level: 'info' });
const app = express();

app.use(helmet());
app.use(morgan(`${process.env.MORGAN}`));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


const download = (url: string) => {
  try{
    ytdl(url, { format:'.mp3', filter: 'audioonly', ...reqOptions })
      .on('progress', (chunkLength, downloaded: number, total: number) => {
        const download = (downloaded / 1024 / 1024).toFixed(2);
        console.log(`${download}MB`);
      }).pipe(fs.createWriteStream(`audio/${uuidv4()}.mp3`));
  }catch(error){
    console.log('error:', error)
  }
}

(async () => {  
    console.log('play')

    const play = () => {
      // await queue.loadTracks("audio");
      // queue.play();
    }

    await playlist.map(async(url: string) => {
      await download(url)
    });
   
    
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


