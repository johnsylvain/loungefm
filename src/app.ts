import { Response } from 'express';
import express from 'express';
import * as dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from "cors";
import pino from 'pino';
import * as fs from "fs";
import { PassThrough } from "stream"; 
import Throttle from "throttle";
import {ffprobe} from "@dropb/ffprobe";
import { UUID } from "bson";

// import { Queue } from "./engine/queue";
// import './database'
dotenv.config()

let clients = new Map()
let songs: any[] = [];
let currentSong: any;

const logger = pino({ level: 'info' });
const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const broadcast = (chunk: any) => {
    for (const [, client] of clients) {
        // console.log(client)
        client.write(chunk);
    }
}

const shuffle =(array: any[]) => {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

const loadSongs = async (dir: string) => {
    return new Promise((resolve) => {
      fs.readdir(dir, { withFileTypes: true }, (err, files) => {
        songs = files
          .filter((file) => {
            const parts = file.name.split(".");
            return parts[parts.length - 1] === "mp3";
          })
          .map((file) => `${dir}/${file.name}`);
        songs = shuffle(songs);
        resolve(songs);
      });
    });
}

const getNextSong = async() => {
    const url = songs.shift();
    let data;
    try {
      data = await ffprobe(url);
    } catch (e) {
      console.log(e);
      return await getNextSong()
    }

    let currentSong = {
      url,
      artist: data.format.tags.artist,
      title: data.format.tags.title,
      description: data.format.tags.comment,
      duration: Math.floor(parseFloat(data.format.duration)),
      bitRate:
        data && data.format && data.format.bit_rate
          ? parseInt(data.format.bit_rate)
          : 128000,
    };

    currentSong = currentSong;
    songs.push(url);
    return currentSong;
}

const addClient = () => {
    let client = new PassThrough();
    const id = new UUID();
    clients.set(id, client);
    return { id, client };
}

const play = async() => {
    if (songs.length) {
        const song = await getNextSong();
        let stream = fs.createReadStream(song.url);
        const throttle = new Throttle({
            bps: song.bitRate / 8,
            chunkSize: 512,
        });

        stream
        .pipe(throttle)
        .on("data", (chunk) => broadcast(chunk))
        .on("end", () => play())
        .on("error", () => play());
    }
}

const removeClient = (id) => {
    clients.delete(id);
}

(async () => {
    await loadSongs("./audio");
    await play();
    app.get("/", (request, response) => {
        try{
            const { id, client } = addClient();
            response.status(200)
                .send(client)
                .header({
                    'Content-Type': 'audio/mpeg',
                    "Transfer-Encoding": "chunked",
                });

            request.on("close", () => {
                removeClient(id)
            });
        }catch(error){
            response.status(300)
        }
    })

    app.listen(process.env.PORT, () => {
        return logger.info(`Express is listening at http://localhost:${process.env.PORT}`);
    });
})();