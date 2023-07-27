import { Schema, model } from 'mongoose'
import * as dotenv from 'dotenv'
dotenv.config()

const songSchema = new Schema(
    {
        artistId: {
            type: String,
            require: false,
            default: null,
        },
        artist: {
            type: [String],
            require: true,
        },
        title: {
            type: String,
            require: true,
        },
        album: {
            type: String,
            require: false,
            default: null,
        },
        albumArtist: {
            type: [String],
            require: false,
        },
        composer: {
            type: [String],
            require: false,
            default: null,
        },
        genre: {
            type: [String],
            require: false,
            default: null,
        },
        duration: {
            type: Number,
            require: false,
            default: 0,
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
        year: {
            type: Number,
            require: true,
            default: null,
        },
        size: {
            type: Number,
            require: false,
        },
        track: {
            type: {
                number: Number,
                total: Number,
            },
            require: false,
            default: {
                number: 1,
                total: 1,
            },
        },
        diskNumber: {
            type: {
                number: Number,
                total: Number,
            },
            require: false,
            default: {
                number: 1,
                total: 1,
            },
        },
        compilation: {
            type: String,
            require: false,
            default: false,
        },
        bpm: {
            type: Number,
            require: false,
            default: null,
        },
        bitRate: {
            type: Number,
            require: false,
            default: null,
        },
        sampleRate: {
            type: Number,
            require: false,
            default: null,
        },
        comments: {
            type: [String],
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
