import mongoose from "mongoose";
import {test, after, beforeEach, describe} from "node:test";
import assert from "node:assert";
import supertest from "supertest";

import app from "../app.js";
import Blog from "../models/blog.js";

import helper from "../utils/blog_helper.js";

import User from "../models/user.js";

const api = supertest(app);

/*beforeEach(async () => {
  await Blog.deleteMany({});

  const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
  const promiseArray = blogObjects.map((blog) => blog.save());
  await Promise.all(promiseArray);
});*/

describe("when there is initially some blogs saved", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
    await User.deleteMany({});
    //await Blog.insertMany(helper.initialBlogs);

    const userOne = await api
      .post("/api/users")
      .send({username: "root", password: "killer", name: "Pedro"});
    const userTwo = await api
      .post("/api/users")
      .send({username: "root2", password: "killer2", name: "Angel"});

    const blogsWithUser = helper.initialBlogs.map((blog, index) => {
      if (index % 2 === 0) {
        return {
          ...blog,
          user: userOne.body.id,
        };
      }
      return {
        ...blog,
        user: userTwo.body.id,
      };
    });
    await Blog.insertMany(blogsWithUser);
  });

  async function getUser(data) {
    const responseUser = await api.post("/api/login").send(data);

    return responseUser.body;
  }

  test("verify id key", async () => {
    const allBlogs = await helper.blogsInDb();
    assert.strictEqual(Object.hasOwn(allBlogs[0], "id"), true);
  });

  test("blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("all blogs are returned", async () => {
    const response = await api.get("/api/blogs");

    assert.strictEqual(response.body.length, helper.initialBlogs.length);
  });

  describe("viewing a specific blog", () => {
    test("succeeds with a valid id", async () => {
      const blogsAtStart = await helper.blogsInDb();

      const blogToView = blogsAtStart[0];
      const resultBlog = await api
        .get(`/api/blogs/${blogToView.id}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);

      assert.deepStrictEqual(resultBlog.body, {
        ...blogToView,
        user: blogToView.user.toString(),
      });
    });

    test("fails with statuscode 404 if blog does not exist", async () => {
      const validNonexistingId = await helper.nonExistingId();
      await api.get(`/api/blogs/${validNonexistingId}`).expect(404);
    });

    test("fails with statuscode 400 id is invalid", async () => {
      const invalidId = "5a3d5da59070081a82a3445";

      await api.get(`/api/blogs/${invalidId}`).expect(400);
    });
  });

  describe("addition of a new note", () => {
    test("a valid blog can be added", async () => {
      const newBlog = {
        title: "Nueva nota",
        author: "Borges",
        likes: 0,
        url: "http:localhost:2002",
      };
      const user = await getUser({username: "root", password: "killer"});

      await api
        .post("/api/blogs")
        .send(newBlog)
        .set({authorization: `Bearer ${user.token}`})
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const blogsAtEnd = await helper.blogsInDb();
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);

      const titles = blogsAtEnd.map((b) => b.title);
      assert(titles.includes("Nueva nota"));
    });

    test("a valid blog without token, error 401 Unauthorized ", async () => {
      const newBlog = {
        title: "Nueva nota",
        author: "Borges",
        likes: 0,
        url: "http:localhost:2002",
      };

      await api
        .post("/api/blogs")
        .send(newBlog)
        .expect(401)
        .expect("Content-Type", /application\/json/);
    });

    test("blog without likes is added", async () => {
      const newBlog = {
        title: "Nueva nota 2",
        author: "Borges",
        url: "http:localhost:2002",
      };
      const user = await getUser({username: "root", password: "killer"});

      await api
        .post("/api/blogs")
        .send(newBlog)
        .set({authorization: `Bearer ${user.token}`})
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const blogsAtEnd = await helper.blogsInDb();

      const lastBlogAdded = blogsAtEnd[blogsAtEnd.length - 1];
      assert.strictEqual(lastBlogAdded.title, "Nueva nota 2");
      assert.strictEqual(lastBlogAdded.likes, 0);
    });

    test("blog without url or title is not added", async () => {
      const newBlog = {
        title: "Nuevo blog",
        author: "Borges",
        //url: "http:localhost:2002",
      };

      const user = await getUser({username: "root", password: "killer"});

      await api
        .post("/api/blogs")
        .send(newBlog)
        .set({authorization: `Bearer ${user.token}`})
        .expect(400);
    });
  });

  describe("deletion of a blog", () => {
    test("succeeds with status code 204 if id is valid", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToDelete = blogsAtStart[0];

      const user = await getUser({username: "root", password: "killer"});

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set({authorization: `Bearer ${user.token}`})
        .expect(204);

      const blogsAtEnd = await helper.blogsInDb();

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1);

      const titles = blogsAtEnd.map((r) => r.title);
      assert(!titles.includes(blogToDelete.title));
    });
    test("a blog cannot be deleted by someone who is not the owner", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToDelete = blogsAtStart[0];

      const user = await getUser({username: "root2", password: "killer2"});

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set({authorization: `Bearer ${user.token}`})
        .expect(401);
    });
  });

  describe("updating of a blog", () => {
    test("succeeds with status code 200 if blog is updated", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToUpdate = blogsAtStart[0];

      const newBlog = {
        ...blogToUpdate,
        likes: blogToUpdate.likes + 1,
      };

      const user = await getUser({username: "root", password: "killer"});

      const response = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(newBlog)
        .set({authorization: `Bearer ${user.token}`})
        .expect(200);

      assert.strictEqual(response.body.likes, newBlog.likes);
    });
    test("a blog cannot be updated by someone who is not the owner", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToUpdate = blogsAtStart[0];

      const newBlog = {
        ...blogToUpdate,
        likes: blogToUpdate.likes + 1,
      };

      const user = await getUser({username: "root2", password: "killer2"});

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(newBlog)
        .set({authorization: `Bearer ${user.token}`})
        .expect(401);
    });
  });
});

after(async () => {
  await mongoose.connection.close();
});
