/*
 * Full Node.js ToDo Backend
 * Author: Gemini
 * Date: 2025-10-31
 *
 * This server uses ONLY built-in Node.js modules.
 * No npm packages (like Express) are used.
 *
 * API Endpoints:
 * GET    /todos       - Get all todos
 * GET    /todos/:id   - Get a single todo
 * POST   /todos       - Create a new todo
 * PUT    /todos/:id   - Update a todo
 * DELETE /todos/:id   - Delete a todo
 *
 * To Run:
 * 1. Save this file as `todo-backend.js`.
 * 2. Run `node todo-backend.js` in your terminal.
 * 3. The server will start on http://localhost:8000.
 * 4. A `todos.json` file will be created in the same directory.
 */

// 1. Import required built-in modules
const http = require('http');
const fs = require('fs').promises; // Use promises version of fs for async/await
const path = require('path');
const crypto = require('crypto'); // To generate unique IDs
const { URL } = require('url'); // To parse URL

// 2. Define constants
const PORT = 8000;
const DB_FILE = 'todos.json'; // The JSON file used as a database
const dbPath = path.join(__dirname, DB_FILE); // Absolute path to the DB file

// 3. Define CORS Headers
// These are necessary to allow a web frontend (on a different domain) to call this API.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow any origin
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// 4. Helper Functions

/**
 * Reads the todos.json file and parses it.
 * If the file doesn't exist, it creates it with an empty array.
 * @returns {Promise<Array>} A promise that resolves to the array of todos.
 */
async function readTodos() {
  try {
    const data = await fs.readFile(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist (ENOENT), create it and return an empty array
    if (error.code === 'ENOENT') {
      await writeTodos([]); // Create the file with an empty array
      return [];
    }
    // For other errors, re-throw them
    throw error;
  }
}

/**
 * Writes the given array of todos to the todos.json file.
 * @param {Array} todos - The array of todos to save.
 * @returns {Promise<void>}
 */
async function writeTodos(todos) {
  // Use JSON.stringify with (null, 2) for pretty-printing the JSON
  await fs.writeFile(dbPath, JSON.stringify(todos, null, 2), 'utf8');
}

/**
 * Reads the full request body (like 'body-parser').
 * @param {http.IncomingMessage} req - The request object.
 * @returns {Promise<string>} A promise that resolves to the request body as a string.
 */
function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      resolve(body);
    });
    req.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * A simple helper to send a JSON response.
 * @param {http.ServerResponse} res - The response object.
 * @param {number} statusCode - The HTTP status code.
 * @param {object} data - The data to send as JSON.
 */
function sendJSONResponse(res, statusCode, data) {
  const headers = {
    ...corsHeaders,
    'Content-Type': 'application/json',
  };
  res.writeHead(statusCode, headers);
  res.end(JSON.stringify(data));
}

// 5. Create the HTTP Server
const server = http.createServer(async (req, res) => {
  try {
    // Handle OPTIONS (pre-flight) requests for CORS
    if (req.method === 'OPTIONS') {
      res.writeHead(204, corsHeaders); // 204 No Content
      res.end();
      return;
    }

    // Parse the URL to get the pathname
    // We use a base URL because req.url is just the path (e.g., '/todos/1')
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;

    // Simple Regex to match /todos/:id
    const todoIdRegex = /^\/todos\/([a-zA-Z0-9\-]+)$/;
    const match = pathname.match(todoIdRegex);

    // --- ROUTING ---

    // GET /todos - Get all todos
    if (req.method === 'GET' && pathname === '/todos') {
      const todos = await readTodos();
      sendJSONResponse(res, 200, todos);

    // GET /todos/:id - Get a single todo
    } else if (req.method === 'GET' && match) {
      const id = match[1];
      const todos = await readTodos();
      const todo = todos.find((t) => t.id === id);

      if (todo) {
        sendJSONResponse(res, 200, todo);
      } else {
        sendJSONResponse(res, 404, { message: 'Todo not found' });
      }

    // POST /todos - Create a new todo
    } else if (req.method === 'POST' && pathname === '/todos') {
      const body = await getRequestBody(req);
      const { text } = JSON.parse(body); // Assumes body is { "text": "..." }

      if (!text) {
        sendJSONResponse(res, 400, { message: 'Todo text is required' });
        return;
      }

      const todos = await readTodos();
      const newTodo = {
        id: crypto.randomUUID(), // Generate a unique ID
        text: text,
        completed: false,
      };

      todos.push(newTodo);
      await writeTodos(todos);
      sendJSONResponse(res, 201, newTodo); // 201 Created

    // PUT /todos/:id - Update a todo
    } else if (req.method === 'PUT' && match) {
      const id = match[1];
      const body = await getRequestBody(req);
      const { text, completed } = JSON.parse(body); // Get new values

      const todos = await readTodos();
      const todoIndex = todos.findIndex((t) => t.id === id);

      if (todoIndex === -1) {
        sendJSONResponse(res, 404, { message: 'Todo not found' });
        return;
      }

      // Update the todo. Only update fields that were provided.
      const existingTodo = todos[todoIndex];
      const updatedTodo = {
        ...existingTodo,
        text: text !== undefined ? text : existingTodo.text,
        completed: completed !== undefined ? completed : existingTodo.completed,
      };

      todos[todoIndex] = updatedTodo;
      await writeTodos(todos);
      sendJSONResponse(res, 200, updatedTodo);

    // DELETE /todos/:id - Delete a todo
    } else if (req.method === 'DELETE' && match) {
      const id = match[1];
      const todos = await readTodos();
      const newTodos = todos.filter((t) => t.id !== id);

      if (todos.length === newTodos.length) {
        sendJSONResponse(res, 404, { message: 'Todo not found' });
        return;
      }

      await writeTodos(newTodos);
      // Send 204 No Content, which doesn't have a body
      res.writeHead(204, corsHeaders);
      res.end();

    // 404 Not Found - For any other route
    } else {
      sendJSONResponse(res, 404, { message: 'Route not found' });
    }

  } catch (error) {
    // Global error handler
    console.error('An error occurred:', error);
    // Handle JSON parsing errors or other server errors
    if (error instanceof SyntaxError) {
      sendJSONResponse(res, 400, { message: 'Invalid JSON in request body' });
    } else {
      sendJSONResponse(res, 500, { message: 'Internal Server Error' });
    }
  }
});

// 6. Start the server
server.listen(PORT, () => {
  console.log(`Node.js ToDo backend server running on http://localhost:${PORT}`);
  // Check/create the DB file on startup
  readTodos().then(() => {
    console.log(`Database file is ready at: ${dbPath}`);
  }).catch(err => {
    console.error('Failed to initialize database:', err);
  });
});
