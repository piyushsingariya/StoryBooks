const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const morgan = require("morgan");
const handlebars = require("express-handlebars");
const path = require("path");
const passport = require("passport");
const session = require("express-session");
const mongoStore = require("connect-mongo")(session);
const mongoose = require("mongoose");
const methodOverride = require("method-override");


// Load Config
dotenv.config({ path: "./config/config.env" });

// passport config
require("./config/passport")(passport);

const app = express();

// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Method-Override
app.use(methodOverride((req, res) => {
  if(req.body && typeof req.body === 'object' && '_method' in req.body){
    let method = req.body._method
    delete req.body.method

    return method
  }
}))


// Loging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Handlebars helper
const { formatDate, truncate, stripTags, editIcon, select } = require("./helpers/hbs");

// Handlebars
app.engine(
  ".hbs",
  handlebars({
    helpers: {
      formatDate,
      truncate,
      stripTags,
      editIcon,
      select
    },
    defaultLayout: "main",
    extname: ".hbs",
  })
);
app.set("view engine", ".hbs");

// Sessions
app.use(
  session({
    secret: "Keyboard Cat",
    resave: false,
    saveUninitialized: false,
    store: new mongoStore({ mongooseConnection: mongoose.connection }),
  })
);

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Set global variable
app.use((req, res, next)=> {
  res.locals.user = req.user || null

  return next();
})

// Routes
app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/stories", require("./routes/stories"));

const PORT = process.env.PORT || 3000;

// Static Folder
app.use(express.static(path.join(__dirname, "public")));

// Mongo DB
connectDB();

app.listen(PORT, console.log("Server running"));
