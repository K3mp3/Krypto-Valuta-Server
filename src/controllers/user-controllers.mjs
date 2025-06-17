import UserRepository from "../repositories/users-repositories.mjs";

export const signUpUser = async (req, res) => {
  const user = await new UserRepository().add(req.body);

  res
    .status(201)
    .json({ success: true, statusCode: 201, data: { user: user } });
};
