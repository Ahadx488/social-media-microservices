require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const mediaRoutes = require('./routes/media-routes')
const errorHandler = require('./middleware/errorHandler')
const logger = require('./utils/logger')
const { connectToRabbitMQ,consumeEvent } = require('./utils/rabbitmq')
const {handlePostDeleted} = require('./eventHandlers/media-event-handlers')
const cloudinary = require('cloudinary').v2
const app = express()
const PORT = process.env.PORT || 3003

// connect to mongodb
mongoose
.connect(process.env.MONGO_URI)
.then(()=> logger.info('Connected to mongoDB'))
.catch(e=> logger.error('Mongo Connection error', e))

app.use(cors())
app.use(helmet())
//app.use(express.json())

app.get('/cloud-test', async (req, res) => {
    try {
        const result = await cloudinary.uploader.upload(
            "https://res.cloudinary.com/demo/image/upload/sample.jpg"
        )
        return res.json(result)
    } catch (err) {
        console.error("CLOUDINARY ERROR FULL:", err)
        return res.status(500).json({
            message: err.message,
            http_code: err.http_code,
            name: err.name
        })
    }
})
app.use((req,res,next)=>{
    logger.info(`Recieved ${req.method} request to ${req.url}`)
    logger.info(`Request Body,${req.body}`)
    next();
})

//***  H.W. : Implement IP based rate limiting for sensitive endpoints

app.use('/api/media' , mediaRoutes)

app.use(errorHandler)

async function startServer(){
    try {
        await connectToRabbitMQ()

        // consume all the events
        await consumeEvent('post.deleted' , handlePostDeleted)

        app.listen(PORT , () =>{
            console.log(`Media service running on port ${PORT}`);
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