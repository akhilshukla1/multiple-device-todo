import { createContext } from "react";
import { useState } from "react";

const TodoContext = createContext();

const TodoProvider = ({ children }) => {
  const [newTodo, setNewTodo] = useState("");
  const [todos, setTodos] = useState([]);
  const [editingTodo, setEditingTodo] = useState(null);
  const [editedText, setEditedText] = useState("");
  return (
    <TodoContext.Provider
      value={{
        newTodo,
        setNewTodo,
        todos,
        setTodos,
        editingTodo,
        setEditingTodo,
        editedText,
        setEditedText,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};
export { TodoContext, TodoProvider };
