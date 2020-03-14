var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectId;
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

let userloggedin=false;
let user = {}
let users = [
    {email:'thiru12@gmail.com',password:'1234',name:'Thiru'},
    {email:'moorthi12@gmail.com',password:'1234',name:'Moorthi'},

]

/* GET home page. */
router.get('/',
  function(req,res,next){
    if(userloggedin){
      next();
    }
    else{
      res.redirect('/signin')
    }

  },
 function(req, res, next) {
  res.render('index', { title: 'Myapplication',layout:'mainlayout', user:user });

});

/* Signin page */

router.get('/signin', function(req, res, next) {
  userloggedin=true;
  res.render('signin', { title: 'Signin Page' });
}); 


/* Start : Signin Page */

router.post('/signin',function(req, res, next) {
let email = req.body.email;
let password =  req.body.password;
console.log(email);
console.log(password);
if(email != undefined && password != undefined && password !==''){
  users.forEach((u)=> {
    if(u.email === email && u.password ===password){
     user = u;
 }
})
if(user && user.name !== undefined){
  userloggedin=true;
  res.redirect('/')
}else{
  res.render('signin',{title:'signin'});
}
}
else{
  res.render('signin',{title:'signin'});
}
})

/* Signup page */

router.get('/signup', function(req, res) {
  res.render('signup');
})


/* Start logout */
router.get('/logout',function(req,res,next){
  res.redirect('/signin');
});

/* End logout */


/* Start : Blog page */
router.get('/blog', function(req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    let dbo = db.db("portfolio");
    let d = new Date();
    dbo.collection('post').find().limit(5).toArray(function (err, post) {
      if (err) throw err;
      console.log(JSON.stringify(post));
      db.close();
      res.render('blog', {layout:'layout_blog', post: post });
    })
  });
});

/* Blog Details page */


router.get('/blog/:id', function (req, res) {
  let id = req.params.id;
  //  once you got the project id
  // make the database call to check if it exists
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    let dbo = db.db("portfolio");
    console.log("myid2", id);
    dbo.collection('post').findOne({ "_id": ObjectId(id)}, function (err, data) {
      if (err) throw err;
      console.log(JSON.stringify(data))
      db.close();
      res.render('blogdetails', { layout :'layout_blogdetail',data: data });

    })
  })
  });

    /* create  new blog */
    router.get('/createblog', function(req, res, next) {
      res.render('createblog',{ layout :'layout_createblog'});
    });
    /* submit create blog */
    router.post('/createblog', function(req, res, next) {
      let title = req.body.title;
      let image = req.body.image;
      let description = req.body.description;
      let project ={title,image,description};
       /* write the data in DB */
       MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db('portfolio');
        let d = new Date();
        dbo.collection('post').insertOne(project, function (err, project) {
          if (err) throw err;
          console.log(JSON.stringify('post'));
          db.close();
          // redirect the project list page
           res.redirect('/blog');
  
        })
      });
    });

/*  start : update blog */

router.post('/blog/:id',  function(req, res, next) {
  let id = req.params.id;
  console.log("hii blog how are you??????")

  let title = req.body.title;
  let image = req.body.image;
  let description = req.body.description;
  let project = {title, image, description};
  let updatedProject = {$set: project};

  MongoClient.connect(url, function(err, db){
    if (err) throw err;
    let dbo = db.db("portfolio");
    dbo.collection('post').updateOne({_id: new ObjectId(id)}, updatedProject, function(err, p){
      if (err) throw err;
      console.log(JSON.stringify(p));
      db.close();
      res.redirect('/blog')
    })
  });
});

 /* End : Update blog */ 

 /* start: Delete blog */

router.get('/blog/:id/delete', function(req, res, next) {
  let id = req.params.id

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db('portfolio');
    let d = new Date();
    dbo.collection('post').remove({_id: new ObjectId(id)}, function (err, p) {
      if (err) throw err;
      console.log(JSON.stringify(p));
      db.close();
      // redirect the project list page
      res.redirect('/blog');
    })
    });
});

/* End: Delete blog */

/* End: Blog page */
module.exports = router;
