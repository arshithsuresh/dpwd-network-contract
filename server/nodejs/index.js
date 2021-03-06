const express = require('express');
const app = express();
const passport = require('passport');
const session = require('express-session');
const mongoose = require('mongoose');
const UserDetails = require('./models/userDetails');
const IPFS_Client = require('./ipfs/client');

/*
const multer = require('multer');
const multerStorage = multer.memoryStorage()
const upload = multer({storage:multerStorage})


const multerStorage = multer.diskStorage({
  destination: function(req,file,callback){
    callback(null,'./uploads')
  },
  filename: function(req,file,callback){
    req.fileData = file.stream
    callback(null, file.originalname)
  }
})
*/

require('dotenv').config();

const abcContractorData = require('./gateways/abccontractorgateway.json')
const xyzContractorData = require('./gateways/govtorggateway.json');
const publicOrgData = require('./gateways/publicorgstation1gateway.json');
const govtOrgData = require('./gateways/govtorggateway.json');

const HandleRoadChannelRequests = require('./api/channel/road/RoadChannel');
const LocationRequest = require('./api/Location/Location');
const AuthRequests = require('./api/auth/auth');
const AadhaarRequests = require('./api/aadhaar/index');

app.use(
    session({
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: true,
    })
  );

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());

passport.use(UserDetails.createStrategy());
passport.serializeUser(UserDetails.serializeUser());
passport.deserializeUser(UserDetails.deserializeUser());

// app.use("/api/test/",upload.single('image1'), IPFS_Client);

app.use('/api/auth/', AuthRequests);

app.use('/api/aadhaar/',AadhaarRequests);

app.use('/api/location',LocationRequest);

app.use('/api/channel/road', HandleRoadChannelRequests);

app.get('/config/contractor/abccontractor',(req, res)=>{
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(abcContractorData));
});
app.get('/config/contractor/xyzcontractor',(req, res)=>{
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(xyzContractorData));
});
app.get('/config/govtorg',(req, res)=>{
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(govtOrgData));
});
app.get('/config/publicorg/station1',(req, res)=>{
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(publicOrgData));
});

app.get('*',(req,res)=>{
    res.status(404);    
    res.json({message:"Invalid Request"});
})

mongoose.connect(process.env.MONGODB_URI, {
    dbName:"pwd_auth",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then((result)=>{
    const server =app.listen(3000, ()=>{
        const host = server.address().address;
        const port = server.address().port;
    
        console.log("Listening on : http://localhost/%s", host,port);
    });
  }).catch(err=>console.log(err));



