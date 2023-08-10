import { TRPCError } from '@trpc/server'
import { Context } from '../utils/trpc'

export const getMeHandler = ({ ctx }: { ctx: Context }) => {
    try {
        //@ts-ignore
        const user = ctx.user
        return {
            status: 'success',
            data: {
                user,
            },
        }
    } catch (err: any) {
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        })
    }
}
