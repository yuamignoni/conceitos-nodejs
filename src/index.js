const express = require('express');
const cors = require('cors');
const { send } = require('express/lib/response');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
let {username} = request.headers;
const user = users.find(user => user.username === username);
if (!user)
{
  return response.status(401).json("Usuário não encontrado")
}
request.user = user;
return next()
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;
  const isUsernameTaken = users.some((users)=>username==users.username)

  if(!isUsernameTaken) {
    users.push({ 
      id: uuidv4(), 
      name: name, 
      username: username, 
      todos: []
    })
    return response.status(201).json("Usuário criado")
  }
  else {
    return response.status(401).json("usuário já existente")
  }
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  let {username} = request.headers
  let todos = users.find((users)=>users.username===username).todos
  return response.send(todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  let {title, deadline} = request.body;
  let {username} = request.headers;
  let data = new Date();
  let id = uuidv4();
  let responseObj = {
    "id":id,
    "title":title,
    "done":false,
    "deadline":new Date(deadline),
    "created_at":data  
  }
  users.find((users)=>users.username===username).todos.push(responseObj);
  return response.json(responseObj)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  let {user} = request;
  let {id} = request.params;
  let {title, deadline} = request.body;

  const todo = user.todos.find(todo => todo.id === id);

  if(!todo){
    return response.status(404).json({ error: "Todo não encontrada"});
  }
  else {
    todo.title = title;
    title.deadline = new Date(deadline);

    return response.json(todo);
  }
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  let {user} = request;
  let {id} = request.params;
  const todo = user.todos.find(todo => todo.id === id);
  if(!todo){
    return response.status(404).json({ error: "Todo não encontrada"});
  }
  else {
    todo.done = "True";
    return response.json(todo);
  }
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  let {user} = request;
  let {id} = request.params;
  const todo = user.todos.find(todo => todo.id === id);

  if(!todo){
    return response.status(404).json({ error: "Todo não encontrada"});
  }
  else {
    user.todos.splice(todo, 1);
    return response.status(204).send();
  }
  });

module.exports = app;