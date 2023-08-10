import { object, string } from 'zod'
import { trpc } from '../utils/trpc'
import { z } from 'zod'

const userInput = trpc.procedure.input(z.object({ uuid: z.string() }))

export const songRoute = trpc.router({
    getSongs: userInput.query(({ input }) => {
        return { uuid: input.uuid }
    }),
})
