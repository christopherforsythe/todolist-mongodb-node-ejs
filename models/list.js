const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//schema to define structure of database
//define the blog schema
const listSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    items: [itemSchema]
});

const List = mongoose.model('List', listSchema);

//export the model
module.exports = List;