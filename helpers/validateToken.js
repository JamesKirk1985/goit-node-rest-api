import HttpError from "../helpers/HttpError.js";
import jwt from "jsonwebtoken";
import { User } from "../DBModels/userModel.js";
const SECRET_KEY = process.env.SECRET_KEY;
export const validateToken = async (req, res, next) => {
  const { authorization = "" } = req.headers;

  const [bearer, token] = authorization.split(" ");

  if (bearer !== "Bearer") {
    console.log(bearer !== "Bearer");
    res.status(401).json({ message: "Not authorized" });
  }
  try {
    const { id } = jwt.verify(token, SECRET_KEY);

    const user = await User.findById(id);

    if (!user || !user.token || user.token !== token) {
      res.status(401).json({ message: "Not authorized" });
    }
    req.user = user;
    next();
  } catch {
    next(HttpError(401));
  }
};
