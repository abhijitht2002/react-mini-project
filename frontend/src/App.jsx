import React, { useEffect, useState } from "react";
import { addTodo, getTodos, updateTodos, deleteTodo } from "./api";
import { Routes, Route } from "react-router-dom";
import Todos from "./pages/Todos";
import AuthPage from "./pages/AuthPage";

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");

  async function getData() {
    const data = await getTodos();
    setTodos(data);
  }

  useEffect(() => {
    getData();
  }, []);

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
    // setTodos(todos.filter((todo) => todo.id !== id));

    try {
      const response = await deleteTodo(id);
      getData();
    } catch (error) {
      console.log("Error deleting todo:", error);
    }
  };

  return (
    // <div className="min-h-screen bg-gray-100 py-8">
    //   <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
    //     <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
    //       Todo List
    //     </h1>

    //     <form onSubmit={handleTodoAdd} className="mb-6">
    //       <div className="flex gap-2">
    //         <input
    //           type="text"
    //           value={input}
    //           onChange={(e) => setInput(e.target.value)}
    //           className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
    //           placeholder="Add a new todo..."
    //         />
    //         <button
    //           type="submit"
    //           className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    //         >
    //           Add
    //         </button>
    //       </div>
    //     </form>

    //     <div className="space-y-3">
    //       {todos.map((todo) => (
    //         <div
    //           key={todo.id}
    //           className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
    //         >
    //           <div className="flex items-center gap-3">
    //             <input
    //               type="checkbox"
    //               checked={todo.completed}
    //               onChange={() => toggleTodo(todo.id, todo.completed)}
    //               className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
    //             />
    //             <span
    //               className={`${
    //                 todo.completed
    //                   ? "line-through text-gray-400"
    //                   : "text-gray-800"
    //               }`}
    //             >
    //               {todo.text}
    //             </span>
    //           </div>
    //           <button
    //             onClick={() => removeTodo(todo.id)}
    //             className="text-red-500 hover:text-red-600 focus:outline-none"
    //           >
    //             <svg
    //               xmlns="http://www.w3.org/2000/svg"
    //               className="h-5 w-5"
    //               viewBox="0 0 20 20"
    //               fill="currentColor"
    //             >
    //               <path
    //                 fillRule="evenodd"
    //                 d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
    //                 clipRule="evenodd"
    //               />
    //             </svg>
    //           </button>
    //         </div>
    //       ))}
    //     </div>
    //   </div>
    // </div>

    <>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="todos" element={<Todos />} />
      </Routes>
    </>
  );
}

export default App;
