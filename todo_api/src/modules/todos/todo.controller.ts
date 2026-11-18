import type { Request, Response } from 'express';
import { currentUserId } from '../../shared/authenticate.ts';
import { toTodoDto } from './todo.model.ts';
import {
  createTodoSchema,
  listTodosSchema,
  todoIdSchema,
  updateTodoSchema,
} from './todo.schemas.ts';
import * as todoService from './todo.service.ts';

export async function list(req: Request, res: Response) {
  const query = listTodosSchema.parse(req.query);
  const result = await todoService.listTodos(currentUserId(req), query);
  res.json({
    data: result.items.map(toTodoDto),
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
    },
  });
}

export async function create(req: Request, res: Response) {
  const input = createTodoSchema.parse(req.body);
  const todo = await todoService.createTodo(currentUserId(req), input);
  res.status(201).json({ data: toTodoDto(todo) });
}

export async function getOne(req: Request, res: Response) {
  const { id } = todoIdSchema.parse(req.params);
  const todo = await todoService.getTodo(currentUserId(req), id);
  res.json({ data: toTodoDto(todo) });
}

export async function update(req: Request, res: Response) {
  const { id } = todoIdSchema.parse(req.params);
  const input = updateTodoSchema.parse(req.body);
  const todo = await todoService.updateTodo(currentUserId(req), id, input);
  res.json({ data: toTodoDto(todo) });
}

export async function remove(req: Request, res: Response) {
  const { id } = todoIdSchema.parse(req.params);
  await todoService.deleteTodo(currentUserId(req), id);
  res.status(204).end();
}