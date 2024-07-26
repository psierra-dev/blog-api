import config from "../config/index.js";
import User from "../models/user.js";
import logger from "./logger.js";
import jwt from "jsonwebtoken";
const requestLogger = (request, response, next) => {
  logger.info("Method:", request.method);
  logger.info("Path:  ", request.path);
  logger.info("Body:  ", request.body);
  logger.info("---");
  next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({error: "unknown endpoint"});
};

const errorHandler = (error, request, response, next) => {
  logger.error(error.message);
  if (error.name === "CastError") {
    return response.status(400).send({error: "malformatted id"});
  } else if (error.name === "ValidationError") {
    return response.status(400).json({error: error.message});
  } else if (
    error.name === "MongoServerError" &&
    error.message.includes("E11000 duplicate key error")
  ) {
    return response
      .status(400)
      .json({error: "expected `username` to be unique"});
  } else if (error.name === "JsonWebTokenError") {
    return response.status(401).json({
      error: "invalid token",
    });
  } else if (error.name === "TokenExpiredError") {
    return response.status(401).json({
      error: "token expired",
    });
  }

  next(error);
};

const tokenExtractor = (req, res, next) => {
  const authorization = req.get("authorization");
  console.log(authorization, "authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    req.token = authorization.replace("Bearer ", "");
    return next();
  }
  res.status(401).json({error: "token not provided"});
};

const userExtractor = async (req, res, next) => {
  try {
    const token = req.token;
    const decodedToken = jwt.verify(token, config.secret_jwt);

    if (!decodedToken.id) {
      return res.status(401).json({error: "token invalid"});
    }

    const user = await User.findById(decodedToken.id);

    req.user = user.toJSON();

    next();
  } catch (error) {
    console.log(error, "error");
    next(error);
  }
};

export default {
  errorHandler,
  unknownEndpoint,
  requestLogger,
  tokenExtractor,
  userExtractor,
};
