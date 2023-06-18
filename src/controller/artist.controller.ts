import { Response, RequestHandler } from 'express'
import artistSchema from '../schema/artist.schema'

export const getArtist: RequestHandler = async (req, res) => {
    try {
        const response = await artistSchema.find({}).lean()
        return res.status(200).json(response)
    } catch (error) {
        return res.status(303).json([])
    }
}
