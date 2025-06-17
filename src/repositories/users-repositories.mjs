import userModel from "../models/schemas/userModel.mjs";

export default class UserRepository {
  async add(user) {
    console.log({ user: user });
    const { email, password } = user;
    return await userModel.create({ email, password });
  }

  async find(email, login) {
    return login === true
      ? await userModel.findOne({ email: email }).select("+password")
      : await userModel.findOne({ email: email });
  }
}
