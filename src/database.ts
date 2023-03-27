import mongoose from 'mongoose';
import pino from 'pino';
const logger = pino({ level: 'info' });

(async () => {
  try {
    const db = await mongoose.connect(
      `${process.env.MONGO}`);
    console.log("Database is connected to: ", db.connection.name);
  } catch (error) {
    console.log("Databse Error")
    console.error(error);
  }
})();