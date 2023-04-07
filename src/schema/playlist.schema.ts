import { Schema, model } from 'mongoose'

const playlistSchema = new Schema(
    {
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

export default model('Playlist', playlistSchema)
