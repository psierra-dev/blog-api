import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {Router} from "express";
import User from "../models/user.js";
import config from "../config/index.js";

const routerLogin = Router();

routerLogin.post("/", async (req, res, next) => {
  const {username, password} = req.body;

  try {
    const user = await User.findOne({username});
    const passwordCorrect =
      user === null ? false : await bcrypt.compare(password, user.passwordHash);

    if (!(user && passwordCorrect)) {
      return res.status(401).json({
        error: "invalid username or password",
      });
    }

    const userForToken = {
      username: user.username,
      id: user._id,
    };

    const token = jwt.sign(userForToken, config.secret_jwt);

    res.status(200).send({token, username: user.username, name: user.name});
  } catch (error) {
    next(error);
  }
});

export default routerLogin;
