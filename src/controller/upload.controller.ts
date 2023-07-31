import { Response, RequestHandler } from 'express'
import mongoose from 'mongoose'
import songSchema from '../schema/song.schema'
const NodeID3 = require('node-id3')

export const postAudio: RequestHandler = async (req, res) => {
    try {
        const { file } = req
        const { path, size } = file
        NodeID3.read(path, async (err, tags) => {
            if (err) {
                return res.status(303)
            } else {
                const { title, artist } = tags
                const response = await new songSchema({
                    artist: [artist],
                    title,
                    scraped: false,
                    size,
                    downloadable: false,
                    source: {
                        name: 'mixø',
                        link: 'https://mixø.xyz/',
                        website: 'https://mixø.xyz',
                    },
                }).save()
                console.log(response)
                return res.status(200)
            }
        })
    } catch (error) {
        return res.status(303)
    }
}

export const deleteAudio: RequestHandler = async (req, res) => {
    try {
        console.log(req)

        return res.status(200)
    } catch (error) {
        return res.status(303)
    }
}
