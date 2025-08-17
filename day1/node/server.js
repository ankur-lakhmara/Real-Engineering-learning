const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

const multer= require('multer');

const uploadDir = path.join(__dirname,'uploads');
if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

//configure storage
const storage = multer.diskStorage({
    destination: function (req,res,cb){
        cb(null,uploadDir);
    },
    filename: function (req,file,cb){
        cb(null,Date.now()+"-" + file.originalname);
    }
});


const upload = multer({storage:storage});


app.get('/',(req,res)=>{
    res.send('hello world');
})

app.post('/upload', upload.single('avatar'), function (req,res,next){
    console.log(req.file);
    res.send('Upload success, file stored in ./uploads/');
})

app.listen((8080),()=>{
    console.log('server is running on port 8080');
});