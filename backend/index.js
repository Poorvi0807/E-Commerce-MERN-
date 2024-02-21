// const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer= require("multer");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const port = process.env.PORT || 4000;
const secretKey = process.env.JWT_SECRET;

app.use(express.json());
app.use(cors());

const connnection=async()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('connected')
    } catch (error) {
        console.log('connection failure')
    }
}



// API creation
app.get("/",(req,res) =>{
    res.send("Express App is Running");
});

const storage= multer.diskStorage({
    destination: './upload/images',
    filename:(req,file,cb) =>{
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({storage:storage})
// Creation upload endpoint for images
app.use('/images',express.static('upload/images'))
app.post("/upload",upload.single('product'),(req,res)=>{
    res.json({
        success:1,
        image_url:`http://localhost:${port}/images/${req.file.filename}`
    })
})

// Schema for creating products

const Product = mongoose.model("Product",{
    id:{
        type: Number,
        required:true,
    },
    name:{
        type: String,
        required:true, 
    },
    image:{
        type: String,
        required:true, 
    },
    category:{
        type: String,
        required:true, 
    },
    new_price:{
        type: Number,
        required:true, 
    },
    old_price:{
        type: Number,
        required:true, 
    },
    date:{
        type:Date,
        default:Date.now,
    },
    available:{
        type:Boolean,
        default:true,

    },
})

app.post("/addproduct",async(req,res)=>{
    let products = await Product.find({});
    let id;
    if(products.length >0){
        let last_product_array=products.slice(-1);
        let last_product=last_product_array[0];
        id=last_product.id+1;
    }
    else{
        id=1;
    }
     const product = new Product({
        id:id,
        // id:req.body.id,
        name:req.body.name,
        image:req.body.image,
        category:req.body.category,
        old_price:req.body.old_price,
        new_price:req.body.new_price,
     })
     console.log(product);
     await product.save();
     console.log("Saved");
     res.json({
        success:true,
        message: "Product added successfully",
        name:req.body.name,  // We will get the product name
     })
})

// Creating API For deleting Products

app.post('/removeproduct',async(req,res) =>{
    await Product.findOneAndDelete({id:req.body._id});
    console.log("Removed");
    res.json({
        success:true,
        name:req.body.name
    })
})

// Creating API For getting all Products
app.get('/allproducts',async(req,res)=> {
    let products = await Product.find({});
    console.log("All Products Fetched");
     res.send(products);
})

//Schema Creating for User model

const Users= mongoose.model('Users',{
     name:{
        type:String,
     },
     email:{
        type:String,
        unique:true,
     },
     password:{
        type:String,
     },
     cartData:{
        type:Object,
     },
     date:{
        type:Date,
        default:Date.now,
     }
})

// Creating endpoint for registering the user

app.post('/signup',async(req,res)=>{
    // res.send("signup")
     let check= await Users.findOne({email:req.body.email});
     console.log(check);
     
     if(check){
        return res.status(400).json({success:false,error:"existing user found with same email address"});
     }

     let cart = {};
     for(let i=0;i<300;i++){
        cart[i]=0;
     }
     const user = new Users({
        name:req.body.username,
        email:req.body.email,
        password:req.body.password,
        cartData:cart,
     });
      
     await user.save();

     const data={
        user:{
            id:user.id
        }
     }

    //  const token = jwt.sign(data,secretKey);
    const token = jwt.sign(data, 'secretKey');

     res.json({success:true,token});
})

// creating endpoint for user login

app.post("/login",async(req,res)=>{
    let user = await Users.findOne({email:req.body.email});
    if(user){
        const passCompare = req.body.password === user.password;
        if(passCompare) {
            const data = {
                user:{
                    id:user.id
                }
            }
            const token = jwt.sign(data, secretKey);

            res.json({success:true,token});
        }
        else{
            res.json({success:false,errors:"Wrong Password"}); 
        }
    }
    else{
        res.json({success:false,errors:"Wrong Email ID"});
    }
})

app.listen(port,async(error)=>{
    try {
        await connnection();
        console.log("Server Running on Port"+port);
    } catch (error) {
        console.log("Error : "+error);
    }

   
});

// {
//     "id": 1,
//     "name": "Poorvi Singh Thakur",
//     "image": "http://localhost:4000/images/product_1706032057992.png",
//     "category": "kid",
//     "new_price": 234,
//     "old_price": 1234,
    
//   }
// {
//     "id": 2,
//     "name": "Product Five",
//     "image": "http://localhost:4000/images/product_1704616842460.png",
//     "category": "Sports",
//     "new_price": 18,
//     "old_price": 22,
//     "available": true
//   }

//   {
//     "id": 4,
//     "name": "Product Five",
//     "image": "http://localhost:4000/images/product_1704616842460.png",
//     "category": "Sports",
//     "new_price": 18,
//     "old_price": 22
//   }

//   {
//     "_id": {
//       "$oid": "65b0168209cd4aa81e2924ee"
//     },
//     "id": 4,
//     "name": "Product Five",
//     "image": "http://localhost:4000/images/product_1704616842460.png",
//     "category": "Sports",
//     "new_price": 18,
//     "old_price": 22,
//     "available": true,
//     "date": {
//       "$date": "2024-01-23T19:41:54.335Z"
//     },
//     "__v": 0
//   }

//   {
//     "id": 5,
//     "name": "Product Five",
//     "image": "http://localhost:4000/images/product_1704616842460.png",
//     "category": "Sports",
//     "new_price": 18,
//     "old_price": 22
//   }