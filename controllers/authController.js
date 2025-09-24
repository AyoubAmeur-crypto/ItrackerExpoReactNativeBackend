const User = require('../models/User')
const jwt = require("jsonwebtoken")
const OtpCode = require("../models/OtpCode")
const nodemailer = require("nodemailer")
const bcrypt = require("bcrypt")
exports.signUp = async (req,res)=>{

    try {

            const {firstName,lastName,email,password}=req.body

             const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
             const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

             const checkMail = await User.findOne({email:email})

             if(checkMail){

                return res.status(400).json({

                    success:false,
                    error:"Email Already Exist ,Try Another One"
                })
             }

             if(!regex.test(email)){

                return res.status(400).json({

                    success:false,
                    error:'Enter A Valid Email!'
                })
             }

            if(!strongPasswordRegex.test(password)){

                return res.status(400).json({

                    success:false,
                    error:"Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"

                })
             }

             const hashedPassword = await bcrypt.hash(password,10)

             const Newuser = await User.create({

                firstName:firstName,
                lastName:lastName,
                email:email,
                password:hashedPassword,
                
             })
            const token = jwt.sign({
            id: Newuser._id.toString(), 
            firstName: Newuser.firstName,
            lastName: Newuser.lastName,
            email: Newuser.email,
            isVerified: Newuser.isVerified,
            expenses: Newuser.expenses,
            plan: Newuser.plan,
            loginHistory: Newuser.loginHistory
        }, process.env.SESSION_KEY, {expiresIn:'1d'})

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            maxAge: 24 * 60 * 60 * 1000,
            path: '/',
        });

res.status(201).json({

    success:true,
    message:'Congrats! Account Has Been Created Successfuly'
})
        
    } catch (error) {

        console.log("can't create the account for tis user due to this",error);

        res.status(500).json({

            success:false,
            error:"Can't Create Account for the moment please try again"
        })
        
        
    }
}

exports.login = async (req,res)=>{

    try {

            const {email,password}=req.body

             const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

             const checkMail = await User.findOne({email:email}).select('+password')

             if(!checkMail){

                return res.status(400).json({

                    success:false,
                    error:"User Not Exist!"
                })
             }

             if(!regex.test(email)){

                return res.status(400).json({

                    success:false,
                    error:'Enter A Valid Email!'
                })
             }

             const checkPasswordTest = await bcrypt.compare(password,checkMail.password)

             if(!checkPasswordTest){

                return res.status(400).json({

                    success:false,
                    error:"password doesn't match"
                })

             }            

           
             const token = jwt.sign({
            id: checkMail._id.toString(), // ✅ Convert ObjectId to string
            firstName: checkMail.firstName,
            lastName: checkMail.lastName,
            email: checkMail.email,
            isVerified: checkMail.isVerified,
            expenses: checkMail.expenses,
            plan: checkMail.plan,
            loginHistory: checkMail.loginHistory
        }, process.env.SESSION_KEY, {expiresIn:'1d'})

        // ✅ Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            maxAge: 24 * 60 * 60 * 1000,
            path: '/',
        });
res.status(200).json({

    success:true,
    message:'User Has Been Logeed Successfuly',
    token:token
})
        
    } catch (error) {

        console.log("can't loging to this account sue to this",error);

        res.status(500).json({

            success:false,
            error:"Can't login to this account please try again later"
        })
        
        
    }
}

exports.logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            path: '/',
        });

        if (req.session) {
            req.session.destroy((err) => {
                if (err) {
                    console.log("Session destruction error:", err);
                    return res.status(500).json({
                        success: false,
                        error: "Could not log out, please try again"
                    });
                }
            });
        }

        res.status(200).json({
            success: true,
            message: 'User has been logged out successfully'
        });
        
    } catch (error) {
        console.log("Logout error:", error);
        res.status(500).json({
            success: false,
            error: "Logout failed, please try again later"
        });
    }
};


