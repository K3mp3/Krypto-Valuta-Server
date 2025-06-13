import { Router } from "express";
import { signUpUser } from "../controllers/user-controllers.mjs";

const routes = Router();

routes.post("/sign-up", signUpUser);

export default routes;
