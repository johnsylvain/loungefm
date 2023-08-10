import express from 'express'
import * as dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import cors from 'cors'
import pino from 'pino'
import queue from './engine/queue.engine'
import './database'
import { startup } from './util/startup'
import songRouter from './routes/song.route'
import uploadRouter from './routes/upload.route'

dotenv.config()
startup()

let uploads: number = 0
let state: string = 'idle'

const logger = pino({ level: 'info' })
const app = express()

app.use(
    helmet({
        crossOriginResourcePolicy: false,
    })
)
app.use(morgan(`${process.env.MORGAN}`))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(songRouter)
app.use(uploadRouter)
;(async () => {
    const getFiles = async () => {
        await queue.loadTracks('upload/audio')
        uploads = parseInt(`${queue.tracks.length}`)
        if (uploads > 0) {
            state = 'uploaded'
        }
    }

    const play = async () => {
        queue.play()
        state = 'playing'
    }

    app.get('/stream', (req, res) => {
        const { id, client } = queue.addClient()

        res.set({
            'Content-Type': 'audio/mp3',
            'Transfer-Encoding': 'chunked',
        }).status(200)
        client.pipe(res)
        req.on('close', () => {
            queue.removeClient(id)
        })
    })

    app.listen(process.env.PORT, () => {
        return logger.info(
            `Express is listening at http://localhost:${process.env.PORT}`
        )
    })
})()
