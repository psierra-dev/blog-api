import {config} from "dotenv";

config();

export default {
  port: process.env.PORT || 3001,
  mongodb_uri:
    process.env.NODE_ENV === "test"
      ? process.env.TEST_MONGODB_URI
      : process.env.MONGODB_URI,
  secret_jwt: process.env.SECRET_JWT,
};
