import { Schema, model } from 'mongoose'
import * as dotenv from 'dotenv'
dotenv.config()

const likeSchema = new Schema(
    {
        songId: {
            type: String,
            require: false,
            default: null,
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
    },
    {
        versionKey: false,
        timestamps: true,
    }
)

export default model('likes', likeSchema)
