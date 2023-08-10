import jwt, { SignOptions } from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

export const signJwt = (payload: Object, options: SignOptions = {}) => {
    const privateKey = Buffer.from(
        `${process.env.PRIVATE_KEY}`,
        'base64'
    ).toString('ascii')
    return jwt.sign(payload, privateKey, {
        ...(options && options),
        algorithm: 'RS256',
    })
}

export const verifyJwt = <T>(token: string): T | null => {
    try {
        const publicKey = Buffer.from(
            `${process.env.PUBLIC_KEY}`,
            'base64'
        ).toString('ascii')
        return jwt.verify(token, publicKey) as T
    } catch (error) {
        console.log(error)
        return null
    }
}
