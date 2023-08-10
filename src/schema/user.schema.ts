import { object, string, TypeOf } from 'zod'

export const createUserSchema = object({
    name: string({ required_error: 'Name is required' }),
    address: string({ required_error: 'address is required' }),
})

export const loginUserSchema = object({
    address: string({ required_error: 'address is required' }),
})

export type CreateUserInput = TypeOf<typeof createUserSchema>
export type LoginUserInput = TypeOf<typeof loginUserSchema>
