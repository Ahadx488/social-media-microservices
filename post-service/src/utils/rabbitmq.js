const amqp = require('amqplib')
const logger = require('./logger')

let connection = null
let channel = null

const EXCHANGE_NAME = 'facebook_events'

async function connectToRabbitMQ(){
    try {
        
        connection = await amqp.connect(process.env.RABBITMQ_URL)
        channel = await connection.createChannel()
        await channel.assertExchange(EXCHANGE_NAME , 'topic' , {durable : true}) 
        // channel.assertExchange => "Create this exchange if it doesn't exist."
        // durable : false => The exchange will not survive RabbitMQ restart.If RabbitMQ restarts, the exchange disappears.
        logger.info('Connected to rabbitmq')
        return channel

    } catch (error) {
        logger.error('Error in connecting to rabbitmq', error) 
    }
}


async function publishEvent(routingKey , message){
      if(!channel){
            await connectToRabbitMQ()
      }

      channel.publish(EXCHANGE_NAME , routingKey , Buffer.from(JSON.stringify(message)))
      logger.info(`Event Published : ${routingKey}`)
}

module.exports = {connectToRabbitMQ , publishEvent}


/*
What This Code Is Doing

Your function connectToRabbitMQ() is responsible for:

Connecting to the RabbitMQ server

Opening a communication channel

Creating (or verifying) an exchange

Returning the channel so your app can publish messages

post Service
      ↓
RabbitMQ Connection
      ↓
Channel
      ↓
Exchange
      ↓
Queues
      ↓
Consumers


An exchange is a message router.
Producers send messages to exchanges, not directly to queues.
The exchange decides which queue should receive the message.

What is connection?
A connection is a TCP network connection between your Node.js service and the RabbitMQ server.
Think of it like opening a phone line between your application and RabbitMQ.

What is a channel?
A channel is a virtual communication stream inside the connection

=>Connection = a road
=>Channel = a lane on that road


*/