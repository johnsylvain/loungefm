import { getModelForClass } from '@typegoose/typegoose'

export class Song {}

const songModel = getModelForClass<typeof Song>(Song)
export default songModel
