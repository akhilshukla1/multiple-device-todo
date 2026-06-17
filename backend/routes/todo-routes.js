import express from "express";
import Todo from "../model/todo-model.js";
import auth from "../middleware/userAuth.js";
import { getTodoStats } from "../controllers/todoController.js";
const todoRouter = express.Router();

// get todos of logged in user only
todoRouter.get("/", auth, async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.user.id });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: "Error fetching todos" });
  }
});

// add todo for logged in user
todoRouter.post("/", auth, async (req, res) => {
  const todo = new Todo({
    userId: req.user.id,
    text: req.body.text,
  });
  try {
    const newTodo = await todo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(400).json({ message: "Error adding todo" });
  }
});

// update todo — only if it belongs to this user
todoRouter.patch("/:id", auth, async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    if (req.body.text !== undefined) todo.text = req.body.text;
    if (req.body.completed !== undefined) todo.completed = req.body.completed;

    const updatedTodo = await todo.save();
    res.json(updatedTodo);
  } catch (err) {
    res.status(400).json({ message: "Error updating todo" });
  }
});

// delete todo — only if it belongs to this user
todoRouter.delete("/:id", auth, async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!todo) return res.status(404).json({ message: "Todo not found" });
    res.json({ message: "Todo deleted" });
  } catch (err) {
    res.status(400).json({ message: "Error deleting todo" });
  }
});

todoRouter.get("/stats", auth, getTodoStats);

export default todoRouter;
