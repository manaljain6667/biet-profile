// Require Modules
const path       = require('path');
const express    = require('express');
const session    = require('express-session');
const mongoose   = require('mongoose');
const morgan     = require('morgan');
const bodyParser = require('body-parser');
const flash      = require('connect-flash');
const passport   = require('passport');
const db=require('./config/keys').mongoURI;
const Resident = require('./models/resident');
const Guest = require('./models/guest');
const CompanyModel = require('./models/company');
var multer = require('multer');
var jwt = require('jsonwebtoken');

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}
function checkLoginUser(req,res,next){
  var userToken=localStorage.getItem('userToken');
  try {
    var decoded = jwt.verify(userToken, 'loginToken');
  } catch(err) {
    res.redirect('/');
  }
  next();
}

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads')
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now())
  }
});
var upload = multer({storage: storage}).single('file');

var urlencodedParser = bodyParser.urlencoded({ extended: false })

const app        = express();
const residentController = require('./controllers/resident/resident');

// Route Protection
const ensureUser = require('./middlewares/routeAuthentication');

// dotenv
require('dotenv').config({path: path.join(__dirname, ".env")});

// Pass Passport for configuration
require('./config/passport')(passport); 
mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Bind application-level middleware to an instance of the app object
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/static', express.static(path.join(__dirname, 'public')));

