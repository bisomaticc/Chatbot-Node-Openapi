const express = require('express')
const router= express.Router()
const bcrypt = require('bcrypt')
const passport = require('passport')
const User= require('../models/User')
const {forwardAuthenticated, ensureAuthenticated} = require('../config/auth.js')
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey:"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",
  });
  const openai = new OpenAIApi(configuration);
  
router.get('/login',forwardAuthenticated,(req,res)=>
    res.render('login'))
router.get('/register',forwardAuthenticated,(req,res)=>{
    res.render('register')
})
router.post('/register',(req,res)=>{
    const {name,email,password,password2}=req.body;
    let errors=[];
    if(!name || !email || !password || !password2){
        errors.push({msg: 'enter all field'})
    }
    if(password!=password2){
        errors.push({msg:'pass missmatch'})
    }
    if(password.lenght<6){
        errors.push({msg: 'password should be longer then 6 characters'})
    }
    if(errors.lenght>0){
        res.render('register',{
            errors,name,email,password,password2
        })
    }else{
        User.findOne({email:email}).then(user=>{
            if(user){
                errors.push({msg:'Email already registered'})
                res.render('register',{
                    errors,name,email,password,password2
                })
            }else{
                const newUser = new User({
                    name,email,password
                })
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                      if (err) throw err;
                      newUser.password = hash;
                      newUser
                        .save()
                        .then(user => {
                          req.flash(
                            'success_msg',
                            'You are now registered and can log in'
                          );
                          res.redirect('/users/login');
                        })
                        .catch(err => console.log(err));
                    });

                })
            }
        })
    }
})
router.get("/chatbot",ensureAuthenticated,(req,res)=>{
    res.render("index.ejs", { data: null, error: null });
     })
router.post('/chatbot',ensureAuthenticated,(req,res)=>{
    start()
    async function start(){
        const response = await openai.createCompletion({
            model:"text-davinci-003",
            prompt:`I am a highly intelligent question answering bot. If you ask me a question that is rooted in truth, I will give you the answer. If you ask me a question that is nonsense, trickery, or has no clear answer, I will respond with "Unknown".\n\nQ: What is human life expectancy in the United States?\nA: Human life expectancy in the United States is 78 years.\n\nQ: Who was president of the United States in 1955?\nA: Dwight D. Eisenhower was president of the United States in 1955.\n\nQ: Which party did he belong to?\nA: He belonged to the Republican Party.\n\nQ: What is the square root of banana?\nA: Unknown\n\nQ: How does a telescope work?\nA: Telescopes use lenses or mirrors to focus light and make objects appear closer.\n\nQ: Where were the 1992 Olympics held?\nA: The 1992 Olympics were held in Barcelona, Spain.\n\nQ: How many squigs are in a bonk?\nA: Unknown\n\nQ: ${req.body.question}\nA:`,
            temperature: 0,
            max_tokens: 100,
            top_p: 1,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
            stop: ["\n"],
          });
          
      res.render("chatbot.ejs", {
        data: response.data.choices[0].text,
      });
  }
  

  
});
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/chatbot',
      failureRedirect: '/users/login',
      failureFlash: true
    })(req, res, next);
  });
  
  // Logout
  router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
  });
  
  module.exports = router;