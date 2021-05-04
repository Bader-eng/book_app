'use strict';

require('dotenv').config();

const express= require('express');
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);

const superagent= require ('superagent');

const PORT=process.env.PORT || 3000;

const server = express();
server.use(express.static('./public'));

server.use(express.urlencoded({ extended: true }));

server.set('view engine','ejs');
server.get('/', getTasks);
// server.get('/',(req,res)=>{
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






// server.listen(PORT,()=>{
//   console.log(`listening on PORT ${PORT}`);
// });


function Book (bookdata){
  //this.url=bookdata.volumeInfo.imageLinks.thumbnai || ;
  this.url = bookdata.volumeInfo.imageLinks.thumbnail || `https://i.imgur.com/J5LVHEL.jpg`;
  this.title=bookdata.volumeInfo.title;
  this.author=bookdata.volumeInfo.authors;
  this.description=bookdata.volumeInfo.description;
}

client.connect()
  .then(() => {
    server.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
  });
