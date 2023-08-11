import { TRPCError } from '@trpc/server'
import { Context } from '../utils/trpc'
import dotenv from 'dotenv'
import songSchema from '../schema/song.schema'
dotenv.config()

export const getAllSongs = async ({ ctx }: { ctx: Context }) => {
    try {
        const page: number = parseInt(`${ctx.req.query.page}`) || 1
        const limit: number = parseInt(`${ctx.req.query.limit}`) || 10

        const startIndex = (page - 1) * limit

        const totalQueryResult = await songSchema.aggregate([
            {
                $group: {
                    _id: null,
                    totalCount: { $sum: 1 },
                },
            },
        ])

        const total =
            totalQueryResult.length > 0 ? totalQueryResult[0].totalCount : 0
        const totalPages = Math.ceil(total / limit)

        const response = await songSchema.aggregate([
            { $sample: { size: total } },
            {
                $project: {
                    artist: 1,
                    title: 1,
                    link: 1,
                    artwork: 1,
                },
            },
        ])

        const data = response.slice(startIndex, startIndex + limit)

        return {
            data,
            total,
            totalPages,
            currentPage: page,
        }
    } catch (error: any) {
        console.log(error)
        throw new TRPCError({
            code: 'TIMEOUT',
            message: 'Cant get songs at this moment, please try again later',
        })
    }
}

export const searchSongs = async ({ ctx }: { ctx: Context }) => {
    try {
        const page: number = parseInt(`${ctx.req.query.page}`) || 1
        const limit: number = parseInt(`${ctx.req.query.limit}`) || 10

        const startIndex = (page - 1) * limit

        const totalQueryResult = await songSchema.aggregate([
            {
                $group: {
                    _id: null,
                    totalCount: { $sum: 1 },
                },
            },
        ])

        const total =
            totalQueryResult.length > 0 ? totalQueryResult[0].totalCount : 0
        const totalPages = Math.ceil(total / limit)

        const response = await songSchema.aggregate([
            { $sample: { size: total } },
            {
                $project: {
                    artist: 1,
                    title: 1,
                    link: 1,
                    artwork: 1,
                },
            },
        ])

        const data = response.slice(startIndex, startIndex + limit)

        return {
            data,
            total,
            totalPages,
            currentPage: page,
        }
    } catch (error: any) {
        console.log(error)
        throw new TRPCError({
            code: 'TIMEOUT',
            message: 'Cant get songs at this moment, please try again later',
        })
    }
}
