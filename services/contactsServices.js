import jwt from "jsonwebtoken";
const SECRET_KEY = process.env.SECRET_KEY;
export const extractingId = (req) => {
  const { authorization } = req.headers;

  const token = authorization.split(" ")[1];

  const { id } = jwt.verify(token, SECRET_KEY);

  return id;
};
