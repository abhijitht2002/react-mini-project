/*
 * Full Node.js Auth + Todo Backend
 * Author: Abhijith T with chatgpt
 * Date: 2025-11-09
 *
 * Features:
 * - User registration & login with hashed passwords
 * - Token-based authentication
 * - CRUD todos per user
 * - Single server for both auth & todos
 */

const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const PORT = 8000;
const USERS_FILE = path.join(__dirname, 'users.json');
const TODOS_FILE = path.join(__dirname, 'todos.json');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// --- Helper functions ---
async function readJSON(file) {
  try {
    const data = await fs.readFile(file, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.writeFile(file, JSON.stringify([], null, 2));
      return [];
    }
    throw err;
  }
}

async function writeJSON(file, data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8');
}

function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function sendJSON(res, status, data) {
  res.writeHead(status, { ...corsHeaders, 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// --- Token middleware ---
async function authenticate(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');
  const users = await readJSON(USERS_FILE);
  const user = users.find(u => u.token === token);
  return user || null;
}

// --- Server ---
const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, corsHeaders);
      res.end();
      return;
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;

    const todoIdRegex = /^\/todos\/([a-zA-Z0-9\-]+)$/;
    const todoMatch = pathname.match(todoIdRegex);

    // --------- AUTH ROUTES ---------

    // Register
    if (req.method === 'POST' && pathname === '/register') {
      const body = JSON.parse(await getRequestBody(req));
      const { name, email, password } = body;
      if (!name || !email || !password)
        return sendJSON(res, 400, { message: 'All fields required' });

      const users = await readJSON(USERS_FILE);
      if (users.find(u => u.email === email))
        return sendJSON(res, 400, { message: 'User already exists' });

      const hashed = hashPassword(password);
      const newUser = {
        id: crypto.randomUUID(),
        name,
        email,
        password: hashed,
        token: null
      };
      users.push(newUser);
      await writeJSON(USERS_FILE, users);
      return sendJSON(res, 201, { message: 'User registered successfully' });
    }

    // Login
    if (req.method === 'POST' && pathname === '/login') {
      const body = JSON.parse(await getRequestBody(req));
      const { email, password } = body;
      if (!email || !password)
        return sendJSON(res, 400, { message: 'Email and password required' });

      const users = await readJSON(USERS_FILE);
      const user = users.find(u => u.email === email);
      if (!user) return sendJSON(res, 404, { message: 'User not found' });

      const hashed = hashPassword(password);
      if (hashed !== user.password) return sendJSON(res, 401, { message: 'Invalid credentials' });

      const token = crypto.randomBytes(16).toString('hex');
      user.token = token;
      await writeJSON(USERS_FILE, users);

      return sendJSON(res, 200, { message: 'Login successful', token, name: user.name });
    }

    // --------- TODO ROUTES (require auth) ---------
    const user = await authenticate(req);
    if (!user) {
      if (pathname.startsWith('/todos')) return sendJSON(res, 401, { message: 'Unauthorized' });
    }

    // GET /todos
    if (req.method === 'GET' && pathname === '/todos') {
      const todos = await readJSON(TODOS_FILE);
      const userTodos = todos.filter(t => t.userId === user.id);
      return sendJSON(res, 200, userTodos);
    }

    // GET /todos/:id
    if (req.method === 'GET' && todoMatch) {
      const id = todoMatch[1];
      const todos = await readJSON(TODOS_FILE);
      const todo = todos.find(t => t.id === id && t.userId === user.id);
      if (!todo) return sendJSON(res, 404, { message: 'Todo not found' });
      return sendJSON(res, 200, todo);
    }

    // POST /todos
    if (req.method === 'POST' && pathname === '/todos') {
      const body = JSON.parse(await getRequestBody(req));
      const { text } = body;
      if (!text) return sendJSON(res, 400, { message: 'Todo text is required' });

      const todos = await readJSON(TODOS_FILE);
      const newTodo = {
        id: crypto.randomUUID(),
        userId: user.id,
        text,
        completed: false
      };
      todos.push(newTodo);
      await writeJSON(TODOS_FILE, todos);
      return sendJSON(res, 201, newTodo);
    }

    // PUT /todos/:id
    if (req.method === 'PUT' && todoMatch) {
      const id = todoMatch[1];
      const body = JSON.parse(await getRequestBody(req));
      const { text, completed } = body;

      const todos = await readJSON(TODOS_FILE);
      const idx = todos.findIndex(t => t.id === id && t.userId === user.id);
      if (idx === -1) return sendJSON(res, 404, { message: 'Todo not found' });

      todos[idx].text = text !== undefined ? text : todos[idx].text;
      todos[idx].completed = completed !== undefined ? completed : todos[idx].completed;

      await writeJSON(TODOS_FILE, todos);
      return sendJSON(res, 200, todos[idx]);
    }

    // DELETE /todos/:id
    if (req.method === 'DELETE' && todoMatch) {
      const id = todoMatch[1];
      const todos = await readJSON(TODOS_FILE);
      const idx = todos.findIndex(t => t.id === id && t.userId === user.id);
      if (idx === -1) return sendJSON(res, 404, { message: 'Todo not found' });

      todos.splice(idx, 1);
      await writeJSON(TODOS_FILE, todos);
      res.writeHead(204, corsHeaders);
      res.end();
      return;
    }

    // 404 fallback
    return sendJSON(res, 404, { message: 'Route not found' });

  } catch (err) {
    console.error(err);
    return sendJSON(res, 500, { message: 'Server error' });
  }
});

server.listen(PORT, () => {
  console.log(`Node.js ToDo backend server running at http://localhost:${PORT}`);
});