exports.sendOtp = async (req,res)=>{

     try {

       const user = req.user


        const checkUser = await User.findOne({email:user.email})

      

        if(!checkUser){

            return res.status(404).json({message:"User Not Found!"})
        }
        
     
        
const otpGenerated = Math.floor(10000 + Math.random() * 90000).toString()

        const Hashedotp = await bcrypt.hash(otpGenerated,10)

        await OtpCode.deleteMany({email:checkUser.email})

        await OtpCode.create({
            email:checkUser.email.trim().toLowerCase(),
            otpHash:Hashedotp,


        })


const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.EMAIL_PASS, 
    },
    tls: {
        rejectUnauthorized: false
    }
})



     

  console.log("check otp genrated",otpGenerated);
  console.log("the email sent",checkUser.email);
  console.log("check the sender : ",process.env.EMAIL_SENDER);
  
  
  

   await transporter.sendMail({
    from: '"iTracker Support" <Itracker-Support@aybhub.dev>', 
    replyTo: 'Itracker-Support@aybhub.dev', 
    to: checkUser.email,
    subject: 'Your iTracker Verification Code',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body {
      background-color: #f3f3f3;
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
    }
    
    .container {
      background-color: #ffffff;
      margin: 0 auto;
      padding: 0;
      border-radius: 20px;
      max-width: 480px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    
    .header {
      background-color: #FA9F3A;
      padding: 40px 20px;
      text-align: center;
    }
    
    .logo {
      color: white;
      font-size: 32px;
      font-weight: 700;
      margin: 0;
      letter-spacing: -1px;
    }
    
    .subtitle {
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
      margin: 8px 0 0 0;
      font-weight: 400;
    }
    
    .content {
      padding: 40px 30px;
      text-align: center;
    }
    
    .greeting {
      color: #333;
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    
    .message {
      color: #666;
      font-size: 16px;
      margin-bottom: 32px;
      line-height: 1.5;
    }
    
    .otp-section {
      background-color: #FA9F3A;
      padding: 24px;
      border-radius: 16px;
      margin: 24px 0;
    }
    
    .otp-label {
      color: white;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .otp-code {
      background-color: rgba(255, 255, 255, 0.2);
      border: 2px solid rgba(255, 255, 255, 0.3);
      color: white;
      font-size: 36px;
      font-weight: 700;
      text-align: center;
      padding: 16px;
      border-radius: 12px;
      letter-spacing: 8px;
      font-family: 'Monaco', 'Courier New', monospace;
    }
    
    .expiry {
      background-color: #fff3e0;
      border: 1px solid #ffb74d;
      color: #e65100;
      padding: 12px 16px;
      border-radius: 8px;
      margin: 24px 0;
      font-size: 14px;
      font-weight: 500;
    }
    
    .footer {
      background-color: #f8f8f8;
      text-align: center;
      font-size: 12px;
      color: #999;
      padding: 24px;
    }
    
    .footer-brand {
      color: #FA9F3A;
      font-weight: 600;
    }
    
    @media (max-width: 600px) {
      .container {
        margin: 10px;
        border-radius: 16px;
      }
      
      .header {
        padding: 32px 20px;
      }
      
      .content {
        padding: 32px 20px;
      }
      
      .otp-code {
        font-size: 28px;
        letter-spacing: 6px;
      }
    }
  </style>
</head>
<body>

<div class="container">
  <div class="header">
    <h1 class="logo">iTracker</h1>
    <p class="subtitle">Smart Expense Tracking</p>
  </div>
  
  <div class="content">
    <h2 class="greeting">Verify Your Account</h2>
    
    <p class="message">
      Enter the verification code below to complete your account verification:
    </p>
    
    <div class="otp-section">
      <div class="otp-label">Verification Code</div>
      <div class="otp-code">${otpGenerated}</div>
    </div>
    
    <div class="expiry">
      ⏰ This code expires in <strong>5 minutes</strong>
    </div>
    
    <p style="color: #999; font-size: 14px; margin-top: 32px;">
      If you didn't request this code, please ignore this email.
    </p>
  </div>
  
  <div class="footer">
    <p>© 2025 <span class="footer-brand">iTracker</span> - Track Your Expenses Smartly</p>
  </div>
</div>

</body>
</html>
    `
})

  res.status(201).json({
    success:true,
    message:`Otp has been sent to ${checkUser.email}`})
        
    } catch (error) {

        console.log("Internal error due tot this",error);
        res.status(500).json({

            success:false,
            error:"can't send an otp now please try again"
        })
        
        
    }
}

exports.verifyEmailCheck = async (req,res)=>{


  try {
    const {email}=req.body

    if(!email){

      return res.status(400).json({

        success:false,
        error:"Must Required An Email to Procced"
      })


    }

    const checkUser = await User.findOne({email:email})

    if(!checkUser){

      return res.status(404).json({

        success:false,
        error:"Can't fifn this user"
      })
    }


    res.status(200).json({
      success:true,
      message:"Email Has Been Verified Successfuly"
    })


  } catch (error) {

    console.log("can't check if the the emial exist due to this",error);

    res.status(500).json({

      success:false,
      error:"Can't check this email for the moment please try again"
    })
    
    
  }
}

exports.sendOtpForPassword = async (req,res)=>{

     try {

       const {email} = req.body


        const checkUser = await User.findOne({email:email})

      

        if(!checkUser){

            return res.status(404).json({message:"User Not Found!"})
        }
        
     
        
const otpGenerated = Math.floor(10000 + Math.random() * 90000).toString()

        const Hashedotp = await bcrypt.hash(otpGenerated,10)

        await OtpCode.deleteMany({email:checkUser.email})

        await OtpCode.create({
            email:checkUser.email.trim().toLowerCase(),
            otpHash:Hashedotp,


        })


const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.EMAIL_PASS, 
    },
    tls: {
        rejectUnauthorized: false
    }
})



     

  console.log("check otp genrated",otpGenerated);
  console.log("the email sent",checkUser.email);
  console.log("check the sender : ",process.env.EMAIL_SENDER);
  
  
  

   await transporter.sendMail({
    from: '"iTracker Support" <Itracker-Support@aybhub.dev>', 
    replyTo: 'Itracker-Support@aybhub.dev', 
    to: checkUser.email,
    subject: 'Your iTracker Verification Code',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body {
      background-color: #f3f3f3;
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
    }
    
    .container {
      background-color: #ffffff;
      margin: 0 auto;
      padding: 0;
      border-radius: 20px;
      max-width: 480px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    
    .header {
      background-color: #FA9F3A;
      padding: 40px 20px;
      text-align: center;
    }
    
    .logo {
      color: white;
      font-size: 32px;
      font-weight: 700;
      margin: 0;
      letter-spacing: -1px;
    }
    
    .subtitle {
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
      margin: 8px 0 0 0;
      font-weight: 400;
    }
    
    .content {
      padding: 40px 30px;
      text-align: center;
    }
    
    .greeting {
      color: #333;
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    
    .message {
      color: #666;
      font-size: 16px;
      margin-bottom: 32px;
      line-height: 1.5;
    }
    
    .otp-section {
      background-color: #FA9F3A;
      padding: 24px;
      border-radius: 16px;
      margin: 24px 0;
    }
    
    .otp-label {
      color: white;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .otp-code {
      background-color: rgba(255, 255, 255, 0.2);
      border: 2px solid rgba(255, 255, 255, 0.3);
      color: white;
      font-size: 36px;
      font-weight: 700;
      text-align: center;
      padding: 16px;
      border-radius: 12px;
      letter-spacing: 8px;
      font-family: 'Monaco', 'Courier New', monospace;
    }
    
    .expiry {
      background-color: #fff3e0;
      border: 1px solid #ffb74d;
      color: #e65100;
      padding: 12px 16px;
      border-radius: 8px;
      margin: 24px 0;
      font-size: 14px;
      font-weight: 500;
    }
    
    .footer {
      background-color: #f8f8f8;
      text-align: center;
      font-size: 12px;
      color: #999;
      padding: 24px;
    }
    
    .footer-brand {
      color: #FA9F3A;
      font-weight: 600;
    }
    
    @media (max-width: 600px) {
      .container {
        margin: 10px;
        border-radius: 16px;
      }
      
      .header {
        padding: 32px 20px;
      }
      
      .content {
        padding: 32px 20px;
      }
      
      .otp-code {
        font-size: 28px;
        letter-spacing: 6px;
      }
    }
  </style>
</head>
<body>

<div class="container">
  <div class="header">
    <h1 class="logo">iTracker</h1>
    <p class="subtitle">Smart Expense Tracking</p>
  </div>
  
  <div class="content">
    <h2 class="greeting">Reset Your Password</h2>
    
    <p class="message">
      Enter the verification code below to complete your Pssword Reset Process:
    </p>
    
    <div class="otp-section">
      <div class="otp-label">Verification Code</div>
      <div class="otp-code">${otpGenerated}</div>
    </div>
    
    <div class="expiry">
      ⏰ This code expires in <strong>5 minutes</strong>
    </div>
    
    <p style="color: #999; font-size: 14px; margin-top: 32px;">
      If you didn't request this code, please ignore this email.
    </p>
  </div>
  
  <div class="footer">
    <p>© 2025 <span class="footer-brand">iTracker</span> - Track Your Expenses Smartly</p>
  </div>
</div>

</body>
</html>
    `
})

  res.status(201).json({
    success:true,
    message:`Otp has been sent to ${checkUser.email}`})
        
    } catch (error) {

        console.log("Internal error due tot this",error);
        res.status(500).json({

            success:false,
            error:"can't send an otp now please try again"
        })
        
        
    }
}

exports.verifyOtpPassword = async (req,res)=>{


   try {
    const {code,email} = req.body



    

    const checkOtp = await OtpCode.findOne({email: email.trim().toLowerCase()})
     if(!checkOtp) {
      return res.status(404).json({message: "OTP not found or expired. Please request a new code."});
    }

    if(!code) {
      return res.status(404).json({message: "Enter The Otp Code!"})
    }

 

    const realCode = Array.isArray(code) ? code.join('') : code

    const verifyotp = await bcrypt.compare(realCode, checkOtp.otpHash)

    if(!verifyotp) {
      return res.status(401).json({message: 'OTP Incorrect Or Expired. Please Try Again!'})
    }

    await OtpCode.deleteOne({email:email})

    res.status(200).json({
      success:true,
      message:"Otp Approved"
    })
  } catch (error) {
    console.log("Can't verify OTP due to this", error);
    return res.status(500).json({message: "Internal Server Error Please Try Again"})
  }
}

exports.verifyOtp = async (req,res)=>{


   try {
    const {code} = req.body

    const user = req.user


    if(!user.id){

      return res.status(400).json({
        success:false,
        error:"Must equired A valid Id"
      })
    }

    const checkOtp = await OtpCode.findOne({email: user.email.trim().toLowerCase()})
     if(!checkOtp) {
      return res.status(404).json({message: "OTP not found or expired. Please request a new code."});
    }

    if(!code) {
      return res.status(404).json({message: "Enter The Otp Code!"})
    }

 

    const realCode = Array.isArray(code) ? code.join('') : code

    const verifyotp = await bcrypt.compare(realCode, checkOtp.otpHash)

    if(!verifyotp) {
      return res.status(401).json({message: 'OTP Incorrect Or Expired. Please Try Again!'})
    }

    await OtpCode.deleteOne({email: user.email})

   const wantedUser =  await User.findByIdAndUpdate(user.id,{isVerified:true},{new:true})

      const token = jwt.sign({
            id: wantedUser._id.toString(), 
            firstName: wantedUser.firstName,
            lastName: wantedUser.lastName,
            email: wantedUser.email,
            isVerified: wantedUser.isVerified,
            expenses: wantedUser.expenses,
            plan: wantedUser.plan,
            loginHistory: wantedUser.loginHistory
        }, process.env.SESSION_KEY, {expiresIn:'1d'})

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            maxAge: 24 * 60 * 60 * 1000,
            path: '/',
        });
    
     res.status(200).json({
      success:true,
      message:"Authentication Approved"
    })
  } catch (error) {
    console.log("Can't verify OTP due to this", error);
    return res.status(500).json({message: "Internal Server Error Please Try Again"})
  }
}


exports.UpdatePassword = async (req,res)=>{

  try {

    const {email,password}=req.body


    if(!email.trim() || !password.trim()){

      return res.status(400).json({
        success:false,
        error:"Must required an email and passowrd to reset your password!"
      })
    }
    
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if(!strongPasswordRegex.test(password)){

       return res.status(400).json({

                    success:false,
                    error:"Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"

                })
    }

    const salt = await bcrypt.genSalt()

    const hashedPassword = await bcrypt.hash(password,salt)

    const findUser = await User.findOne({email:email}).select('+password')

    findUser.password=hashedPassword

    const changePasswordUpdate = await findUser.save()

   if(changePasswordUpdate){

    return res.status(200).json({

      success:true,
      message:"Password Has Been Updated Successfully"
    })
   }


    
  } catch (error) {

    console.log("can't update the password due to this",error);


    res.status(500).json({

      success:false,
      error:"Can't update the password for the moment please try again!"
    })
    
    
  }
}

