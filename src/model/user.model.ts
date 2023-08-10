import {
    getModelForClass,
    pre,
    index,
    modelOptions,
    prop,
} from '@typegoose/typegoose'

@index({ address: 1 })
@pre<User>('save', () => {
    return
})
@modelOptions({
    schemaOptions: {
        timestamps: true,
    },
})
export class User {
    @prop({ unique: true, required: true })
    address: string
    @prop({ default: 'user' })
    role: string
    @prop({ required: false })
    username: string
    @prop({ required: false })
    profile: string
}

const userModel = getModelForClass<typeof User>(User)
export default userModel
