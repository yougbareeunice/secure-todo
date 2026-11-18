import { Router } from 'express';
import { authenticate } from '../../shared/authenticate.ts';
import * as controller from './todo.controller.ts';

export const todoRoutes = Router();

// Every todo route requires a valid access token.
todoRoutes.use(authenticate);

todoRoutes.get('/', controller.list);
todoRoutes.post('/', controller.create);
todoRoutes.get('/:id', controller.getOne);
todoRoutes.patch('/:id', controller.update);
todoRoutes.delete('/:id', controller.remove);