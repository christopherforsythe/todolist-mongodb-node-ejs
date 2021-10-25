const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//schema to define structure of database
//define the blog schema
const itemsSchema = new Schema({
    title: {
        type: String,
        required: true
    }
});

const Item = mongoose.model('Item', itemsSchema);

//export the model
module.exports = Item;