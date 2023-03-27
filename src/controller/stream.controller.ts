import { Response, RequestHandler } from "express";
import * as queue from "./../engine/queue";

export const getStreaming: RequestHandler = async (req, res) => {
  try {
    //const { client } = queue.addClient();
    return res.status(200);;
    } catch (error) {
    return res.status(303);
  }
};

export const upload: RequestHandler = async (req, res) => {
  try {
    return res.status(200).send();
    } catch (error) {
    return res.status(303);
  }
};

export const postStreaming: RequestHandler = async (req, res) => {
  try {
    return res.status(200);
    } catch (error) {
    return res.status(303);
  }
};

export const getStatus: RequestHandler = async (req, res) => {
  try {
    return res.status(200);
    } catch (error) {
    return res.status(303);
  }
};
