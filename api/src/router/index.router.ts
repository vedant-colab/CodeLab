import express from 'express';
import { homePageController } from '../controller/index.controller';
import { urlPath } from '../config';
import { signUpController } from '../controller/user.controller';
import { tokenCreationController, validateTokenController } from '../controller/auth.controller';
// import { io } from '../controller/socketConnection';
export const router = express.Router();

router.get(`${urlPath}/homePage`, homePageController);
// router.get(`${path}/socket-io`, io)
