import { Schema, model } from "mongoose";

const streamSchema = new Schema(
  {
    artist:{
      type: String,
      require: true
    },
    title:{
      type: String,
      require: true
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export default model("Stream", streamSchema);