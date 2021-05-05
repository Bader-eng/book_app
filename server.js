'use strict';

require('dotenv').config();

const express= require('express');
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
const methodOverride = require('method-override');

const superagent= require ('superagent');

const PORT=process.env.PORT || 3000;

const server = express();
server.use(express.static('./public'));

server.use(express.urlencoded({ extended: true }));
server.use(methodOverride('_method'));

server.set('view engine','ejs');

server.get('/', getTasks);

// server.get('/',(req,res)=>{
//   res.render('/');
// });
server.post('/Books',addBookHandler);
server.get('/Books/:id',detalHandler);
server.put('/updateTask/:id',updateBookHandler);
server.delete('/deleteTask/:id',deleteBookHandler);
// server.get('/index',(req,res)=>{
//   res.render('index');
// });

server.get('/new',(req,res)=>{
  res.render('new');
});

server.post('/new',(req,res)=>{
  let name =req.body.book;
  // let select=req.body.The_way;
  //let url= `https://www.googleapis.com/books/v1/volumes?q=${select}:${name}`;

  let url = `https://www.googleapis.com/books/v1/volumes?q=${name}+intitle`;
  if (req.body.The_way === 'author') {
    url = `https://www.googleapis.com/books/v1/volumes?q=${name}+inauthor`;}
  superagent.get(url)
    .then(bookdata=>{
      //console.log(bookdata);
      let newdata1=bookdata.body.items;
      let books= newdata1.map((val)=>{
        return new Book(val);
      });
      res.render('./searches/show',{books:books});
    });

});


function getTasks(request, response) {

  let SQL = `SELECT * FROM tasks;`;
  client.query(SQL)
    .then(results=>{
      response.render('index',{tasksResults:results.rows});
    })
    .catch(err=>{
      response.render('error',{error:err});
    });
}

function detalHandler(req,res){
  console.log(req.params);
  let taskId = req.params.id;
  let SQL = `SELECT * FROM tasks WHERE id=$1;`;
  let safeValue = [taskId];
  client.query(SQL,safeValue)
    .then(result=>{
    // console.log(result.rows[0]);
      res.render('./Books/details',{task:result.rows[0]});
    });
}


function addBookHandler(req,res){
  console.log(req.body);
  let SQL = `INSERT INTO tasks (imag,title,author,isbn,description) VALUES ($1,$2,$3,$4,$5) RETURNING *;`;
  let safeValues = [req.body.imag,req.body.title,req.body.author,req.body.isbn,req.body.description];
  client.query(SQL,safeValues)
    .then(result=>{

      res.redirect(`/Books/${result.rows[0].id}`);
    });
}

function updateBookHandler(req,res){
  // console.log(req.body);
  let {imag,title,author,isbn,description} = req.body;
  let SQL = `UPDATE tasks SET imag=$1,title=$2,author=$3,isbn=$4,description=$5 WHERE id=$6;`;
  let safeValues = [imag,title,author,isbn,description,req.params.id];
  //console.log(safeValues);
  client.query(SQL,safeValues)
    .then(()=>{
      res.redirect(`/Books/${req.params.id}`);
    });
}

function deleteBookHandler(req,res){
  // console.log('Hi');
  let SQL=`DELETE FROM tasks WHERE id=$1;`;
  let value=[req.params.id];
  client.query(SQL,value)
    .then(()=>{
      res.redirect('/');
    });
}
// server.listen(PORT,()=>{
//   console.log(`listening on PORT ${PORT}`);
// });


function Book (bookdata){
  //this.url=bookdata.volumeInfo.imageLinks.thumbnai || ;
  this.imag = bookdata.volumeInfo.imageLinks.thumbnail || 'https://i.imgur.com/J5LVHEL.jpg';
  this.title=bookdata.volumeInfo.title || 'no data';
  this.author=bookdata.volumeInfo.authors || 'no data';
  this.isbn=this.isbn = bookdata.volumeInfo.industryIdentifiers ;
  if (this.isbn){
    this.isbn = this.isbn[0].identifier;
  }else { this.isbn = 'Not available';
  }
  this.description=bookdata.volumeInfo.description || 'no data';
}

client.connect()
  .then(() => {
    server.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
  });
