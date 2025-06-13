import { Router } from "express";
import { signInUser } from "../controllers/auth-controllers.mjs";
import { signUpUser } from "../controllers/user-controllers.mjs";

const routes = Router();

routes.post("/sign-up", signUpUser);
routes.post("/sign-in", signInUser);

export default routes;
