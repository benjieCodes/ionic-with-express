var express = require('express');
var app = express();
var database = require('./data/database.js')
var bodyParser = require('body-parser');

console.log('Server started on port 3000');
app.use(bodyParser.json());
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8100'); //LOCATION OF CLIENT APP
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  next();
});

app.get('/', function (req, res) {
  res.send('hello world')
})
app.get('/todos', function (req, res) {
  var sql = 'SELECT * FROM todos';
  database.query({sql:sql}).then(function (results) {
    res.send(results);
  })
})
app.post('/todos', function (req, res) {
  var sql = `INSERT INTO todos (title, completed) VALUES ('${req.body.title}', 'false')`;
  database.query({sql:sql}).then(function (results) {
    res.send(results)
  }).catch(function (err) {
    res.status(500);
    res.send(err);
  })
})
app.put('/todos/:id', function (req, res) {
  var sql = `UPDATE todos SET title ='${req.body.title}', completed ='${req.body.completed}' WHERE id = '${req.body.id}'`;
  database.query({sql:sql}).then(function (results) {
    res.send(results)
  }).catch(function (err) {
    res.status(500);
    res.send(err);
  })
})
app.delete('/todos/:todo.id', function (req, res) {
  var sql = `DELETE FROM todos WHERE id ='${req.body.id}'` ;
  database.query({sql:sql}).then(function (results) {
    res.send(results)
  }).catch(function (err) {
    res.status(500);
    res.send(err);
  })
})
app.listen(3000);




