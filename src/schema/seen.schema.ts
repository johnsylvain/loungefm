import { Schema, model } from 'mongoose'
import * as dotenv from 'dotenv'
dotenv.config()

const seenSchema = new Schema(
    {
        songId: {
            type: String,
            require: true,
            default: null,
        },
        userId: {
            type: String,
            require: false,
            default: null,
        },
        userAgent: {
            type: String,
            require: false,
            default: null,
        },
        date: {
            type: Date,
            require: true,
            default: Date.now,
        },
    },
    {
        versionKey: false,
        timestamps: true,
    }
)

export default model('seen', seenSchema)
