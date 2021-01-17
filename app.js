const express =require("express");
const bodyParser=require("body-parser")
const mongoose =require("mongoose");
const _ =require("lodash");
// var items=["eat ","buy","cook"];
// var work_list=[];

const app= express();
mongoose.connect("mongodb://localhost:27017/todolistdb",{useNewUrlParser: true, useUnifiedTopology: true})
// mongoose.set('useFindAndModify', false);
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');
const itemschema = new mongoose.Schema({name:String});
const Item =new mongoose.model("Item",itemschema);
const item1=new Item ({name:"welcome to todo list"})
const item2=new Item ({name:"click + to add the task"})
const item3=new Item ({name:"<-- click this to delete the task"})
const default_item = [item1,item2,item3];

///////
const listSchema= new mongoose.Schema({name:String,items:[itemschema]})
const List = new mongoose.model("List",listSchema);




app.get("/",function(req,res){
  // var today =new Date();
  // var options={weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
  // var day =today.toLocaleDateString("en-US",options)

  Item.find({},function(err,finded)
{
  if(finded.length==0)
  {
    item1.save();
    item2.save();
    item3.save();
    console.log("empty array updated");
    console.log("start of 0--"+finded.length);
    console.log(finded);
    res.render("list",{Title:"Today",newListItems:finded});
  }
  else
  {
    res.render("list",{Title:"Today",newListItems:finded});
    console.log("after the start -3--"+finded.length);
  }
})
})

app.get("/:customList",function(req,res){
  const listName= _.capitalize(req.params.customList);

  List.findOne({name:listName},function(err,foundlist)
{
  if(!err)
  {
    if(!foundlist)
    {
      ///////create a new list
      const newlist =new List({
        name: listName,
        items :default_item
      })
      newlist.save();
      res.redirect("/"+listName)
      console.log("doesnt exist");
    }
    else{
      //show the existing list
      res.render("list",{Title:listName,newListItems:foundlist.items});
      console.log("exixts");
    }
  }
})


})
















// app.get("/work",function(req,res){
//   let work ="work list";
//   res.render("list",{Title: work,newListItems:work_list});
//
// })
// app.get("/about",function(req,res){
//   res.render("about");
// })
app.post("/",function(req,res){
  var itemname = req.body.newitem
  var listName=req.body.list;
    const item=new Item ({name:itemname})

  if(listName==="Today")
  {

    item.save()
    console.log(listName);
      res.redirect("/")
  }
  else
  {
      List.findOne({name: listName},function(err,foundlist){
      console.log(foundlist);
      console.log(foundlist.items.length);
      foundlist.items.push(item);
      foundlist.save();
     res.redirect("/"+listName);

    })

  }




})
app.post("/delete",function(req,res){
  var to_del=req.body.cheakbox;
  const listName=req.body.listName_1;
  console.log("ouside the loop===="+listName);
  if(listName==="Today")
  {
    Item.findByIdAndRemove(to_del,function(err)
    {
      if(err){
        console.log(err);
      }
      else{
        console.log("delete successful");
        res.redirect("/");
      }
    })
  }
  else
  {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:to_del}}},function(err,foundlist){
      if(!err){
        console.log(listName);
        res.redirect("/"+listName);
      }
    })
  }

})

app.listen(4000,function(){
  console.log("sever hoted");
})
