import React, { useState, useEffect } from "react";
import { addTodo, getTodos, updateTodos, deleteTodo, logoutUser } from "../api";
import { useNavigate } from "react-router-dom";

function Todos() {
  const navigate = useNavigate();
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [userName, setUserName] = useState("");
  const [completedCount, setCompletedCount] = useState(0);

  async function getData() {
    const data = await getTodos();
    setTodos(data);
  }

  useEffect(() => {
    const name = localStorage.getItem("name");
    setUserName(name);

    getData();
  }, []);

  useEffect(() => {
    const completed = todos.filter((todo) => todo.completed).length;
    setCompletedCount(completed);
  }, [todos]);

  const handleTodoAdd = async (e) => {
    try {
      e.preventDefault();
      if (input.trim() === "") return;
      const response = await addTodo(input);
      setInput("");
      getData();
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      const response = await updateTodos(id, !completed);
      getData();
    } catch (error) {
      console.log("Error updating todo:", error);
      alert("Failed to update todo status.");
    }
  };

  const removeTodo = async (id) => {
    try {
      const response = await deleteTodo(id);
      getData();
    } catch (error) {
      console.log("Error deleting todo:", error);
    }
  };

  const handleLogout = () => {
    console.log("Before logout:");
    console.log("Token:", localStorage.getItem("token"));
    console.log("Name:", localStorage.getItem("name"));

    logoutUser();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 md:bg-gray-950 text-white p-0 md:p-6">
      <div className="w-full md:max-w-2xl bg-gray-900 rounded-none md:rounded-2xl md:shadow-xl p-6">
        <h1 className="text-2xl font-bold mb-2">📝 {userName}’s Todos</h1>
        <p className="text-gray-400 mb-4">
          {todos.length === 0
            ? `hey ${userName}, seems like you have no tasks for the moment. Add a task to get started!`
            : completedCount === todos.length
            ? `Congrats, ${userName}! you have completed all the tasks! 🎉`
            : `welcome back, ${userName}! You have ${
                todos.length - completedCount
              } tasks left.`}
        </p>

        <form onSubmit={handleTodoAdd} className="mb-6">
          <div className="flex mb-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="grow px-3 py-2 rounded-l-xl bg-gray-800 text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-gray-600"
              placeholder="Add a new task..."
            />
            <button
              className="bg-gray-700 px-4 py-2 rounded-r-xl hover:bg-gray-600 transition"
              type="submit"
            >
              +
            </button>
          </div>
        </form>

        <ul className="space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className={`flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 p-3 rounded-lg transition w-full overflow-hidden ${
                todo.completed
                  ? "bg-gray-800 text-gray-500 line-through"
                  : "bg-gray-850 hover:bg-gray-800"
              }`}
            >
              <span className="flex-1 wrap-break-word overflow-hidden whitespace-pre-wrap pr-3">
                {todo.text}
              </span>
              <div className="flex gap-3 text-sm shrink-0">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id, todo.completed)}
                  className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
                />

                <button
                  onClick={() => removeTodo(todo.id)}
                  className="text-red-500 hover:text-red-600 focus:outline-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-4 text-sm text-gray-400 flex justify-between">
          {todos.length > 0 && (
            <span>
              Progress: {completedCount}/{todos.length}
            </span>
          )}
          {/* <span>{completedCount}/{todos.length} done</span> */}
          <button className="underline" onClick={() => handleLogout()}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Todos;
