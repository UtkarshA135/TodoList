//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Utkarsh:Utkarsh123@cluster0.n7vn6.mongodb.net/todoListDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const TaskSchema = {
  name: String
}
const Task = mongoose.model("task", TaskSchema);
const buyCloth = new Task({
  name: "Buy Clothes"
})
const washCloth = new Task({
  name: "Wash Clothes"
})
const completeProject = new Task({
  name: "Complete Projects"
})
const taskList = [buyCloth,washCloth,completeProject];
const ListSchema = {
  name:String,
  itemList : [TaskSchema]
};
const List = mongoose.model("list",ListSchema);

app.get("/", function(req, res) {


  Task.find(function(err, result) {

    if (result.length === 0) {
      Task.insertMany([buyCloth, washCloth, completeProject], function(err) {
        if (err)
          console.log(err);
        else
          console.log("Succesfully added");
      })
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: result
      });
    }
  })



});


app.post("/", function(req, res) {
console.log(req.body);
  const item = req.body.newItem;
 const listName = req.body.list;
  const newitem = new Task(
    {
      name: item
    }
  )
  if(listName==="Today")
  {
  newitem.save();
    res.redirect("/");}
    else{
      List.findOne({name:listName},function(err,results){
        if(!err)
        {
          results.itemList.push(newitem);
         results.save();

          res.redirect("/"+listName);
        }
      })
    }

});
app.post("/delete",function(req,res){
  const listName =req.body.listName;
  if(listName==="Today")
  {
    Task.findByIdAndRemove({_id:req.body.checkbox},function(err){
      if(err)
      console.log(err);
      else
      {

        res.redirect("/");
      }
    })
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{itemList:{_id:req.body.checkbox}}},function(err,resilt){
      if(!err)
      res.redirect("/"+listName);
    })
  }

});
app.get("/:title",function(req,res){
  const customTitle = _.capitalize(req.params.title);
List.findOne({name :customTitle},function(err,result){
  if(err)
  console.log(err);
  else
  {
 if(!result)
{
  const list = new List({
    name:customTitle,
    itemList: taskList,
  })
  list.save();
  res.redirect("/"+customTitle);
}
else{
res.render("list",{
  listTitle:customTitle,
  newListItems:result.itemList
})
}
}
})

})


app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(process.env.PORT||3000, function() {
  console.log("Server started on port 3000");
});
