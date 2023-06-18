import { Schema, model } from 'mongoose'
import * as dotenv from 'dotenv'

dotenv.config()

const songSchema = new Schema(
    {
        artistId: {
            type: String,
            require: true,
        },
        name: {
            type: String,
            require: true,
        },
        title: {
            type: String,
            require: true,
        },
        link: {
            type: String,
            require: true,
        },
        art: {
            type: String,
            require: true,
        },
        source: {
            type: String,
            require: true,
        },
    },
    {
        versionKey: false,
        timestamps: true,
    }
)

export default model('tracks', songSchema)
