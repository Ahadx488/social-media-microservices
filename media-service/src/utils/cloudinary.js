const cloudinary = require('cloudinary').v2
const logger = require('./logger')
// // Add these 3 lines to check what Node.js is actually seeing
// console.log("--- CLOUDINARY DEBUG ---");
// console.log("Cloud Name:", process.env.cloud_name);
// console.log("API Key:", process.env.api_key);
// console.log("API Secret Length:", process.env.api_secret ? process.env.api_secret.length : "UNDEFINED!");
// console.log("------------------------");
cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret
})


const uploadMediaToCloudinary = (file) => {
    return new Promise((resolve , reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type : "auto"
            },
            (error , result)=>{
                if(error){
                    logger.error('Error while uploading media to cloudinary', error)
                    return reject(error)
                }else{
                    return resolve(result)
                }
            }
        )

        uploadStream.end(file.buffer)

    }) 
}

const deleteMediaFromCloudinary = async(publicId)=>{
    try {
        
        const result = await cloudinary.uploader.destroy(publicId)
        logger.info('Media deleted successfully from cloud storage', publicId)
        return result

    } catch (error) {
        logger.error('Error in deleting media from cloudinary', error)
        throw error
    }
}



module.exports = {uploadMediaToCloudinary , deleteMediaFromCloudinary}