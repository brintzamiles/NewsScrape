
// Dependencies
let express = require('express'); 
let bodyParser = require('body-parser'); 
let exphbs = require('express-handlebars'); 
var db = require("./models"); 


// Port setup
let PORT = process.env.PORT || 3000; 

// Initialize Express
let app = express(); 


// Middleware
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json());
app.use(express.static("public")); 

// Set up handlebars to work its magic
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Routes
require("./controllers/newsScraperController.js")(app);

// Port Connection
app.listen(PORT, () => {
    console.log(`App listening on PORT ${PORT}`);
})