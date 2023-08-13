import { TRPCError } from '@trpc/server'
import dotenv from 'dotenv'
import songSchema from '../schema/song.schema'
import likeSchema from '../schema/like.schema'
import { z } from 'zod'
dotenv.config()

export const getAllSongs = async ({
    limit,
    page,
}: {
    limit: number
    page: number
}) => {
    try {
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
        throw new TRPCError({
            code: 'TIMEOUT',
            message: 'Cant get songs at this moment, please try again later',
        })
    }
}

export const searchSongs = async ({
    limit,
    page,
    searchText,
}: {
    limit: number
    page: number
    searchText: string
}) => {
    try {
        const startIndex = (page - 1) * limit

        const countQuery = songSchema.aggregate([
            {
                $match: {
                    $or: [
                        { title: { $regex: searchText, $options: 'i' } }, // Case-insensitive title search using regex
                        { artist: { $regex: searchText, $options: 'i' } }, // Case-insensitive artist search using regex
                    ],
                },
            },
            {
                $count: 'totalCount',
            },
        ])

        const response = await songSchema.aggregate([
            {
                $match: {
                    $or: [
                        { title: { $regex: searchText, $options: 'i' } }, // Case-insensitive title search using regex
                        { artist: { $regex: searchText, $options: 'i' } }, // Case-insensitive artist search using regex
                    ],
                },
            },
            {
                $skip: startIndex,
            },
            {
                $limit: limit,
            },
        ])

        const [totalCount, data] = await Promise.all([countQuery, response])

        const total = totalCount.length > 0 ? totalCount[0].totalCount : 0
        const totalPages = Math.ceil(total / limit)

        return {
            data: response,
            total,
            totalPages,
            currentPage: page,
        }
    } catch (error: any) {
        throw new TRPCError({
            code: 'TIMEOUT',
            message: 'Cant get songs at this moment, please try again later',
        })
    }
}

export const likeSong = async ({
    id,
    userID,
}: {
    id: string
    userID: string
}) => {
    try {
        let liked: boolean = false

        const results = await likeSchema.findOne({
            songId: id,
            userId: userID,
        })

        if (results) {
            await likeSchema.findOneAndDelete({
                songId: id,
                userId: userID,
            })
        } else {
            liked = true
            await likeSchema.create({
                songId: id,
                userId: userID,
            })
        }

        return {
            liked,
        }
    } catch (error: any) {
        throw new TRPCError({
            code: 'TIMEOUT',
            message: 'Cant get songs at this moment, please try again later',
        })
    }
}

export const getUserLikes = async ({ userID }: { userID: string }) => {
    try {
        const results = await likeSchema.find({
            userId: userID,
        })
    } catch (error: any) {
        throw new TRPCError({
            code: 'TIMEOUT',
            message: 'Cant get songs at this moment, please try again later',
        })
    }
}
