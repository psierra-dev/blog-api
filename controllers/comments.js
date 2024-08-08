import {Router} from "express";
import Comment from "../models/comment";

const routerComment = Router();

routerComment.post("/", async (req, res, next) => {
  const data = req.body;
  try {
    const model = new Comment(data);
    const savedComment = await model.save();
    res.status(201).json(savedComment);
  } catch (error) {
    next(error);
  }
});
export default routerComment;
