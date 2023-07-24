const mongoose = require('mongoose')
const UserSchema=new mongoose.Schema({
    name:{type:String,
    required:true
},
email:{
    type:String,
    required:true
},
password:{
    type:String,
    required:true
},
Date:{
    type: Date,
    Default: Date.now
}
})
const User = mongoose.model('User',UserSchema)
module.export=User