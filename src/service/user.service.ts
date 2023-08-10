import { omit } from 'lodash'
import { FilterQuery, QueryOptions } from 'mongoose'
import userModel, { User } from '../model/user.model'
import { signJwt } from '../utils/jwt'
import { DocumentType } from '@typegoose/typegoose'

// Exclude this fields from the response
export const excludedFields = ['password']

// CreateUser service
export const createUser = async (input: Partial<User>) => {
    const user = await userModel.create(input)
    return omit(user.toJSON(), excludedFields)
}

// Find User by Id
export const findUserById = async (id: string) => {
    return await userModel.findById(id).lean()
}

// Find All users
export const findAllUsers = async () => {
    return await userModel.find()
}

// Find one user by any fields
export const findUser = async (
    query: FilterQuery<User>,
    options: QueryOptions = {}
) => {
    return await userModel.findOne(query, {}, options)
}

// Sign Token
export const signToken = async (user: DocumentType<User>) => {
    const userId = user._id.toString()

    const access_token = signJwt(
        { sub: userId },
        {
            expiresIn: `5000y`,
        }
    )

    const refresh_token = signJwt(
        { sub: userId },
        {
            expiresIn: `5000y`,
        }
    )

    return { access_token, refresh_token }
}
