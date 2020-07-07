const express = require("express");
const router = express.Router();
const mongo = require("mongodb").MongoClient;
const bodyParser = require("body-parser");

var passwordHash = require("password-hash");
var ObjectId = require("mongodb").ObjectID;
const jwt = require("jsonwebtoken");
const jwtKey = "secret_key"
const jwtExpirySeconds = 300;

var urlencodedParser = bodyParser.urlencoded({ extended: true });

mongo.connect('mongodb://127.0.0.1/amazon', { useUnifiedTopology: true },function(err, db)
{

    var dbo = db.db('amazon')
    var users = dbo.collection("users"),
      product = dbo.collection("products"),
      cart = dbo.collection("cart");
   if(err)
   {
       throw err;
   }

   router.get('/', (req, res) => {
     res.send('<h2>welcome</h2>')
   })

   router.get('/allproducts',(req,res)=>{
     product.find({}).toArray((err,result)=>{
       if(err)
       {
         res.send(err)
       }
       res.send(result)
     })
   })

   router.post("/register", urlencodedParser, (req, res) => {
     console.log(req.body);

     var hashedPassword = passwordHash.generate(req.body.password);
     console.log(hashedPassword);
     var new_user = {
       name: req.body.name,
       location: req.body.location,
       email:req.body.email,
       password: hashedPassword,
     };
     users.insertOne(new_user, (err, result) => {
       if (!err) {
         res.send(
           `Welcome to amazon ${req.body.name}!! U r regstrd succsfully now u can log in`
         );
       } else {
         res.send("sometihng went wrong");
       }
     });
   });

   router.post('/login',urlencodedParser,(req,res)=>{
    users.findOne({email:req.body.email},(err,result)=>{
        // console.log(result)
        if(!err)
        {
            if(passwordHash.verify(req.body.password,result.password))
            {
              var username = req.body.email
              const token = jwt.sign({ username }, jwtKey, {
                algorithm: "HS256",
                expiresIn: jwtExpirySeconds,
              });
              console.log(token)
              res.cookie('token', token, { maxAge: jwtExpirySeconds * 1000 });
                res.send(`${result.name} U r logged in successfully!!`)
            }
            else
            {
                res.send("inavlid credentials")
            }
        }
    })
   })

   router.get('/searchbytag/:tag',urlencodedParser,(req,res)=>{
    var tag = req.params.tag
    var query = { tag: tag };
    product.find(query).toArray((err,result)=>{
      if(result.length)
      {
        res.send(result)
      }
      else
      {
        res.send('not match found')
      }
    })
   })

   router.get('/searchbyid/:id',urlencodedParser,(req,res)=>{
        if(req.params.id.length!=24)
        {
          res.send('invalid id')
        }
        product.find({_id:new ObjectId(req.params.id)}).toArray((err,result)=>{
        if(err)
        {
            throw err
        }
        //res.send(result)
        if(result.length)
        {   
            res.send(result)
        }
        else
        {
            res.send("product not found")
        }
    })
   })

   router.post('/addtocart/:id',urlencodedParser,(req,res)=>{
     const token = req.cookies.token
     if(!token)
     {
       res.send("u need to login for adding item to your cart.Please login..")
     }
     if(req.params.id.length!=24)
     {
       res.send("inavalid id")
     }
     else
     {
      var payload
      try {
        payload = jwt.verify(token, jwtKey)
      } catch (e) {
        if (e instanceof jwt.JsonWebTokenError) {
          // if the error thrown is because the JWT is unauthorized, return a 401 error
          return res.status(401).end()
        }
        // otherwise, return a bad request error
        return res.status(400).end()
      }
       var add_item = {
         email:payload.username,
         id:req.params.id
       }
       cart.insertOne(add_item,(err,result)=>
       {
         if(!err)
         {
          res.send("added u can now view it anytime from your cart")
         }
         else
         {
           res.send(err)
         }
       })
     }
   })

   router.get('/viewmycart',urlencodedParser,(req,res)=>{
     const token = req.cookies.token;
     if(!token)
     {
      res.send("u need to login for adding item to your cart.Please login..")
     }
     var payload;
     try {
       payload = jwt.verify(token,jwtKey)
     } catch (e) {
       if(e instanceof jwt.JsonWebTokenError)
       {
        return res.status(401).end()
       }
       else
       {
        return res.status(400).end()
       }
     }
     cart.find({email:payload.username},{ projection: { _id: 0,email: 0 } }).toArray((err,result)=>{
       if(err)
       {
         throw err
       }
       if(result)
       {
         res.send(result)
       }
       res.send('you have nothing in your cart go through our products and whatever u wannt to purchase or like')
     })
   })

   router.post('/logout',(req,res)=>{
    const token = req.cookies.token
    if(token)
    {
      try {
        var payload = jwt.verify(token, jwtKey);
      } catch (e) {
        if (e instanceof jwt.JsonWebTokenError) {
          return res.status(401).end();
        } else {
          return res.status(400).end();
        }
      }
      res.clearCookie('token')
    }
    res.send('logged out')
   })

   router.get('/:tag/filter',urlencodedParser,(req,res)=>{
      console.log(req.params.tag)
    product.find({tag:req.params.tag,"price":{$lte:req.params.PriceBelow},"rating":{$gte:req.params.RatingAbove}}).toArray((err,result)=>{
      if(err)
      {
        throw err;
        res.send(err)
      }
      if(result.length)
      {
        res.send(result)
      }
      else
      {
        res.send("no such match found")
      }
    })
   })
})

module.exports = router