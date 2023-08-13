import { object, string } from 'zod'
import { trpc } from '../utils/trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import {
    getAllSongs,
    searchSongs,
    likeSong,
} from '../controllers/song.controller'

const isAuthorized = trpc.middleware(({ ctx, next }) => {
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
    getSongs: isAuthorizedProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(100),
                page: z.number().min(1),
            })
        )
        .query(async (opts) => {
            const { input } = opts
            const { limit, page } = input

            if (!limit || !page) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'expects limit and page as input',
                })
            }

            const response = await getAllSongs(input)

            return response
        }),
    searchSongs: isAuthorizedProcedure
        .input(
            z.object({
                searchText: z.string(),
                limit: z.number(),
                page: z.number(),
            })
        )
        .query(async (opts) => {
            const { input } = opts
            const { limit, page, searchText } = input
            if (!limit || !page || !searchText) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'expects limit and page as input',
                })
            }

            const response = await searchSongs(input)

            return response
        }),
    likeSong: isAuthorizedProcedure
        .input(
            z.object({
                id: z.string(),
                userID: z.string(),
            })
        )
        .mutation(async (opts) => {
            const { input } = opts
            const { id, userID } = input
            if (!id || !userID) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'expects id as input',
                })
            }

            const response = await likeSong(input)

            return response
        }),
    getUserLikes: isAuthorizedProcedure
        .input(
            z.object({
                id: z.string(),
                userID: z.string(),
            })
        )
        .query(async (opts) => {
            const { input } = opts
            const { id, userID } = input
            if (!id || !userID) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'expects id as input',
                })
            }

            const response = await likeSong(input)

            return response
        }),
    getSongLikes: isAuthorizedProcedure
        .input(
            z.object({
                id: z.string(),
                userID: z.string(),
            })
        )
        .query(async (opts) => {
            const { input } = opts
            const { id, userID } = input
            if (!id || !userID) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'expects id as input',
                })
            }

            const response = await likeSong(input)

            return response
        }),
})
