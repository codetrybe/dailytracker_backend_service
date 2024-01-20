import { StatusCodes } from "http-status-codes";
import { successResponse, errorResponse } from "../utils/libs/response";

import util from "util";
import tryCatch from "../utils/libs/tryCatch";
import db from "../config/db";

// Converting db.query to promise based function
const queryPromise = util.promisify(db.query).bind(db);

export const updateTodo = tryCatch(async (req, res) => {
  const restrictedFields = [
    "list_id",
    "user_id",
    "created_at",
    "updated_at",
  ];

  const userId = req.params.userId;
  const listId = req.params.listId;
  const updatedTodoData = req.body;

  // Check if user matching provided userId exists
  const checkUserQuery = "SELECT * FROM users WHERE user_id = ?";
  const [user] = await queryPromise(checkUserQuery, [userId]);

  if (user.length === 0) {
    return errorResponse(res, "User Not Found!", StatusCodes.NOT_FOUND);
  }

  // Find todo list matching userId and listID. Return error if not found.
  const getTodoQuery = "SELECT todo_lists.* FROM todo_lists JOIN users ON todo_lists.user_id = users.user_id WHERE users.user_id = ? AND todo_lists.list_id = ?";
  
  const todoStatus = await queryPromise(getTodoQuery, [userId, listId]);
  if (todoStatus.length === 0) {
    return errorResponse(res, "Todo with given list ID not found for user", StatusCodes.NOT_FOUND);
  }
  
  // Update todo list with the specified listId using the user-provided details
  const todoUpdateQuery = "UPDATE todo_lists SET ? WHERE list_id = ?";

  await queryPromise(todoUpdateQuery, [updatedTodoData, listId]);

  return successResponse(res, "List updated sucessfully, {}");
});


export const getAllTodos = tryCatch(async (req, res) => {
  const userId = req.params.userId;
  const listId = req.params.listId;

  const getTodoQuery = "SELECT todo_lists.* FROM todo_lists JOIN users ON todo_lists.user_id = users.user_id WHERE users.user_id = ?";
  const todoList = await queryPromise(getTodoQuery, [userId, listId]);

  if (todoList.length > 0) {
    return todoList;
  }

  return errorResponse(res, "List empty", StatusCodes.NOT_FOUND);
});
 