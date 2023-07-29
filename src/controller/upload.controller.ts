import { Response, RequestHandler } from 'express'
import mongoose from 'mongoose'
import songSchema from '../schema/song.schema'

export const postAudio: RequestHandler = async (req, res) => {
    try {
        console.log(req)

        return res.status(200)
    } catch (error) {
        return res.status(303)
    }
}
