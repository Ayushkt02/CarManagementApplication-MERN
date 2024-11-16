import express from 'express'
import mongoose from 'mongoose';
import 'dotenv/config'
import bcrypt from 'bcrypt'
import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import admin from "firebase-admin"

import User from './Schema/User.js'
import Car from './Schema/Car.js'


const server = express();
let PORT = 3000;

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

server.use(express.json())
server.use(cors());

mongoose.connect(process.env.DB_LOCATION, {
    autoIndex: true
})

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    if(token == null){
        return res.status(401).json({ error: "No access token" });
    }
    
    jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
        if(err){
            return res.status(403).json({ error: "Access token is invalid" })
        }
        req.user = user.id;
        next();
    })
}

const formatDatatoSend = (user) => {

    const access_token = jwt.sign({ id: user._id }, process.env.SECRET_ACCESS_KEY)

    return {
        access_token,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname
    }
}

const generateUsername = async (email) => {
    let username = email.split("@")[0];
    let isUsernameUnique = await User.exists({"personal_info.username": username}).then((res) => res)

    isUsernameUnique ? username+= nanoid().substring(0, 5) : "";
    return username;
}

server.post("/signup", (req, res) => {
    let { fullname, email, password } = req.body;

    if(fullname.length < 3){
        return res.status(403).json({ "error" : "FullName must be atleast 3 letters long" })
    }
    if(email.length==0){
        return res.status(403).json({ "error": "Enter Email" })
    }
    if(!emailRegex.test(email)){
        return res.status(403).json({ "error": "Email is invalid"})
    }
    if(!passwordRegex.test(password)){
        return res.status(403).json({ "error": "password should be 6 to 20 character long with a numeric, 1 lowercase and 1 uppercase"})
    }
    bcrypt.hash(password, 10, async (err, hashed_password)=>{
        let username = await generateUsername(email);

        let user = new User({
            personal_info: { fullname, email, password: hashed_password, username }
        })
        user.save().then((u) => {
            return res.status(200).json(formatDatatoSend(u));
        })
        .catch((err) => {
            if(err.code == 11000){
                return res.status(500).json({"error": "Email already exists"});
            }
            return res.status(500).json({"error": err.message})
        })
    })
    // return res.status(200).json( { "status" : "okay" } )
})

server.post("/signin", (req, res)=>{
    let { email, password } = req.body;

    User.findOne({ "personal_info.email": email })
    .then((user) => {
        if(!user){
            return res.status(403).json({ "error": "email not found" })
        }

        bcrypt.compare(password, user.personal_info.password, (err, result) => {
            if(err){
                return res.status(403).json({ "error": "Error occured while login please try again" })
            }

            if(!result){
                return res.status(403).json({ "error": "incorrect password" })
            }else{
                return res.status(200).json(formatDatatoSend(user));
            }
        })


        
        // return res.json({ "status": "got user document" })
    })
    .catch((err)=>{
        console.log(err.message);
        return res.status(500).json({ "error": err.message })
    })
})

