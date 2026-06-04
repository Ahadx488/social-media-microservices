const express = require('express')
const multer = require('multer')

const {uploadMedia , getAllMedias} = require('../controller/mediaController')
const {authenticateRequest} = require('../middleware/authMiddleware')
const logger = require('../utils/logger')

const router = express.Router()

// configure multer for file upload
const upload = multer({
    storage : multer.memoryStorage(),
    limits : {
        fileSize : 5*1024*1024
    }
}).single('file')

router.post('/upload' , authenticateRequest, (req, res, next) =>{
    upload(req, res ,function(error){
        if(error instanceof multer.MulterError){
            logger.error('Multer error while uploading: ',error)
            return res.status(400).json({
                message : 'Multer error while uploading:',
                error : error.message,
                stack : error.stack
            })
        }else if(error){
            logger.error('unknown error occured while uploading: ',error)
            return res.status(500).json({
                message : 'unknown error occured while uploading:',
                error : error.message,
                stack : error.stack
            })
        }

        if(!req.file){
            return res.status(400).json({
                message : 'No file found!'
            })
        }

        next()

    })
} , uploadMedia)

router.get('/get' , authenticateRequest , getAllMedias)

module.exports = router
