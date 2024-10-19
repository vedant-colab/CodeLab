import { urlPath } from '../config';
import { signUpController } from '../controller/user.controller';
import { logoutController, tokenCreationController, validateTokenController } from '../controller/auth.controller';
import  express  from 'express';
import { userAuthentication } from '../middleware/auth.middleware';
export const Authrouter = express.Router();

Authrouter.post(`/signUp`, signUpController);
Authrouter.post(`/tokenCreation`, tokenCreationController);
Authrouter.post(`/tokenValidation`, validateTokenController);
Authrouter.get('/logoutUser',userAuthentication, logoutController);