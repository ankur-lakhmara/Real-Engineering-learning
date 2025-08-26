const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
require('dotenv').config();


//implementing redis
const {createClient} = require('redis');
const {v4: uuidv4} = require('uuid');
const fileId = uuidv4();
const redisClient = createClient();
// redisClient.connect();

const metadataStore = {};
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
    // console.log(req.file);
    const params = {
        Bucket: process.env.S3_BUCKET,
        Key: Date.now() + '-' + file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype
    }

    try {
        // console.log(S3);
        const data = await S3.upload(params).promise();
         metadataStore[fileId] = {
            id: fileId,
            s3Url : data.Location,
            key : data.Key,
            fileName : file.originalname,
            size : file.size,
            type : file.mimeType,
            uploadedAt : new Date().toISOString(),

        }
        // console.log(metadataStore);
        res.json(metadataStore[fileId]);
    } catch (e) {
        console.log(e);
    }
});

app.get('/files/:id',(req,res)=>{
    const {id} = req.params;
    const metadata = metadataStore[id];
    if(metadata){
        return res.json(metadata);
    }
    return res.status(404).json({error: 'file not found'});
})

app.listen((8080),()=>{
    console.log('server is running on port 8080');
});