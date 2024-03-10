import { User } from "../DBModels/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import fs from "fs/promises";
import gravatar from "gravatar";
import path from "path";
import jimp from "jimp";
const SECRET_KEY = process.env.SECRET_KEY;

export const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    res.status(409).json({
      message: "Email in use",
    });
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
  });

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
};
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).json({ message: "Email or password is incorrect" });
    }
    const passwordCompare = await bcrypt.compare(password, user.password);

    if (!passwordCompare) {
      res.status(401).json({ message: "Email or password is incorrect" });
    }
    const payload = {
      id: user._id,
    };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "2h" });
    await User.findByIdAndUpdate(user._id, { token });

    res.status(200).json({
      token: token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    console.log(error.message);
  }
};

export const logout = async (req, res) => {
  try {
    const { authorization } = req.headers;

    const token = authorization.split(" ")[1];

    const { id } = jwt.verify(token, SECRET_KEY);
    await User.findByIdAndUpdate(id, { token: null });
    res.status(204).json();
  } catch (error) {
    console.log(error.message);
  }
};

export const currentUser = async (req, res) => {
  try {
    const { authorization } = req.headers;

    const token = authorization.split(" ")[1];

    const { id } = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(id);
    res.status(200).json({
      email: user.email,
      subscription: user.subscription,
    });
  } catch (error) {
    console.log(error.message);
  }
};

export const upDateAvatar = async (req, res) => {
  const userId = req.user._id;
  const tempDir = path.join(req.file.path);
  const extname = path.extname(req.file.originalname);
  const basename = path.basename(req.file.originalname, extname);
  const fileName = `${basename}${userId}${extname}`;

  const publicDir = path.join(process.cwd(), `public/avatars/${fileName}`);

  await fs.rename(tempDir, publicDir);
  const avatarURL = path.join("avatars", fileName);

  const image = await jimp.read(publicDir);
  await image.resize(250, 250);
  await image.writeAsync(publicDir);

  await User.findByIdAndUpdate(userId, { avatarURL });

  res.status(200).json({ avatarURL });
};
