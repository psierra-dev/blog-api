import {Router} from "express";
import Blog from "../models/blog.js";
import User from "../models/user.js";
import middleware from "../utils/middleware.js";
import Comment from "../models/comment.js";

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
    const blog = await Blog.findById(id)
      .populate("user", {
        username: 1,
        name: 1,
      })
      .populate("comments", {content: 1});

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

      res.status(201).json({
        ...savedBlog._doc,
        id: savedBlog._id,
        user: {
          username: user.username,
          name: user.name,
        },
      });
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

routerBlog.patch("/:id/likes", async (req, res, next) => {
  const {user} = req.body;
  const {id} = req.params;

  try {
    const blog = await Blog.findById(id);

    console.log(blog.likes.includes(user), "like");

    if (blog.likes.includes(user)) {
      console.log("user is Like");

      await Blog.updateMany({}, {$pull: {likes: user}});
    } else {
      console.log("user is dislike");
      blog.likes = blog.likes.concat(user);
      await blog.save();
    }

    res.send("like success");
  } catch (error) {
    next(error);
  }
});
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

//comments
routerBlog.post("/:id/comment", async (req, res, next) => {
  const {id} = req.params;
  const {content} = req.body;
  console.log(id);

  try {
    const blog = await Blog.findById(id);
    console.log(blog, "blog");

    const comment = new Comment({content, blog: id});
    const savedComment = await comment.save();

    blog.comments = blog.comments.concat(savedComment._id);
    await blog.save();

    res.status(201).json(savedComment);
  } catch (error) {
    next(error);
  }
});

export default routerBlog;
