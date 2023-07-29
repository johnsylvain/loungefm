import { Schema, model } from 'mongoose'
import * as dotenv from 'dotenv'
dotenv.config()

const streamSchema = new Schema(
    {
        songId: {
            type: String,
            require: false,
            default: true,
        },
        userId: {
            type: String,
            require: false,
            default: null,
        },
        date: {
            type: Date,
            require: false,
            default: Date.now,
        },
        songDuration: {
            type: Number,
            require: true,
        },
        playDuration: {
            type: Number,
            require: false,
        },
    },
    {
        versionKey: false,
        timestamps: true,
    }
)

export default model('stream', streamSchema)
