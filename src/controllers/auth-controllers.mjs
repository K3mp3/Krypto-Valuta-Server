import jwt from "jsonwebtoken";
import AppError from "../models/appError.mjs";
import UserRepository from "../repositories/users-repositories.mjs";
import { catchErrorAsync } from "../utilities/catchErrorAsync.mjs";

export const signInUser = catchErrorAsync(async (req, res, next) => {
  const { email, password } = req.body;

  console.log(req.body);

  if (!email || !password)
    return next(new AppError("Email and / or password is missing", 400));

  const user = await new UserRepository().find(email, true);

  if (!user || !(await user.checkPassword(password, user.password)))
    return next(new AppError("Email and / or password is wrong", 401));

  const token = createToken(user._id);

  res
    .status(200)
    .json({ success: true, statusCode: 200, data: { token: token } });
});

const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};
