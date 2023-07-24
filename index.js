const express= require('express');
const app = express()
const mongoose= require('mongoose')
// const mongoclient = require("mongodb").MongoClient;
const bodyparser=require("body-parser")
// const { Configuration, OpenAIApi } = require("openai");
const passport = require('passport')
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session')
const flash = require('connect-flash');

app.use(expressLayouts)
app.use(express.urlencoded({extended :true}))
require('./config/passport')(passport);


// const configuration = new Configuration({
//   apiKey:"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",
// });

const db = require('./config/keys').mongoURI;
    app.set("view engine","ejs")
    
    mongoose
  .connect(
    db,
    { useNewUrlParser: true ,useUnifiedTopology: true}
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));
    // Express session
app.use(
    session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true
    })
  );
  app.use(passport.initialize());
app.use(passport.session());
  app.use(flash());
  // Global variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
  });
  app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));  
    
const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on  ${PORT}`));

    