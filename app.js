//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = []; this i need to remove now we add database to store our data permanently and this will only be there till i
// not restart our server.

mongoose.connect("mongodb+srv://manas_01:Test-123@cluster0.jhn7iyk.mongodb.net/todolistDB",{useNewUrlParser:true});

const itemsSchema={
  name:String
};

const Item = mongoose.model("Item" ,itemsSchema);

const item1 = new Item({
  name:"welcome to our todo list !"
});

const item2 = new Item({
  name:"Hit + to add an item"
});

const item3 = new Item({
  name:"<--- to remove the item from our to do list"
});

const defaultItems= [item1,item2,item3];

const listSchema={
  name:String,
  items:[itemsSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  Item.find({},function(err,foundItems){
    // console.log(foundItems); //this will not be presentedas todo lisrt make blunder
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("succcessfully saved default items to default DB.")
        }
      });
      res.redirect("/");
    }
    res.render("list", {listTitle:"today", newListItems: foundItems});
  });
});

app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        // console.log("doesn't exist!"); if not exist we create it by
        const list=new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        // console.log("exist"); if exist then render it on the route.
        res.render("list",{listTitle:foundList.name, newListItems: foundList.items});
      }
    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item = new Item({
    name:itemName
  });
  if(listName==="today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }

});

app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("successfully deleted the document!");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

let port=process.env.PORT;
if(port==null || port==""){
  port=3000;
}

app.listen(port, function() {
  console.log("Server has  started successfully");
});
