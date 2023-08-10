import { trpc } from '../utils/trpc'
import { TRPCError } from '@trpc/server'
import {
    loginHandler,
    logoutHandler,
    refreshAccessTokenHandler,
    registerHandler,
} from '../controller/auth.controller'
import { getMeHandler } from '../controller/user.controller'
import { createUserSchema, loginUserSchema } from '../schema/user.schema'

const isAuthorized = trpc.middleware(({ ctx, next }) => {
    //@ts-ignore
    if (!ctx.user) {
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to access this resource',
        })
    }
    return next()
})

export const isAuthorizedProcedure = trpc.procedure.use(isAuthorized)

const authRoute = trpc.router({
    registerUser: trpc.procedure
        .input(createUserSchema)
        .mutation(({ input }) => registerHandler({ input })),
    loginUser: trpc.procedure
        .input(loginUserSchema)
        .mutation(({ input, ctx }) => loginHandler({ input, ctx })),
    logoutUser: trpc.procedure.mutation(({ ctx }) => logoutHandler({ ctx })),
    refreshToken: trpc.procedure.query(({ ctx }) =>
        refreshAccessTokenHandler({ ctx })
    ),
})

const userRoute = trpc.router({
    sayHello: trpc.procedure.query(async () => {
        const message = 'Welcome to tRPC with React and Node'
        return { message }
    }),
    getMe: isAuthorizedProcedure.query(({ ctx }) => getMeHandler({ ctx })),
})

export const userAuthRoute = trpc.mergeRouters(authRoute, userRoute)

export type userAuthRoute = typeof userAuthRoute
