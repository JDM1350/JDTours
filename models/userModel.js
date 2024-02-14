const mongoose=require('mongoose');
const validator=require('validator');
const bcrypt=require('bcryptjs');
const crypto=require('crypto')
const userSchema= new mongoose.Schema({
    name:{
        type:String,
        required:[true,'please tell us your name ']
    },
    email:{
        type:String,
        required:[true,'please provide your email'],
       unique:true,
       lowercase:true,
       validate:[validator.isEmail,'please provide valid email']

    },
    photo:{
        type:String,
        default:'default.jpg'
    },
    role:{
        type:String,
        default:'user',
        enum:['user','guide','lead-guide','admin']
        
      },
    password:{
        type:String,
        required:[true,'please provide password '],
        minlength:8
    },
    passwordConfirm:{
        type:String,
        required:[true,'please confirm your password '],
        validate:{
            validator:function(el){
                return el==this.password;
                // abc === abc  true 
            },
            message:'not coreect password '
        }

    },
    passwordChangedAt:{
        type:Date
    },

   
    passwordRestToken:{
        type:String
    },
    passwordResetExpires:{
        type:Date
    },
    active:{
        type:Boolean,
        default:true,
        select:false
    }
    

});

userSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next();
   this.password= await bcrypt.hash(this.password,12)

   this.passwordConfirm= undefined;
   next();


})

userSchema.pre(/^find/,function(next){

    //thispooints to curretn query 
    this.find({active:{$ne:false}});
    next();
    })
userSchema.methods.changedPasswordAfter=function(JWTTimestamp){
    if(this.passwordChangedAt){

        const changedTimeStap=parseInt(this.passwordChangedAt.getTime()/1000,10);
        console.log(changedTimeStap,JWTTimestamp);
       return JWTTimestamp<changedTimeStap;// eg 100<200 
    }

    //false means not changed 
    return false;

}



userSchema.methods.createPasswordResetToken= function(){

    const resetToken=crypto.randomBytes(32).toString('hex');

   this.passwordRestToken=  crypto.createHash('sha256').update(resetToken).digest('hex');

   console.log({resetToken},this.passwordRestToken);
   this.passwordResetExpires=Date.now()+10* 60*1000;

   return resetToken;

   

} 
userSchema.pre('save',function(next){
    if(!this.isModified('password')|| this.isNew) return next();

    this.passwordChangedAt=Date.now() - 1000;
    next();

});

userSchema.methods.correctPassword = async function(
    candidatePassword,
    userPassword
  ) {
    return await bcrypt.compare(candidatePassword, userPassword);
  };




const User=mongoose.model('User',userSchema);

module.exports=User;