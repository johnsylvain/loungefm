import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const verifyToken = (req: any, res: Response, next: NextFunction) => {
    const token = req.header('x-auth-token')
    if (!token) {
        return res.status(401).json({ message: 'Token not provided' })
    }

    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' })
        }

        req.user = decoded
        next()
    })
}

export default verifyToken
