import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdModeEditOutline } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import { MdOutlineDone } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import api from "../api/axios";
import useTodo from "../context/useTodo";
import useAuth from "../context/useAuth";

const Home = () => {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
  });
  const navigate = useNavigate();
  const {
    newTodo,
    setNewTodo,
    todos,
    setTodos,
    editingTodo,
    setEditingTodo,
    editedText,
    setEditedText,
  } = useTodo();
  const { user } = useAuth();

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await api.get("/api/todos");
        setTodos(response.data);
      } catch (err) {
        console.log("Error fetching todos:", err);
      }
    };
    fetchTodos();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("/api/todos/stats");
      setStats(res.data.stats);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const logout = async () => {
    try {
      await api.post("/user/logout");
      localStorage.removeItem("accessToken");
      setTodos([]);
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    try {
      const response = await api.post("/api/todos", { text: newTodo });
      setTodos([...todos, response.data]);
      setNewTodo("");
      await fetchStats();
    } catch (err) {
      console.log("Error adding todo:", err);
    }
  };

  const startEditing = (todo) => {
    setEditingTodo(todo._id);
    setEditedText(todo.text);
  };

  const saveEdit = async (id) => {
    try {
      const response = await api.patch(`/api/todos/${id}`, {
        text: editedText,
      });
      setTodos(todos.map((todo) => (todo._id === id ? response.data : todo)));
      setEditingTodo(null);
      await fetchStats();
    } catch (err) {
      console.log("Error updating todo:", err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await api.delete(`/api/todos/${id}`);
      setTodos(todos.filter((todo) => todo._id !== id));
      await fetchStats();
    } catch (err) {
      console.log("Error deleting todo:", err);
    }
  };

  const toggleTodo = async (id) => {
    try {
      const todo = todos.find((t) => t._id === id);
      const response = await api.patch(`/api/todos/${id}`, {
        completed: !todo.completed,
      });
      setTodos(todos.map((t) => (t._id === id ? response.data : t)));
      await fetchStats();
    } catch (err) {
      console.log("Error toggling todo:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <h1 className="text-white font-bold text-4xl text-center mb-5">
        {" "}
        Hello, {user?.name}! Ready to get things done today?
      </h1>
      <div className="flex flex-wrap gap-5 mb-8">
        <div className="flex-1 min-w-[180px] bg-white rounded-2xl shadow-md p-5 text-center hover:shadow-lg transition">
          <h3 className="text-gray-500 font-medium mb-2">Total Tasks</h3>
          <p className="text-4xl font-bold text-indigo-600">{stats.total}</p>
        </div>
        <div className="flex-1 min-w-[180px] bg-white rounded-2xl shadow-md p-5 text-center hover:shadow-lg transition">
          <h3 className="text-gray-500 font-medium mb-2">Completed</h3>
          <p className="text-4xl font-bold text-green-500">{stats.completed}</p>
        </div>
        <div className="flex-1 min-w-[180px] bg-white rounded-2xl shadow-md p-5 text-center hover:shadow-lg transition">
          <h3 className="text-gray-500 font-medium mb-2">Pending</h3>
          <p className="text-4xl font-bold text-red-500">{stats.pending}</p>
        </div>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Task Manager</h1>
            <p className="text-slate-400 text-sm mt-1">
              Organize your goals and stay productive
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* ✅ Added button — only change */}
            <button
              onClick={() => navigate("/activity")}
              className="text-white px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
            >
              Dashboard
            </button>

            <button
              onClick={logout}
              className="text-white px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>

        <form
          onSubmit={addTodo}
          className="flex items-center gap-2 bg-slate-800 border border-slate-700 p-2 rounded-xl"
        >
          <input
            className="flex-1 bg-transparent outline-none px-3 py-2 text-white placeholder-slate-400"
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="What needs to be done?"
          />
          <button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer"
          >
            Add Task
          </button>
        </form>

        <div className="mt-4">
          {todos.length === 0 ? (
            <p className="text-center text-slate-500 mt-8">
              No tasks yet. Add one above!
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {todos.map((todo) => (
                <div key={todo._id}>
                  {editingTodo === todo._id ? (
                    <div className="flex items-center gap-x-3">
                      <input
                        className="flex-1 p-3 bg-slate-800 border border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                        type="text"
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                      />
                      <button
                        onClick={() => saveEdit(todo._id)}
                        className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-200 cursor-pointer"
                      >
                        <MdOutlineDone />
                      </button>
                      <button
                        className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-all duration-200 cursor-pointer"
                        onClick={() => setEditingTodo(null)}
                      >
                        <IoClose />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-emerald-500/40 transition-all duration-200">
                      <div className="flex items-center gap-x-4 overflow-hidden">
                        <button
                          onClick={() => toggleTodo(todo._id)}
                          className={`flex-shrink-0 h-6 w-6 border rounded-full flex items-center justify-center transition-all duration-200 ${
                            todo.completed
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-slate-500 hover:border-emerald-400"
                          }`}
                        >
                          {todo.completed && <MdOutlineDone />}
                        </button>
                        <span
                          className={`font-medium truncate ${
                            todo.completed
                              ? "line-through text-slate-500"
                              : "text-slate-100"
                          }`}
                        >
                          {todo.text}
                        </span>
                      </div>
                      <div className="flex gap-x-2">
                        <button
                          className="p-2 text-blue-500 hover:text-blue-700 rounded-lg hover:bg-blue-50 duration-200"
                          onClick={() => startEditing(todo)}
                        >
                          <MdModeEditOutline />
                        </button>
                        <button
                          onClick={() => deleteTodo(todo._id)}
                          className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 duration-200"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
