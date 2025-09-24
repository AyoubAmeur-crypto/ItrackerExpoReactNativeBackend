const express = require('express')
require('dotenv').config()
const cors = require("cors")
const session = require("express-session")
const MongoStore = require('connect-mongo')
const cookieParser = require('cookie-parser')

const authRoutes = require("./routes/authRoute")
const userRoutes = require("./routes/userRoute")
const expenseRoutes = require("./routes/expenseRoute")
const app = express()

app.use(express.json())

const corsOptions = {
    origin: [
                 'http://localhost:8081',      // Expo web dev server
        'http://localhost:19006',     // Alternative Expo web port
        'http://localhost:19000',     // Another common Expo port
        'http://127.0.0.1:8081',     // Localhost alternative
        
        // Mobile/Expo Go origins  
        'exp://localhost:8081',
        'exp://192.168.0.101:8081', 
        'http://192.168.0.69:8081',
        'http://192.168.68.118:8081/',
        'http://192.168.0.101:8081/',  
        'http://192.168.0.101:8081',
        '*',
         /\.tunnel\.exp\.direct$/, 
    /\.ngrok\.io$/,           
    'exp://*'  ,
        
        
        process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : null
    ].filter(Boolean),
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
}

app.use(cors(corsOptions))


app.use(cookieParser())




app.get('/', (req, res) => {
    res.json({ 
        message: 'Itracker  Backend API is running successfully!',
        status: 'active',
        timestamp: new Date().toISOString(),
     
    })
})


app.use('/api/auth',authRoutes)
app.use('/api/user',userRoutes)
app.use('/api/expense',expenseRoutes)





module.exports = app