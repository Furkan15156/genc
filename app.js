//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
console.log('okay')

mongoose.connect('mongodb://localhost:27017/todolistDB');

const itemsSchema = new mongoose.Schema({
  name: String
})

const Item = new mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Yapılacaklar listenize hoşgeldiniz."
})

const item2 = new Item({
  name: "Eklemek için + butonuna tıklayınız."
})

const item3 = new Item({
  name: "<-- Eksiltmek için işaretleyiniz."
})

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = new mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Default items inserted.");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Bugün",
        newListItems: foundItems
      });
    }
  })
});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Bugün") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, (err, foundList)=> {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

app.post("/delete", (req, res)=> {
  const checkedItemId = req.body.checkbox;
  Item.findByIdAndRemove(checkedItemId, (err)=>{
    if (!err) {console.log("Checked item deleted.")}
    res.redirect("/");
  });

})

app.get("/work", function(req, res) {
  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  });
});

app.get("/:customListName", (req, res)=> {
  const customListName = req.params.customListName;

  List.findOne({name: customListName}, (err, foundList)=>{
    if (!err) {
      if (!foundList) {
          const list = new List({
            name: customListName,
            items: defaultItems
          });

        list.save();
        res.redirect("/" + customListName)
      }else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });

})

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});









//
