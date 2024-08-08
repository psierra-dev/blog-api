import express, {json} from "express";
import morgan from "morgan";
import cors from "cors";
import mongoose from "mongoose";
import routerBlog from "./controllers/blogs.js";
import logger from "./utils/logger.js";
import config from "./config/index.js";
import middleware from "./utils/middleware.js";
import routerUser from "./controllers/users.js";
import routerLogin from "./controllers/login.js";
import routerTesting from "./controllers/testing.js";
const app = express();

mongoose.set("strictQuery", false);

logger.info("connecting to", config.mongodb_uri);

mongoose
  .connect(config.mongodb_uri)
  .then(() => {
    logger.info("connected to MongoDB");
  })
  .catch((error) => {
    logger.error("error connecting to MongoDB:", error.message);
  });

app.use(morgan("dev"));
app.use(json());
app.use(cors());
app.use(express.static("dist"));
app.use(middleware.requestLogger);

/*app.use("/", (_, res) => {
  res.send("Blog Api");
});*/

if (process.env.NODE_ENV === "test") {
 
  app.use("/api/testing", routerTesting);
}
app.use("/api/blogs", routerBlog);

app.use("/api/login", routerLogin);
app.use("/api/users", routerUser);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);
console.log("aqui");
export default app;
