import express from 'express'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import dotenv from 'dotenv'
import cors from 'cors'
import { createContext } from './utils/trpc'
import { database as connectDatabase } from './utils/database'
import { apiRoute } from './routes/api.route'

dotenv.config()
const app = express()
app.use(cors())

app.use(
    '/api',
    createExpressMiddleware({
        router: apiRoute,
        createContext,
    })
)

app.listen(process.env.PORT, () => {
    console.log(`🚀 Server listening on port ${process.env.PORT}`)
    connectDatabase()
})

export type ApiRoute = typeof apiRoute
