import { RequestHandler } from 'express'
import * as jwt from 'jsonwebtoken'

export const generateToken: RequestHandler = async (req, res) => {
    try {
        const expiresInDays = 30
        const expirationDate =
            Math.floor(Date.now() / 1000) + expiresInDays * 24 * 60 * 60

        const token = jwt.sign({}, process.env.SECRET, {
            expiresIn: expiresInDays * 24 * 60 * 60,
        })

        res.json({ token, expirationDate })
    } catch (error) {
        return res.status(303)
    }
}
