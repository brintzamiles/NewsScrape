let mongoose = require('mongoose');

// Initialize and save to the schema constructor
let Schema = mongoose.Schema; 

// Model
var commentSchema = new Schema({

  body: String

});

var Comment = mongoose.model("Comment", commentSchema);

// Export the Comment model
module.exports = Comment;
