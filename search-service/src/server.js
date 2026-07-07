require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const Redis = require('ioredis');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const {connectToRabbitMQ , consumeEvent} = require('./utils/rabbitmq');
const searchRoutes = require('./routes/search-routes');
const { handlePostCreated, handlePostDeleted } = require('./eventHandlers/search-event-handlers');


const app = express()
const PORT = process.env.PORT || 3004

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
// H.W. : pass redis client as part of your request and then implement redis

app.use('/api/search', searchRoutes);

app.use(errorHandler)


async function startServer(){
    try {
        await connectToRabbitMQ();

        // consume the event / subscribe to event
        await consumeEvent('post.created', handlePostCreated)
        await consumeEvent('post.deleted', handlePostDeleted)

        app.listen(PORT , () => {
            logger.info(`Search Service is running on Port : ${PORT}`)
        })

    } catch (error) {
        logger.error(error, 'failed to start Search service')
        process.exit(1)
    }
}

startServer();
