import { Schema, model } from 'mongoose'
import * as dotenv from 'dotenv'
dotenv.config()

const radioPlaylist = new Schema(
    {},
    {
        versionKey: false,
        timestamps: true,
    }
)

export default model('radioPlaylist', radioPlaylist)
