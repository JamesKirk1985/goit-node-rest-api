import "dotenv/config";
import { User } from "../DBModels/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import gravatar from "gravatar";
import path from "path";
import jimp from "jimp";
import crypto from "crypto";
import { transport } from "../helpers/sendEmail.js";
import HttpError from "../helpers/HttpError.js";
const SECRET_KEY = process.env.SECRET_KEY;
const BASE_URL = process.env.BASE_URL;

export const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    res.status(409).json({
      message: "Email in use",
    });
  }

  const verificationCode = crypto.randomUUID();
  const verifyEmail = {
    from: "volodymyrshevch85@meta.ua",
    to: email,
    subject: "verify your email",
    text: `<a target="_blank" href="${BASE_URL}/api/users/verify/${verificationCode}">Click verify email</a>`,
  };

  transport
    .sendMail(verifyEmail)
    .then(() => console.log("success"))
    .catch((error) => console.log(error.message));

  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
    verificationToken: verificationCode,
  });

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
};

export const verifyEmail = async (req, res) => {
  const { verificationCode } = req.params;
  const user = await User.findOne({ verificationCode });
  if (!user) {
    throw HttpError(401, "Email not found");
  }
  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationCode: "",
  });
  res.status(200).json({ message: "Verification successful" });
};
export const resendVerifyEmail = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404).json({ message: "Email not found" });
    // throw HttpError(401, "Email not found");
    return;
  }
  if (user.verify) {
    res.status(400).json({ message: "Verification has already been passed" });
    // throw HttpError(401, "Email already verify");
    return;
  }
  const verifyEmail = {
    from: "volodymyrshevch85@meta.ua",
    to: email,
    subject: "verify your email",
    text: `<a target="_blank" href="${BASE_URL}/api/users/verify/${user.verificationToken}">Click verify email</a>`,
  };

  transport
    .sendMail(verifyEmail)
    .then(() => console.log("success"))
    .catch((error) => console.log(error.message));

  res.status(200).json({ message: "Verification email sent" });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user.verify) {
      res.status(404).json({ message: "User not found" });
      throw HttpError(401, "Email not verified");
    }

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

  if (!req.file) {
    res.status(400).json({ message: "the request must contain a file" });
    return;
  }

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
