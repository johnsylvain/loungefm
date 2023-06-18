import { Schema, model } from 'mongoose'
import * as dotenv from 'dotenv'

dotenv.config()

const artistSchema = new Schema(
    {
        name: {
            type: String,
            require: true,
        },
        profile: {
            type: String,
            require: true,
        },
        social: {
            type: [String],
            require: true,
        },
        verified: {
            type: [String],
            require: true,
        },
        contact: {
            type: [String],
            require: true,
        },
    },
    {
        versionKey: `${process.env.SCHEMA_VERSION}`,
        timestamps: true,
    }
)

export default model('artist', artistSchema)
