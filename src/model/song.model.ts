import {
    getModelForClass,
    index,
    modelOptions,
    pre,
    prop,
} from '@typegoose/typegoose'

@index({ _id: 1 })
@pre<Song>('save', async () => {})
@modelOptions({
    schemaOptions: {
        timestamps: true,
    },
})
export class Song {
    @prop({ required: true })
    title: string

    @prop({ required: true })
    artist: [string]

    @prop({ required: true })
    artwork: string

    @prop({ required: true })
    link: string
}

const songModel = getModelForClass<typeof Song>(Song)
export default songModel
