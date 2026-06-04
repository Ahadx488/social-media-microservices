![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
# Social Media Microservices

A scalable social media backend built using a microservices architecture. The application separates core functionalities such as authentication, posts, media management, and search into independent services, improving maintainability, scalability, and fault isolation.

## Architecture

The system is composed of the following services:

* **API Gateway** – Central entry point for client requests and request routing.
* **Identity Service** – User authentication, authorization, JWT generation, and refresh token management.
* **Post Service** – Handles creation, retrieval, and management of social media posts.
* **Media Service** – Manages media uploads and storage using Cloudinary.
* **Search Service** – Supports search functionality across the platform.
* **RabbitMQ** – Enables asynchronous communication between services.

## Features

* JWT-based Authentication and Authorization
* Refresh Token Mechanism
* API Gateway Routing
* Event-Driven Communication using RabbitMQ
* Media Upload and Management with Cloudinary
* Independent Service Deployment
* Centralized Error Handling and Logging
* Scalable Microservices Architecture

## Tech Stack

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Communication

* RabbitMQ

### Authentication

* JWT (JSON Web Tokens)

### Media Storage

* Cloudinary

## Project Structure

```text
SOCIAL_MEDIA_MICROSERVICES
│
├── api-gateway/
├── identity-services/
├── post-service/
├── media-service/
├── search-service/
└── notes.txt
```

## Workflow

1. Client sends requests to the API Gateway.
2. API Gateway routes requests to the appropriate microservice.
3. Identity Service validates authentication and authorization.
4. Post Service manages user-generated content.
5. Media Service handles media uploads and storage.
6. Services communicate asynchronously through RabbitMQ events.
7. Search Service processes search-related requests.

## Getting Started

### Prerequisites

* Node.js
* MongoDB
* RabbitMQ
* Cloudinary Account

### Installation

Clone the repository:

```bash
git clone https://github.com/Ahadx488/social-media-microservices.git
cd social-media-microservices
```

Install dependencies for each service:

```bash
cd api-gateway && npm install
cd ../identity-services && npm install
cd ../post-service && npm install
cd ../media-service && npm install
cd ../search-service && npm install
```

### Environment Variables

Create a `.env` file inside each service and configure:

```env
PORT=
MONGODB_URI=
JWT_SECRET=
RABBITMQ_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Running Services

Start each service separately:

```bash
npm start
```

or

```bash
npm run dev
```

depending on the scripts configured.

## Future Enhancements

* User Feed Generation
* Likes and Comments Service
* Notification Service
* Redis Caching
* Docker and Kubernetes Deployment
* Service Discovery and Monitoring

## Learning Outcomes

* Microservices Architecture Design
* API Gateway Pattern
* Event-Driven Systems
* Inter-Service Communication with RabbitMQ
* JWT Authentication and Authorization
* Scalable Backend Development

## Author

Abdul Ahad Momin
