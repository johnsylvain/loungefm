import express from 'express'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import dotenv from 'dotenv'
import cors from 'cors'
import { createContext } from './utils/trpc'
import { database as connectDatabase } from './utils/database'
import { apiRoute } from './routes/api.route'
import { renderTrpcPanel } from 'trpc-panel'

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

app.use('/panel', (_, res) => {
    return res.send(
        renderTrpcPanel(apiRoute, { url: 'http://localhost:8080/api' })
    )
})

app.listen(process.env.PORT, () => {
    console.log(`🚀 Server listening on port ${process.env.PORT}`)
    connectDatabase()
})

export type ApiRoute = typeof apiRoute
