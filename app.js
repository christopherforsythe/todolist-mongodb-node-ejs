//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash');

//const Item = require('./models/item');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//create mongoose db
//mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true});

//connect to mongodb
const dbURI = "mongodb+srv://chris:custom22@cluster0.a2tjb.mongodb.net/node-tutorial?retryWrites=true&w=majority";

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
//as connect is an async task, add the then method which takes a callback function to fire when the method is complete.
  .then((result) => console.log("connected to DB"))
  //add a cach incase there is an error
  .catch((err) => console.log(err));


//schema to define structure of database
//define the blog schema
const itemsSchema = new Schema({
  title: {
      type: String,
      required: true
  }
});

const Item = mongoose.model('Item', itemsSchema);

//create 3 new documents using items model
//item1 passing in field from model
const item1 = new Item({
  title: "Welcome to your todolist!"
});

const item2 = new Item({
  title: "Hit the +  button to add a new item."
});

const item3 = new Item({
  title: "<-- Hit this to delete an item."
});

//create an array of your items
const defaultItems = [item1, item2, item3];

const listSchema = {
  title: String,
  items: [itemsSchema]
};

const List = mongoose.model('List', listSchema);


app.get("/", function(req, res) {

  //find everything in items collection
  Item.find({}, function(err, foundItems){

    //check if array is empty first
    if (foundItems.length === 0) {

    //insert into the collection
    Item.insertMany(defaultItems, function(err){
      if(err) {
        console.log(err);
      } else {
        console.log("Successfully saved default items to db");
      }
    });
    //redirect back to root route and it won't fall into the if block, it will go into the else block as there are items there
    res.redirect("/");
    } else {
      //render the items found
    res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});

//create custom list using express route paramas
app.get("/:customListName", function(req, res) {
  //save the route name using lodash to capitalise it
  const customListName = _.capitalize(req.params.customListName);


  //check if the list already exists. findOne method returns an object
  List.findOne({title: customListName}, function(err, foundList){

    if(!err) {
      if(!foundList) {
         //create a new list
        const list = new List({
          title: customListName,
          items: defaultItems
        });
        //save that into the new lists collection
        list.save();

        //redirect the user back the route of the list they requested
        res.redirect("/" + customListName);

      } else {
        //show an existing list
        res.render("list", {listTitle: foundList.title, newListItems: foundList.items})
      }
    }
  });  
});


app.post("/", function(req, res){

  const itemTitle = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    title: itemTitle
  });

  //check if in default list
  if (listName === "Today") {
    //save the new item to collection
    item.save();

    //redirect to home route so it renders on the screen
    res.redirect("/");
  
  } else {
    //item will be from custom list so must search for list document in database
    List.findOne({title: listName}, function(err, foundList){
      //tap into the found list doc and try to add new item.
      //items refers to the embedded array of items 
      foundList.items.push(item);
      //save and update with new data
      foundList.save();
      //redirect to the route the user came from
      res.redirect("/" + listName);
    })
  }

});

//create a route for deleting items from the todolist
app.post("/delete", function(req, res) {

  const checkedItemId = req.body.checkbox;
  //get the list name from where the deletion happened from the hidden input tag
  const listName = req.body.listName;

  //Check if we are making a post request to delete an item from default list or a custom list

  if(listName === "Today") {
    //on the default
    //remove the item from the database,
    //must provide callback to delete item
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if(!err) {
        console.log("Successfully deleted default items from db");
        res.redirect("/");
      } 
    });
  } else {
    //find the item in the itemsSchema array with particular id and remove the item from the array
    List.findOneAndUpdate({
      title: listName
    }, 
    {
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    }, function(err, foundList){
      if (!err) {
        //if there are no errors , redirect to custom list path
        res.redirect("/" + listName);
      }
    });
  }
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
