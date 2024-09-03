const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;
require('dotenv').config(); // Load environment variables from .env file

// Connect to MongoDB using the URI from the .env file
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB...', err));

// Define a schema and model for todos
const todoSchema = new mongoose.Schema({
    text: String,
    completed: Boolean
});

const Todo = mongoose.model('Todo', todoSchema);

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
    // Fetch all todos from the database
    const todos = await Todo.find();
    res.render('index', { todos });
});

app.post('/add', async (req, res) => {
    const newTodoText = req.body.todo;
    if (newTodoText) {
        // Create a new todo document and save it to the database
        const newTodo = new Todo({
            text: newTodoText,
            completed: false
        });
        await newTodo.save();
    }
    res.redirect('/');
});

app.post('/toggle', async (req, res) => {
    const index = req.body.index;
    const todos = await Todo.find();
    if (index >= 0 && index < todos.length) {
        const todo = todos[index];
        todo.completed = !todo.completed;
        await todo.save();  // Update the todo in the database
    }
    res.redirect('/');
});

app.get('/notes', (req, res) => {
    res.render('notes');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
