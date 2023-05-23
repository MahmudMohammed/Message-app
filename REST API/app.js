const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const cors = require('cors');

require('dotenv').config();

const app = express();

app.use(cors());

const fileStorage = multer.diskStorage({
    destination: (req, file , cb) => {
        cb(null , 'images')
    },

    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + file.originalname)
    }
});

const fileFilter = (req, file, cb) => {
    if(
        file.mimetype === 'image/png'  || 
        file.mimetype === 'image/jpeg' || 
        file.mimetype === 'image/jpg'
    ) {
        cb(null, true);
    }else{
        cb(null, false);
    }
};

// app.use((req , res , next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PATCH , PUT , DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type , Authorization');
//     next();
// }); 

app.use(bodyParser.json());

app.use(multer({ storage: fileStorage , fileFilter: fileFilter}).single('image'));

app.use('/images', express.static(path.join(__dirname , 'images')));

app.use('/feed' , feedRoutes);

app.use('/auth' , authRoutes);

app.use((error , req , res , next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message , data: data });
})

mongoose
    .connect(process.env.DATABASE_URL)
    .then(result => {
        const server = app.listen(8080);
        // const io = require('./socket').init(server);
        // io.on('connection', socket => {
        //   console.log('Client connected');
        // });
      })
      .catch(err => console.log(err));
    
