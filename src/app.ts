import express from 'express'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'
import { createContext } from './utils/trpc'
import { database as connectDatabase } from './utils/database'
import { songRoute } from './routes/song.route'

dotenv.config()
const app = express()
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'))
app.use(cors)

app.use(
    '/song',
    createExpressMiddleware({
        router: songRoute,
        createContext,
    })
)

app.listen(process.env.PORT, () => {
    console.log(`🚀 Server listening on port ${process.env.PORT}`)
    connectDatabase()
})

export type SongRoute = typeof songRoute
