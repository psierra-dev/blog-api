import {Router} from "express";
import Blog from "../models/blog.js";
import User from "../models/user.js";
import middleware from "../utils/middleware.js";

const routerBlog = Router();

routerBlog.get("/", async (_, res, next) => {
  try {
    const blogs = await Blog.find({}).populate("user", {username: 1, name: 1});
    res.json(blogs);
  } catch (error) {
    next(error);
  }
});
routerBlog.get("/:id", async (req, res, next) => {
  const {id} = req.params;
  try {
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.send(404).end();
    }
    res.json(blog);
  } catch (error) {
    next(error);
  }
});
routerBlog.post(
  "/",
  middleware.tokenExtractor,
  middleware.userExtractor,
  async (req, res, next) => {
    const {userId, ...data} = req.body;

    try {
      const user = await User.findById(req.user.id);

      const blog = new Blog({
        ...data,
        user: user.id,
      });
      const savedBlog = await blog.save();

      user.blogs = user.blogs.concat(savedBlog._id);
      await user.save();

      res.status(201).json(savedBlog);
    } catch (error) {
      next(error);
    }
  }
);
routerBlog.put(
  "/:id",
  middleware.tokenExtractor,
  middleware.userExtractor,
  async (req, res, next) => {
    const data = req.body;
    const {id} = req.params;
    const user = req.user;
    try {
      const blog = await Blog.findById(id);
      if (blog.user.toString() !== user.id) {
        return res
          .status(401)
          .json({error: "only the creator can delete a blog"});
      }
      const newBlog = {
        title: data.title,
        author: data.author,
        likes: data.likes,
        url: data.url,
      };
      const updatedBlog = await Blog.findByIdAndUpdate(id, newBlog, {
        new: true,
      });
      res.json(updatedBlog);
    } catch (error) {
      next(error);
    }
  }
);
routerBlog.delete(
  "/:id",
  middleware.tokenExtractor,
  middleware.userExtractor,
  async (req, res, next) => {
    const {id} = req.params;
    const user = req.user;

    try {
      const blog = await Blog.findById(id);
      if (blog.user.toString() !== user.id) {
        return res
          .status(401)
          .json({error: "only the creator can delete a blog"});
      }
      await Blog.findByIdAndDelete(id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
);

export default routerBlog;
