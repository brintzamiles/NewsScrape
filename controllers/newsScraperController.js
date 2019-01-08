
// Mongoose Config
mongoose.Promise = Promise; 
mongoose.connect("mongodb://localhost/mongoHeadlines", { 
  useMongoClient: true
});

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

let mongooseConnection = mongoose.connection;