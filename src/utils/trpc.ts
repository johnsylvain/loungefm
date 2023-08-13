import { initTRPC } from '@trpc/server'
import { CreateExpressContextOptions } from '@trpc/server/adapters/express'
import { inferAsyncReturnType } from '@trpc/server'

export const createContext = ({ req, res }: CreateExpressContextOptions) => ({
    req,
    res,
})

export type Context = inferAsyncReturnType<typeof createContext>

export const trpc = initTRPC.context<Context>().create()
