import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import DeliverymanController from './app/controllers/DeliverymanController';
import FileController from './app/controllers/FileController';
import DeliveryController from './app/controllers/DeliveryController';
import DeliverymanDeliveryController from './app/controllers/DeliverymanDeliveryController';
import ProblematicDeliveriesController from './app/controllers/ProblematicDeliveriesController';
import DeliveryProblemController from './app/controllers/DeliveryProblemController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.get('/deliverymens/:id/deliveries', DeliverymanDeliveryController.index); // query param ?delivered=yes/not
routes.put('/delivery/:id', DeliverymanDeliveryController.update);

routes.post('/deliveries/:id/problems', DeliveryProblemController.store);
routes.get('/deliveries/:id/problems', DeliveryProblemController.index);

routes.get('/deliverymens', DeliverymanController.index);

routes.post('/files', upload.single('file'), FileController.store);

routes.put('/deliveries/:id', DeliveryController.update);

routes.use(authMiddleware); // Only applied for routes that come after

routes.put('/users', UserController.update);

routes.post('/recipients', RecipientController.store);
routes.get('/recipients', RecipientController.index);
routes.put('/recipients/:recipientId', RecipientController.update);
routes.delete('/recipients/:recipientId', RecipientController.delete);

routes.post('/deliverymens', DeliverymanController.store);
routes.put('/deliverymens/:id', DeliverymanController.update);
routes.delete('/deliverymens/:id', DeliverymanController.delete);

routes.post('/deliveries', DeliveryController.store);
routes.get('/deliveries', DeliveryController.index);
routes.delete('/deliveries/:id', DeliveryController.delete);

routes.get('/deliveries/problems', ProblematicDeliveriesController.index);
routes.delete(
  '/problems/:id/cancel-delivery',
  DeliveryProblemController.delete
);

export default routes;
