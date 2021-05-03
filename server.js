'use strict';

require('dotenv').config();

const express= require('express');

const superagent= require ('superagent');

const PORT=process.env.PORT || 3000;

const server = express();
server.use(express.static('./public'));
server.set('view engine','ejs');

server.get('/',(req,res)=>{
  res.render('index');
});

server.get('/new',(req,res)=>{
  res.render('./new');
});

server.post('/new',(req,res)=>{
  let booksarry=[];
  let name =req.query.book;
  let newdata;
  let url= `https://www.googleapis.com/books/v1/volumes?q=${name}+intitle`;
  let url1= `https://www.googleapis.com/books/v1/volumes?q=${name}+inauthor`;
  if(req.query.The_way==='title')
  {newdata=url;}
  else if(req.query.The_way==='author')
  {newdata=url1;}
  superagent.get(newdata)
    .then(bookdata=>{
      let newdata1=bookdata.body.items;
      newdata1.map(val=>{
        let newitem=new Book (val);
        booksarry.push(newitem);
      });
      res.render('/searches/show',{books:booksarry});
    });

});


server.listen(PORT,()=>{
  console.log(`listening on PORT ${PORT}`);
});


function Book (bookdata){

  this.title=bookdata.volumeInfo.title;
  this.author=bookdata.volumeInfo.authors;
  this.date=bookdata.volumeInfo.publisshedData;
  this.cover=bookdata.volumeInfo.thumbnai;
  this.description=bookdata.volumeInfo.description;

}
