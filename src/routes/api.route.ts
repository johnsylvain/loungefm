import { object, string } from 'zod'
import { trpc } from '../utils/trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { getAllSongs, searchSongs } from '../controllers/song.controller'

const isAuthorized = trpc.middleware(({ ctx, next }) => {
    console.log(ctx.req)
    if (!ctx) {
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to access this resource',
        })
    }
    return next()
})

export const isAuthorizedProcedure = trpc.procedure.use(isAuthorized)

export const apiRoute = trpc.router({
    getSongs: isAuthorizedProcedure.query(({ ctx }) => {
        const response = getAllSongs({ ctx })
        return response
    }),
    searchSongs: isAuthorizedProcedure.query(({ ctx }) => {
        const response = searchSongs({ ctx })
        return response
    }),
})
