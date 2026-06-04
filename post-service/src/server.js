require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const Redis = require('ioredis')
const cors = require('cors')
const helmet = require('helmet')
const postRoutes = require('./routes/post-routes')
const errorHandler = require('./middleware/errorHandler')
const logger = require('./utils/logger')
const Joi = require('joi')
const { connectToRabbitMQ } = require('./utils/rabbitmq')

const app = express()
const PORT = process.env.PORT || 3002

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

// H.W. : Implement IP based rate limiting for sensitive end points

// routes -> pass redisclient to routes
app.use('/api/posts' , (req,res,next)=>{
    req.redisClient = redisClient,
    next()
} , postRoutes)

// error handler
app.use(errorHandler)

async function startServer(){
    try {
        await connectToRabbitMQ()
        app.listen(PORT , () =>{
            console.log(`Post service running on port ${PORT}`);
        })
    } catch (error) {
        logger.error('failed to connect to server' , error)
        process.exit(1)
    }
}
startServer()

app.listen(PORT , () =>{
    console.log(`Post service running on port ${PORT}`);
})

// unhandeled promise rejection handler

process.on('unhandeledRejection' , (reason , promise)=>{
    logger.error('Unhandeled Rejection at', promise , "reason : ", reason)
})
