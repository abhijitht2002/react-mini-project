import axios from "axios";
const baseUrl = "http://localhost:8000";

// Get the token from localStorage
const getToken = () => localStorage.getItem("token");

// --- Auth APIs ---
const registerUser = async (name, email, password) => {
  try {
    const res = await axios.post(`${baseUrl}/register`, {
      name,
      email,
      password,
    });
    return res.data;
  } catch (error) {
    console.error("Registration error:", error.response?.data || error);
    throw error;
  }
};

const loginUser = async (email, password) => {
  try {
    const res = await axios.post(`${baseUrl}/login`, { email, password });
    // Save token in localStorage
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("name", res.data.name);
    return res.data;
  } catch (error) {
    console.error("Login error:", error.response?.data || error);
    throw error;
  }
};

// --- Todo APIs ---
const addTodo = async (todo) => {
  try {
    const response = await axios.post(
      `${baseUrl}/todos`,
      { text: todo },
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding todo:", error);
    throw error;
  }
};

const getTodos = async (todo) => {
  try {
    const response = await axios.get(`${baseUrl}/todos`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding todo:", error);
    throw error;
  }
};

const updateTodos = async (id, completed) => {
  try {
    const response = await axios.put(
      `${baseUrl}/todos/${id}`,
      { completed },
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating todo:", error);
    throw error;
  }
};

const deleteTodo = async (id) => {
  try {
    const response = await axios.delete(`${baseUrl}/todos/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting todo:", error);
  }
};

// --- Logout ---
const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("name");

  console.log("After logout:");
  console.log("Token:", localStorage.getItem("token")); // should be null
  console.log("Name:", localStorage.getItem("name")); // should be null
};

export {
  registerUser,
  loginUser,
  addTodo,
  getTodos,
  updateTodos,
  deleteTodo,
  logoutUser,
};
