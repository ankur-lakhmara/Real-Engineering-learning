const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
require('dotenv').config();

//implementing redis
const {createClient} = require('redis');
const {v4: uuidv4} = require('uuid');
const redisClient = createClient();
redisClient.connect();



const S3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});


const multer= require('multer');

const uploadDir = path.join(__dirname,'uploads');
if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

//configure storage
const storage = multer.memoryStorage();

const upload = multer({storage});


app.get('/',(req,res)=>{
    res.send('hello world');
})

app.post('/upload', upload.single('avatar'), async function (req, res, next) {
    const file = req.file;
    console.log(req.file);
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: Date.now() + '-' + file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype
    }

    try {
        console.log(S3);
        const data = await S3.upload(params).promise();
        res.json({
            message: 'Upload success',
            s3Url: data.Location,
            key: data.key,
            fileName: file.originalname,
            size: file.size,
            type: file.mimeType,
            uploadedAt: new Date()
        });
    } catch (e) {
        console.log(e);
    }
})

app.listen((8080),()=>{
    console.log('server is running on port 8080');
});