server.post('/create-car', verifyJWT, (req, res) => {
    let authorId = req.user;

    let { title, banner, tags, content, id } = req.body;
    if(!title.length){
        return res.status(403).json({ error: "You must provide a title" });
    }

        if(!banner.length){
            return res.status(403).json({ error: "You must provide a car banner to publish it" });
        }
    
        if(!content.length){
            return res.status(403).json({ error: "There must be some car description to publish it" });
        }
    
        if(!tags.length || tags.length>10){
            return res.status(403).json({ error: "Provide tags in order to publish the car, Maximum 10" })
        }



    tags = tags.map(tag => tag.toLowerCase());

    let car_id = id || title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, "-").trim() + nanoid();

    if(id){
        console.log(id)
        Car.findOneAndUpdate({ car_id }, { title, banner, content, tags})
        .then(() => {
            return res.status(200).json({ id: car_id });
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
    }else{
        let car = new Car({
            title, banner, content, tags, author: authorId, car_id
        })
    
        car.save().then(car => {
            let incrementVal = 1;
    
            User.findOneAndUpdate({ _id: authorId }, { $inc: { "account_info.total_posts": incrementVal }, $push: { "cars": car._id } })
            .then(user => {
                return res.status(200).json({ id: car.car_id });
            }) 
            .catch(err => {
                return res.status(500).json({ error: "Failed to update total post number" });
            })
        })
        .catch(err => {
            return res.status(500).json({ error: err.message });
        })
    }
})

server.post('/latest-cars', (req, res) => {
    let { page } = req.body;
    let maxLimit = 5;

    Car.find()
    .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort({ "publishedAt": -1 })
    .select("car_id content title banner activity tags publishedAt -_id")
    .skip((page-1)*maxLimit)
    .limit(maxLimit)
    .then(cars => {
        return res.status(200).json({ cars });
    })
    .catch(err => {
        return res.status(500).json({ error: err.message });
    })
})

server.post('/all-latest-cars-count', (req, res) => {
    Car.countDocuments()
    .then(count => {
        return res.status(200).json({ totalDocs: count });
    })
    .catch(err => {
        console.log(err.message);
        return res.status(500).json({ error: err.message })
    })
})

server.post("/search-cars", (req, res) => {
    let { tag, query, author, page, limit, eliminate_car } = req.body;
    let findQuery;

    if(tag){
        findQuery = { tags: tag, car_id: { $ne: eliminate_car } };
    }else if(query){
        findQuery = { title: new RegExp(query, 'i') };
    }else if(author){
        findQuery = { author}
    }
    let maxLimit = limit ? limit : 2;
    

    Car.find(findQuery)
    .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort({ "publishedAt": -1 })
    .select("car_id title content banner tags publishedAt -_id")
    .skip((page-1)*maxLimit)
    .limit(maxLimit)
    .then(cars => {
        return res.status(200).json({ cars });
    })
    .catch(err => {
        return res.status(500).json({ error: err.message });
    })
})

server.post('/search-cars-count', (req, res) => {
    let { tag, author, query } = req.body;

    let findQuery;

    if(tag){
        findQuery = { tags: tag };
    }else if(query){
        findQuery = { title: new RegExp(query, 'i') };
    }else if(author){
        findQuery = { author}
    }

    Car.countDocuments(findQuery)
    .then(count => {
        return res.status(200).json({ totalDocs: count });
    })
    .catch(err => {
        console.log(err.message);
        return res.status(500).json({ error: err.message })
    })
    
})

server.post("/user-added-cars", verifyJWT, (req, res) => {
    let user_id = req.user;

    let  { page, query, deletedDocCount } = req.body;

    let maxLimit = 5;

    let skipDocs = (page-1)*maxLimit;

    if(deletedDocCount){
        skipDocs-=deletedDocCount;
    }

    Car.find({ author: user_id, title: new RegExp(query, 'i') })
    .skip(skipDocs)
    .limit(maxLimit)
    .sort({ publishedAt: -1 })
    .select(" title banner publishedAt car_id content -_id ")
    .then(cars => {
        return res.status(200).json({ cars });
    })
    .catch(err => {
        return res.status(500).json({ error: err.message });
    })
})

server.post("/user-added-cars-count", verifyJWT, (req, res) => {
    let user_id = req.user;
    let{ query } = req.body;

    Car.countDocuments({ author: user_id, title: new RegExp(query, 'i') })
    .then(count => {
        return res.status(200).json({ totalDocs: count });
    })
    .catch(err => {
        console.log(err.message);
        return res.status(500).json({ error: err.message });
    })
})

server.post("/delete-car", verifyJWT, (req, res) => {
    let user_id = req.user;
    let { car_id } = req.body;

    Car.findOneAndDelete({ car_id })
    .then(car => {
        User.findOneAndUpdate({ _id: user_id }, { $pull: { car:car._id }, $inc: {"account_info.total_posts": -1 } })
        .then(user => console.log('car deleted'));

        return res.status(200).json({ status: 'done' });
    })
    .catch(err => {
        console.log(err.message);
        return res.status(500).json({ error: err.message });
    })
})

// server.post("/get-car", (req, res) => {
//     let { car_id, mode } = req.body;
//     Car.findOneAndUpdate({ car_id })
//     .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img")
//     .select("title content banner publishedAt car_id tags")
//     .then(car => {
//         return res.status(200).json({ car });
//     })
//     .catch(err => {
//         return res.status(500).json({error: err.message})
//     })
// })

server.post("/get-car", async (req, res) => {
    try {
        const { car_id } = req.body;

        if (!car_id) {
            return res.status(400).json({ error: "car_id is required" });
        }

        const car = await Car.findOne({ car_id })
            .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img")
            .select("title content banner publishedAt car_id tags");

        if (!car) {
            return res.status(404).json({ error: "Car not found" });
        }

        return res.status(200).json({ car });
    } catch (err) {
        console.error("Error in /get-car:", err); // Log for debugging
        return res.status(500).json({ error: err.message });
    }
});




server.listen(PORT, () => {
    console.log('listening on port => ' + PORT);
})