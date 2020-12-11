import { Router } from 'express';
import multer from 'multer';

import ensureAuthenticated from './middlewares/ensureAuthenticated';

import uploadConfig from './config/upload';
import AuthenticateUserController from './controllers/AuthenticateUserController';
import UsersController from './controllers/UsersController';
import OrphanagesController from './controllers/OrphanagesController';

const routes = Router();
const upload = multer(uploadConfig);

routes.post('/sessions', AuthenticateUserController.store);

routes.use(ensureAuthenticated);

routes.get('/users', UsersController.index);
routes.get('/users/:id', UsersController.show);
routes.post('/users', UsersController.create);
routes.put('/users/:id', UsersController.update);
routes.delete('/users/:id', UsersController.destroy);

routes.get('/orphanages', OrphanagesController.index);
routes.get('/orphanages/:id', OrphanagesController.show);
routes.post('/orphanages', upload.array('images'), OrphanagesController.create);

export default routes;