import { Schema, model } from 'mongoose'

const tracklistSchema = new Schema(
    {
        artist: {
            type: String,
            require: true,
        },
        number: {
            type: Number,
            require: true,
        },
        album: {
            type: String,
            require: true,
        },
        title: {
            type: String,
            require: true,
        },
        url: {
            type: String,
            require: true,
        },
    },
    {
        versionKey: false,
        timestamps: true,
    }
)

export default model('Upload', tracklistSchema)
