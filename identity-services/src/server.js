
require('dotenv').config()
const mongoose = require('mongoose')
const logger  = require('./utils/logger')
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const {RateLimiterRedis} = require('rate-limiter-flexible')
const Redis = require('ioredis')
const { rateLimit } = require('express-rate-limit')
const { RedisStore} = require('rate-limit-redis')
const routes = require('./routes/identity-service')
const errorHandler = require('./middleware/errorHandler')

//Helmet adds protective HTTP headers to make your backend more secure.
/*
🔹 Why Do We Need Helmet?

When a browser communicates with your server, it relies on HTTP headers.

If security headers are missing, your app may be vulnerable to:

❌ Cross-Site Scripting (XSS)

❌ Clickjacking

❌ MIME sniffing attacks

❌ Data injection attacks

Helmet helps prevent these by setting safe defaults.

==> Helmet is an Express middleware that improves application security by automatically setting important HTTP security headers to protect against common web vulnerabilities.
*/

const app = express()
const PORT = process.env.PORT || 3001

// connect to mongodb

mongoose
.connect(process.env.MONGO_URI)
.then(()=> logger.info('Connected to mongoDB'))
.catch(e=> logger.error('Mongo Connection error', e))

const redisClient = new Redis(process.env.REDIS_URL)

// middleware 
app.use(helmet())
app.use(cors())
app.use(express.json())

app.use((req,res,next)=>{
    logger.info(`Recieved ${req.method} request to ${req.url}`)
    logger.info(`Request Body,${req.body}`)
    next();
})

// DDos protection and rate limiting
const rateLimiter = new RateLimiterRedis({
    storeClient : redisClient,
    keyPrefix : 'middleware',
    point : 10, // max requests a user or IP can make
    duration : 1
})

app.use((req,res,next)=>{
    rateLimiter
    .consume(req.ip)
    .then(()=> next())
    .catch(()=>{
        logger.warn(`Rate Limit exceeded for IP : ${req.ip}`)
        res.status(429).json({
            success : false,
            message : 'too many requests'
        })
    })
})


// iP based rate limiting for sensitive endpoints
const sensitiveEndPointsLimiter = rateLimit({
    windowMs : 15*60*1000, // for how much time we want to keep end point rate limiter
    max : 50,
    standardHeaders : true,
    legacyHeaders : false,
    handler : (req,res)=>{
        logger.warn(`Sensitive endpoint rate limit exceeded for IP : ${req.ip}`)
        res.status(429).json({
            success : false,
            message : 'too many requests'
        })
    },
    store : new RedisStore({
        sendCommand : (...args)=> redisClient.call(...args)
    })
})

// apply this sensitiveEndPointsLimiter to our route
app.use('/api/auth/register', sensitiveEndPointsLimiter)

// Routes
app.use('/api/auth' , routes)

// error handler
app.use(errorHandler)

app.listen(PORT , () =>{
    console.log(`Identity service running on port ${PORT}`);
})

// unhandeled promise rejection handler

process.on('unhandeledRejection' , (reason , promise)=>{
    logger.error('Unhandeled Rejection at', promise , "reason : ", reason)
})
