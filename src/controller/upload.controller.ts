import { Response, RequestHandler } from 'express'

export const getUpload: RequestHandler = async (req, res) => {
    try {
        return res.status(200).json([])
    } catch (error) {
        return res.status(303).json([])
    }
}

export const uploadError: RequestHandler = async (req, res) => {
    try {
        res.sendFile(__dirname + '/pages/error.html')
        return res.status(200)
    } catch (error) {
        return res.status(303)
    }
}

export const uploadSuccess: RequestHandler = async (req, res) => {
    try {
        res.sendFile(__dirname + '/pages/upload.html')
        return res.status(200)
    } catch (error) {
        return res.status(303)
    }
}