// NOTE: Express app.get('env') returns 'development' if NODE_ENV is not defined.
if (app.get('env') === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Required for Passport:
app.use(session({ 
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function(req,res,next){
  res.locals.currentUser=req.user;
  res.locals.error=req.flash("error");
  res.locals.success=req.flash("success");
  next();
});

app.get("/studentportal",checkLoginUser,(req,res)=>{
  Resident.find()
  .then((students)=>{
    res.render('pages/resident/studentportal.ejs', {students: students})
  })
  .catch((err)=>{
    console.log(err)
  })  
})
app.get("/studentit3portal",checkLoginUser,(req,res)=>{
  Resident.find({branch:"IT"})
  .then((students)=>{
    res.render('pages/resident/studentportal.ejs', {students: students})
  })
  .catch((err)=>{
    console.log(err)
  })  
})

app.get("/studentcs3portal",checkLoginUser,(req,res)=>{
  Resident.find({branch:"CSE"})
  .then((students)=>{
    res.render('pages/resident/studentportal.ejs', {students: students})
  })
  .catch((err)=>{
    console.log(err)
  })  
})
/************************filter records**************************/
app.post('/search',function(req,res,next){
  // console.log(req.body.email) 
  var flrtName = req.body.fltrname;
  var year = req.body.fltremail;
  var branch = req.body.fltremptype;
  if(flrtName !='' && year !='' && branch !='' )
  {
      //ek "$and" mai do hi parameters aa sakte hai isliye do "$and" lage hai teen parameters ke liye
      var flterParameter={ $and:[{ firstName:flrtName},
     {$and:[{year:year},{branch:branch}]}
     ]
      }
     }else if(flrtName !='' && year =='' && branch !=''){
       var flterParameter={ $and:[{ firstName:flrtName},{branch:branch}]
          }
     }else if(flrtName =='' && year !='' && branch !=''){
   
       var flterParameter={ $and:[{ year:year},{branch:branch}]
          }
     }else if(flrtName =='' && year =='' && branch !=''){
   
       var flterParameter={branch:branch}
     }else{
       var flterParameter={}
     }  
     console.log(flterParameter)
     var employeeFilter =Resident.find(flterParameter);
     employeeFilter.exec(function(err,students){
         if(err) throw err;
         res.render('pages/resident/studentportal.ejs', {students: students ,success:''});
           });
})
//************************filter records**************************//
app.get("/alumniiportal",checkLoginUser,(req,res)=>{
  Guest.find({})
  .then((alumnii)=>{
    res.render('pages/guest/alumniiportal.ejs', {alumnii: alumnii})
  })
  .catch((err)=>{
    console.log(err)
  })   
})                                                                   
app.get("/studentprofile",checkLoginUser,(req,res)=>{
  var id = req.query['id'];
  Resident.find({_id:id}) 
  .then((profile)=>{
    res.render('pages/resident/studentprofile.ejs', {profile:profile})
  })
  .catch((err)=>{
    console.log(err)
  })  
})
app.get("/alumniiprofile",checkLoginUser,(req,res)=>{
  var id = req.query['id'];
  Guest.find({_id:id})
  .then((profile)=>{
    res.render('pages/guest/alumniiprofile.ejs', {profile:profile})
  })
  .catch((err)=>{
    console.log(err)
  })  
})
var data=CompanyModel.find({});
app.get("/company",checkLoginUser,(req,res)=>{

  data.exec(function(err,data){
    if(err) throw err;
    res.render('pages/guest/company.ejs',{records:data});
  })
})
app.get("/reviews",checkLoginUser,(req,res)=>{
  data.exec(function(err,data){
    if(err) throw err;
    res.render('pages/resident/company.ejs',{records:data});
  })
})

app.post("/comp",(req,res)=>{
  var company=new CompanyModel({
    username:req.body.username,
    company:req.body.companyname,
    review:req.body.review,
 })
 var uname=CompanyModel.find({'username':username});
 if(uname == null){
  company.save(function(err,doc){
    if(err) throw err;
    data.exec(function(err,data){
      if(err) throw err;
      res.render('pages/guest/company.ejs',{records:data});
    })
  })
 }
 else{
  data.exec(function(err,data){
    if(err) throw err;
    res.render('pages/guest/company.ejs',{records:data});
  })
 }

})
 
app.get("/studentupdate",checkLoginUser,ensureUser.isResident,(req,res)=>{
  var id = req.query['id'];
  Resident.find({_id:id})
  .then((profile)=>{
    res.render('pages/resident/studentupdate.ejs', {profile:profile})
  })
  .catch((err)=>{
    console.log(err)
  })  
})
app.get("/guestupdate",checkLoginUser,ensureUser.isGuest,(req,res)=>{
  var id = req.query['id'];
  Guest.find({_id:id})
  .then((profile)=>{
    res.render('pages/guest/alumniiupdate.ejs', {profile:profile})
  })
  .catch((err)=>{
    console.log(err)
  })  
})
var employee=Resident.find({});
app.post("/residentupdate",upload,ensureUser.isResident,(req,res)=>{
  var resident={
          firstName : req.body.first_name,
          lastName : req.body.last_name,
          roll:req.body.roll,
          contact:req.body.contact,
          branch:req.body.branch,
          year:req.body.year,
          skills:req.body.skills,
          github:req.body.github,
          image:req.file.filename,
  }
  var update=Resident.findByIdAndUpdate(req.body.id,resident);
  update.exec(function(err,data){
    if(err) throw err;
      res.redirect('/resident/');
     });
      });
var employee=Guest.find({});
app.post("/alumniiupdate",upload,ensureUser.isGuest,(req,res)=>{
  
      var guest={
          firstName : req.body.first_name,
          lastName : req.body.last_name,
          roll:req.body.roll,
          contact:req.body.contact,
          branch:req.body.branch,
          year:req.body.year,
          company:req.body.company,
          skills:req.body.skills,
          github:req.body.github,
          image:req.file.filename,}
  var update=Guest.findByIdAndUpdate(req.body.id,guest);
  update.exec(function(err,data){
    if(err) throw err;
      res.redirect('/guest/');
     });
    })
//app.get('/studentupdate', ensureUser.isResident, residentController.index1);

app.use('/', require('./routes'));

const port = process.env.PORT || 3001; // CONFIRM: configure this to read from $PORT
app.listen(port, () => {
  console.log(`SafeGate server running on http://localhost:${port}/`);
});

// var id = req.query['id'];
  // Guest.find({_id:id})
  // .then((profile)=>{
  //   res.render('pages/guest/alumniiprofile.ejs', {profile:profile})
  // })
  // .catch((err)=>{
  //   console.log(err)
  // })   