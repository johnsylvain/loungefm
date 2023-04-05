import { Response, RequestHandler } from "express";

export const postFile: RequestHandler = async (req, res) => {
  try {
    return res.status(200);
    } catch (error) {
    return res.status(303);
  }
};

