import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

export const database = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO}`)
        console.log('🚀 Database connected ')
    } catch (error: any) {
        console.log(error)
        process.exit(1)
    }
}
