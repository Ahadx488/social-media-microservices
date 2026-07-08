

const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const generateTokens = require('../utils/generateToken')
const logger = require('../utils/logger')
const {validateRegistration,validateLogin} = require('../utils/validation')

// user registration



const registerUser = async(req, res)=>{
    logger.info('Registration endpoint hit.') 
    try {
        
        // validate the schema
        const {error} = validateRegistration(req.body)
        if(error){
            logger.warn('Validation error' , error.details[0].message)
            return res.status(400).json({
                success : false,
                message : error.details[0].message
            })
        }
        const {email , password ,username} = req.body
        let user = await User.findOne({ $or : [{email},{username}]})
        if(user){
            logger.warn('user already exists')
            return res.status(400).json({
                success : false,
                message : 'User already exists'
            })
        }
        user = new User({username , email , password})
        await user.save();
        logger.warn('user saved successfully', user._id)

        const {accessToken , refreshToken} = await generateTokens(user)

        res.status(201).json({
            success : true,
            message : "user registered successfully",
            accessToken,
            refreshToken  
        })




    } catch (err) {
        logger.error('Registration error occured' , err)
        res.status(500).json({
            success : false,
            message : 'Internal server error'
        })
    }
};

// user login

const loginUser = async(req, res)=> { 
    logger.info('Login endpoint hit...')
    try {
        const {error} = validateLogin(req.body)
        if(error){
            logger.warn('Validation error' , error.details[0].message)
            return res.status(400).json({
                success : false,
                message : error.details[0].message
            })
        }
        const {email , password} = req.body
        const user = await User.findOne({email})

        if(!user){
            logger.warn('Invalid user')
            return res.status(400).json({
                success : false,
                message : "Invalid credentials"
            })
        }

        // check if user's valid password or not
        const isValidPassword = await user.comparePassword(password)
        if(!isValidPassword){
            logger.warn('Invalid Password')
            return res.status(400).json({
                success : false,
                message : "Invalid Password"
            })
        }
        
        const {accessToken , refreshToken} = await generateTokens(user)

        res.json({
            accessToken,
            refreshToken,
            userId : user._id,

        })

    } catch (err) {
        logger.error('login error occured' , err)
        res.status(500).json({
            success : false,
            message : 'Internal server error'
        })
    }
}


// refresh token
const refreshTokenUser = async(req,res)=>{
    logger.info("Refresh token endpoint hit...")
    try {
        const {refreshToken} = req.body

        if(!refreshToken){
            logger.warn('Refresh Token missing')
            return res.status(400).json({
                success : false,
                message : "Refresh Token missing"
            })
        }
        
        const storedToken = await RefreshToken.findOne({token : refreshToken})
        if(!storedToken || storedToken.expiresAt < new Date){
            logger.warn('Invalid or expired refresh token')

            res.status(401).json({
                success : false,
                message : 'Invalid or expired refresh token'
            })
        }

        const user = await User.findById(storedToken.user)

        if(!user){
            logger.warn('User not found')

            res.status(401).json({
                success : false,
                message : 'User not found'
            }) 
        }

        const {accessToken : newAccesstoken , refreshToken : newRefreshToken} = await generateTokens(user)

        // delete the old refresh token
        await RefreshToken.deleteOne({_id: storedToken._id})

        res.json({
            accessToken : newAccesstoken,
            refreshToken : newRefreshToken
        })


    } catch (err) {
        logger.error('Refresh token error occured' , err)
        res.status(500).json({
            success : false,
            message : 'Internal server error'
        })
    }
}


// logout

const logoutUser = async (req, res)=>{
    logger.info('Logout endpoint hit')

    try {
        
        const { refreshToken} = req.body
        if(!refreshToken){
            logger.warn('Refresh Token missing')
            return res.status(400).json({
                success : false,
                message : "Refresh Token missing"
            })
        }

        await RefreshToken.deleteOne({token : refreshToken})
        logger.info('Refresh token deleted after logout')

        res.json({
            success : true,
            message : "Logged out successfully!"
        })


    } catch (error) {
        logger.error('Error while logging out' , err)
        res.status(500).json({
            success : false,
            message : 'Internal server error'
        })
    }
}


module.exports = {registerUser , loginUser , refreshTokenUser, logoutUser}