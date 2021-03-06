// Requiring packages
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var dotenv = require("dotenv");
var mongoose = require("mongoose");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var flash = require("connect-flash");
var methodOverride = require("method-override");

// Requiring models
var Ticket = require("./models/ticket");
var User = require("./models/user");
var Board = require("./models/board");
var Project = require("./models/project");

// Requiring routes
var indexRoutes = require("./routes/index");
var ticketRoutes = require("./routes/ticket");
var projectRoutes = require("./routes/project");
var boardRoutes = require("./routes/board");
var backlogRoutes = require("./routes/backlog");

// Require middleware
var middleware = require("./middleware")

// Seed Data
var seedDB = require("./private/seedData");

dotenv.config();

// Database Setup
var dbUrl = process.env.DB_URL || "mongodb://localhost/sprintu";
mongoose.set('useUnifiedTopology', true);
mongoose.connect(dbUrl, { 
    useNewUrlParser: true,
    useCreateIndex: true
}).then(() => {
    console.log("Connected to database");
}).catch((err) => {
    console.log("ERROR: ", err.message);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(flash());

// Add sample data to database
// seedDB();

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");

    next();
});

// Serve static assets from these directories
app.use(express.static(__dirname + "/images"));
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/node_modules/bulma"));

// Routes
app.get("/", function (req, res) {
    res.render("landing");
});

// app.get("/backlog", middleware.isLoggedIn, (req, res) => {
//     Ticket.find({}, function (err, allTickets) {
//         if (err) {
//             console.log(err);
//         } else {
//             res.render("backlog", { tickets: allTickets });
//         }
//     });
// });


app.use("/", indexRoutes);
app.use("/projects", projectRoutes);
app.use("/projects/:id/board", boardRoutes);
app.use("/projects/:id/backlog", backlogRoutes);
app.use("/projects/:id/backlog/:backlog_id/ticket", ticketRoutes);


var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("SprintU Server has started!");
});
