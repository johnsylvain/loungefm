import { Response, RequestHandler } from 'express'
import mongoose, { ObjectId } from 'mongoose'
import songSchema from '../schema/song.schema'

const isAllowed = (req, res) => {
    const referer = req.headers.referer

    if (referer !== process.env.ALLOWED_DOMAIN) {
        return true
    }

    return true
}

export const getStatus: RequestHandler = async (req, res) => {
    try {
        if (!isAllowed(req, res)) return res.status(403).end('Access denied')
        return res.status(200).json()
    } catch (error) {
        return res.status(303).json()
    }
}

export const getTrackbyID: RequestHandler = async (req, res) => {
    try {
        if (!isAllowed(req, res)) return res.status(403).end('Access denied')
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
        if (!isAllowed(req, res)) return res.status(403).end('Access denied')
        const page: number = parseInt(`${req.query.page}`) || 1
        const limit: number = parseInt(`${req.query.limit}`) || 10

        const startIndex = (page - 1) * limit
        const endIndex = page * limit

        const title = req.query.title || req.params.title

        if (title) {
            const countQuery = songSchema.aggregate([
                {
                    $match: {
                        title: { $regex: title, $options: 'i' },
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
        if (!isAllowed(req, res)) return res.status(403).end('Access denied')
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
        if (!isAllowed(req, res)) return res.status(403).end('Access denied')
        const limit: number = parseInt(`${req.query.limit}`) || 3

        const response = await songSchema.aggregate([
            {
                $match: {
                    art: {
                        $ne: 'https://slikouronlife.co.za/themes/slikourapp/assets/images/Square-audio-placeholders.png',
                    },
                },
            },
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
        if (!isAllowed(req, res)) return res.status(403).end('Access denied')
        const page: number = parseInt(`${req.query.page}`) || 1
        const limit: number = parseInt(`${req.query.limit}`) || 10

        const startIndex = (page - 1) * limit

        const countQuery = songSchema.aggregate([
            {
                $count: 'totalCount',
            },
        ])

        const response = await songSchema.aggregate([
            { $sort: { createdAt: -1 } },
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

        console.log('data: ', response)

        return res.status(200).json({
            data: response,
            total,
            totalPages,
            currentPage: page,
        })

        return res.status(303).json({})
    } catch (error) {
        return res.status(303).json({})
    }
}
