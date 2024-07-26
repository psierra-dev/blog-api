import {Router} from "express";
import bcrypt from "bcrypt";

import User from "../models/user.js";

const routerUser = Router();

routerUser.post("/", async (req, res, next) => {
  const {username, name, password} = req.body;

  if (!username || !password) {
    return res.status(400).json({error: "password or username undefined"});
  }

  try {
    const saltRound = 10;
    const passwordHash = await bcrypt.hash(password, saltRound);
    const user = new User({
      username,
      name,
      passwordHash,
    });
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    next(error);
  }
});

routerUser.get("/", async (_, res, next) => {
  try {
    const users = await User.find({}).populate("blogs", {
      title: 1,
      author: 1,
      likes: 1,
      url: 1,
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});
routerUser.get("/:id", async (req, res, next) => {
  const {id} = req.params;
  try {
    const user = await User.findById(id);

    if (!user) {
      return res.send(404).end();
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});

routerUser.put("/:id", async (req, res, next) => {
  const data = req.body;
  const {id} = req.params;

  try {
    const user = {
      title: data.title,
      author: data.author,
      likes: data.likes,
      url: data.url,
    };
    const updatedBlog = await User.findByIdAndUpdate(id, user, {new: true});
    res.json(updatedBlog);
  } catch (error) {
    next(error);
  }
});
routerUser.delete("/:id", async (req, res, next) => {
  const {id} = req.params;

  try {
    await User.findByIdAndDelete(id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default routerUser;
