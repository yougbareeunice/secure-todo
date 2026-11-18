import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from 'mongoose';

const todoSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    completed: { type: Boolean, default: false },
    dueDate: { type: Date, default: null },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

// Our main query is "the todos of one user, newest first":
// a compound index lets MongoDB answer it without scanning the collection.
todoSchema.index({ owner: 1, createdAt: -1 });

export type TodoDocument = HydratedDocument<InferSchemaType<typeof todoSchema>>;

export const Todo = model('Todo', todoSchema);

export function toTodoDto(todo: TodoDocument) {
  return {
    id: todo._id.toString(),
    title: todo.title,
    completed: todo.completed,
    dueDate: todo.dueDate,
    createdAt: todo.createdAt,
    updatedAt: todo.updatedAt,
  };
}