import { Schema, model } from 'mongoose'
import * as dotenv from 'dotenv'
dotenv.config()

const songSchema = new Schema(
    {
        artist: {
            type: [String],
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
        artwork: {
            type: String,
            require: false,
            default: null,
        },
    },
    {
        versionKey: false,
        timestamps: true,
    }
)

export default model('songs', songSchema)
