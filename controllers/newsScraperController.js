// Imports
let axios = require('axios'); 
let cheerio = require('cheerio'); 
let mongoose = require('mongoose'); 
let db = require("../models"); 

// Mongoose Config
mongoose.Promise = Promise; 

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

let mongooseConnection = mongoose.connection;

mongooseConnection.on('error', console.error.bind(console, 'connection error:'));
mongooseConnection.once('open', function() {
  console.log(`Successfully Connected to Mongo DB !`); 
});

module.exports = (app) => { 


  // Default Route
  app.get("/", (req, res) => res.render("index"));

  // Scrape Articles Route
  app.get("/api/search", (req, res) => {

    axios.get("https://www.npr.org/sections/news/").then(response => {
      // console.log("Load Response");
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      let $ = cheerio.load(response.data);

      let handlebarsObject = {
        data: []
      }; // Initialize Empty Object to Store Cheerio Objects

      $("article").each((i, element) => { 
        //NPR only returns low resolution mages, but this takes care of that
        let lowResImageLink = $(element).children('.item-image').children('.imagewrap').children('a').children('img').attr('src');

        if (lowResImageLink) {

          let imageLength = lowResImageLink.length;
          let highResImage = lowResImageLink.substr(0, imageLength - 11) + "800-c100.jpg";

          handlebarsObject.data.push({ 
            headline: $(element).children('.item-info').children('.title').children('a').text(),
            summary: $(element).children('.item-info').children('.teaser').children('a').text(),
            url: $(element).children('.item-info').children('.title').children('a').attr('href'),
            imageURL: highResImage,
            slug: $(element).children('.item-info').children('.slug-wrap').children('.slug').children('a').text(),
            comments: null
          });
        } 
      }); 

      // Return data for rendering
      res.render("index", handlebarsObject);
    });
  });

  // Saved Article Route
  app.get("/api/savedArticles", (req, res) => {
    
    db.Articles.find({}). 
    then(function(dbArticle) {
      res.json(dbArticle);

    }).catch(function(err) {
      res.json(err);
    });
  }); 

  // Posting
  app.post("/api/add", (req, res) => { 

    let articleObject = req.body;

    db.Articles. 
    findOne({url: articleObject.url}). 
    then(function(response) {

      if (response === null) { 
        db.Articles.create(articleObject).then((response) => console.log(" ")).catch(err => res.json(err));
      } 
      res.send("Article Saved");

    }).catch(function(err) {
      res.json(err);
    });

  }); 

  // Delete Article Route
  app.post("/api/deleteArticle", (req, res) => {
    sessionArticle = req.body;

    db.Articles.findByIdAndRemove(sessionArticle["_id"]). 
    then(response => {
      if (response) {
        res.send("Sucessfully Deleted");
      }
    });
  }); 

  // Delete Comment Route
  app.post("/api/deleteComment", (req, res) => {
    let comment = req.body;
    db.Notes.findByIdAndRemove(comment["_id"]). 
    then(response => {
      if (response) {
        res.send("Sucessfully Deleted");
      }
    });
  }); 

  // Create Notes Route
  app.post("/api/createNotes", (req, res) => {

    sessionArticle = req.body;

    db.Notes.create(sessionArticle.body).then(function(dbNote) {
      
      return db.Articles.findOneAndUpdate({
        _id: sessionArticle.articleID.articleID
      }, {
        $push: {
          note: dbNote._id
        }
      });
    }).then(function(dbArticle) {
      res.json(dbArticle);

    }).catch(function(err) {
      res.json(err);
    });
  }); 

  
  app.post("/api/populateNote", function(req, res) {
    // Associate Notes with the Article ID
    db.Articles.findOne({_id: req.body.articleID}).populate("Note"). 
    then((response) => {
      // Note Has 1 Comment
      if (response.note.length == 1) { 

        db.Notes.findOne({'_id': response.note}).then((comment) => {
          comment = [comment];
          console.log("Sending Back One Comment");
          res.json(comment); 
        });

      } else { // Note Has 0 or more than 1 Comments

        console.log("2")
        db.Notes.find({
          '_id': {
            "$in": response.note
          }
        }).then((comments) => {
          res.json(comments); 
        });
      }
    }).catch(function(err) {
      res.json(err);
    });
  }); 

} 
