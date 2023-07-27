import { Response, RequestHandler } from 'express'
import mongoose from 'mongoose'
import songSchema from '../schema/song.schema'
import likeSchema from '../schema/like.schema'

export const getStatus: RequestHandler = async (req, res) => {
    try {
        return res.status(200).json()
    } catch (error) {
        return res.status(303)
    }
}

export const postLike: RequestHandler = async (req, res) => {
    try {
        const { id, userID } = req.params
        let liked: boolean = false
        if (!id && userID) return res.status(303).json()
        const results = await likeSchema.findOne({
            songId: id,
            userId: userID,
        })

        if (!results) {
            liked = true

            await new likeSchema({
                songId: id,
                userId: userID,
            }).save()
        } else {
            await likeSchema.deleteOne({
                songId: id,
                userId: userID,
            })
        }

        return res.status(200).json({
            liked,
        })
    } catch (error) {
        return res.status(303).json({
            liked: false,
        })
    }
}

export const getTrackbyID: RequestHandler = async (req, res) => {
    try {
        let id: any = null
        id = req.query.id || req.params.id
        const _id = new mongoose.Types.ObjectId(id)

        if (id) {
            const response = await songSchema.findOne({
                _id,
            })

            return res.status(200).json({ data: response })
        }
        return res.status(303).json()
    } catch (error) {
        return res.status(303).json()
    }
}

export const getSearch: RequestHandler = async (req, res) => {
    try {
        const page: number = parseInt(`${req.query.page}`) || 1
        const limit: number = parseInt(`${req.query.limit}`) || 10

        const startIndex = (page - 1) * limit
        const endIndex = page * limit

        const searchTerm = req.query.title || req.params.title

        if (searchTerm) {
            const countQuery = songSchema.aggregate([
                {
                    $match: {
                        $or: [
                            { title: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive title search using regex
                            { artist: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive artist search using regex
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
                            { title: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive title search using regex
                            { artist: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive artist search using regex
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

            return res.status(200).json({
                data: response,
                total,
                totalPages,
                currentPage: page,
            })
        }
        return res.status(303).json()
    } catch (error) {
        return res.status(303).json()
    }
}

export const getAllTracksByArtist: RequestHandler = async (req, res) => {
    try {
        const page: number = parseInt(`${req.query.page}`) || 1
        const limit: number = parseInt(`${req.query.limit}`) || 10

        const startIndex = (page - 1) * limit
        const endIndex = page * limit

        const title = req.query.title || req.params.title

        if (title) {
            const countQuery = songSchema.aggregate([
                {
                    $match: {
                        art: {
                            $ne: 'https://slikouronlife.co.za/themes/slikourapp/assets/images/Square-audio-placeholders.png',
                        },
                    },
                },
                {
                    $match: {
                        artist: { $regex: title, $options: 'i' },
                    },
                },
                {
                    $count: 'totalCount',
                },
            ])

            const response = await songSchema.aggregate([
                {
                    $match: {
                        title: { $regex: title, $options: 'i' },
                        art: {
                            $ne: 'https://slikouronlife.co.za/themes/slikourapp/assets/images/Square-audio-placeholders.png',
                        },
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

            return res.status(200).json({
                data: response,
                total,
                totalPages,
                currentPage: page,
            })
        }
        return res.status(303).json()
    } catch (error) {
        return res.status(303).json()
    }
}

export const getRandom: RequestHandler = async (req, res) => {
    try {
        const limit: number = parseInt(`${req.query.limit}`) || 3

        const response = await songSchema.aggregate([
            {
                $sample: { size: limit },
            },
        ])

        return res.status(200).json({
            data: response,
        })
    } catch (error) {
        return res.status(303).json()
    }
}

export const getAllTracks: RequestHandler = async (req, res) => {
    try {
        const page: number = parseInt(`${req.query.page}`) || 1
        const limit: number = parseInt(`${req.query.limit}`) || 10

        const startIndex = (page - 1) * limit

        const countQuery = songSchema.aggregate([
            {
                $sample: { size: limit },
            },
            {
                $count: 'totalCount',
            },
        ])

        const response = await songSchema.aggregate([
            {
                $sample: { size: limit },
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

        return res.status(200).json({
            data: response,
            total,
            totalPages,
            currentPage: page,
        })
    } catch (error) {
        console.log(error)
        return res.status(303).json({})
    }
}
