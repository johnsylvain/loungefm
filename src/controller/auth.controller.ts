import { TRPCError } from '@trpc/server'
import { CookieOptions } from 'express'
import { Context } from '../utils/trpc'
import { CreateUserInput, LoginUserInput } from '../schema/user.schema'
import {
    createUser,
    findUser,
    findUserById,
    signToken,
} from '../service/user.service'
import { signJwt, verifyJwt } from '../utils/jwt'
import dotenv from 'dotenv'
dotenv.config()

const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.ENV === 'prod',
    sameSite: 'lax',
}

const accessTokenCookieOptions = {
    ...cookieOptions,
    expires: new Date(Date.now() + 30 * 60 * 1000),
}

const refreshTokenCookieOptions = {
    ...cookieOptions,
    expires: new Date(Date.now() + 30 * 60 * 1000),
}

export const registerHandler = async ({
    input,
}: {
    input: CreateUserInput
}) => {
    try {
        const user = await createUser({
            address: input.address,
        })

        return {
            status: 'success',
            data: {
                user,
            },
        }
    } catch (err: any) {
        if (err.code === 11000) {
            throw new TRPCError({
                code: 'CONFLICT',
                message: 'address already exists',
            })
        }
        throw err
    }
}

export const loginHandler = async ({
    input,
    ctx,
}: {
    input: LoginUserInput
    ctx: Context
}) => {
    try {
        // Get the user from the collection
        const user = await findUser({ address: input.address })

        // Check if user exist and password is correct
        if (!user) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Invalid',
            })
        }

        // Create the Access and refresh Tokens
        const { access_token, refresh_token } = await signToken(user)

        // Send Access Token in Cookie
        ctx.res.cookie('access_token', access_token, accessTokenCookieOptions)
        ctx.res.cookie(
            'refresh_token',
            refresh_token,
            refreshTokenCookieOptions
        )
        ctx.res.cookie('logged_in', true, {
            ...accessTokenCookieOptions,
            httpOnly: false,
        })

        // Send Access Token
        return {
            status: 'success',
            access_token,
        }
    } catch (err: any) {
        throw err
    }
}

export const refreshAccessTokenHandler = async ({ ctx }: { ctx: Context }) => {
    try {
        // Get the refresh token from cookie
        const refresh_token = ctx.req.cookies.refresh_token as string

        const message = 'Could not refresh access token'
        if (!refresh_token) {
            throw new TRPCError({ code: 'FORBIDDEN', message })
        }

        // Validate the Refresh token
        const decoded = verifyJwt<{ sub: string }>(refresh_token)

        if (!decoded) {
            throw new TRPCError({ code: 'FORBIDDEN', message })
        }

        // Check if the user has a valid session
        const session = await decoded.sub
        if (!session) {
            throw new TRPCError({ code: 'FORBIDDEN', message })
        }

        // Check if the user exist
        const user = await findUserById(JSON.parse(session)._id)

        if (!user) {
            throw new TRPCError({ code: 'FORBIDDEN', message })
        }

        // Sign new access token
        const access_token = signJwt(
            { sub: user._id },
            {
                expiresIn: `5000y`,
            }
        )

        // Send the access token as cookie
        ctx.res.cookie('access_token', access_token, accessTokenCookieOptions)
        ctx.res.cookie('logged_in', true, {
            ...accessTokenCookieOptions,
            httpOnly: false,
        })

        // Send response
        return {
            status: 'success',
            access_token,
        }
    } catch (err: any) {
        throw err
    }
}

const logout = ({ ctx }: { ctx: Context }) => {
    ctx.res.cookie('access_token', '', { maxAge: -1 })
    ctx.res.cookie('refresh_token', '', { maxAge: -1 })
    ctx.res.cookie('logged_in', '', {
        maxAge: -1,
    })
}
export const logoutHandler = async ({ ctx }: { ctx: Context }) => {
    try {
        //@ts-ignore
        const user = ctx.user
        await user?._id.toString()
        logout({ ctx })
        return { status: 'success' }
    } catch (err: any) {
        throw err
    }
}
