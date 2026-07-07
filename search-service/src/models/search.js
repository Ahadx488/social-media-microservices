const mongoose = require('mongoose');
const searchPostSchema = new mongoose.Schema({
    postId : {
        type : String,
        required : true,
        unique : true
    },
    userId : {
        type : String,
        required : true,
        index : true
    },
    // we are going to search based on content not by post
    content : {
        type : String,
        required : true
    },
    createdAt : {
        type : Date,
        required : true
    }
}, 
{timestamps : true}
);

searchPostSchema.index({content : 'text'})
searchPostSchema.index({createdAt : -1})

const Search = mongoose.model('Search' , searchPostSchema)

module.exports = Search;