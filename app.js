const express = require("express");
const server = express();
const formData = require("express-form-data");
const routerIndex = require("./src/http/router");
const { port, dbName, dbPort, dbHost } = require("./src/config/enviroment");
const db = require("mongoose");
const cors = require("cors")

// server congfiguration
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(formData.parse());

// server routing
server.use(cors())
server.use("/", routerIndex);

// force validation before updating
db.set("runValidators", true);

// connection to datanbase that has no password
db.connect(`mongodb://${dbHost}:${dbPort}/${dbName}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        // starting the server
        server.listen(port, () => {
            console.log("server is running");
        });
    })
    .catch((error) => {
        console.error(error.message);
    });

/**
 *
 * get users done
 * add user done
 *  name
 *  email
 *      // json
 *
 *
 * delete user done
 *
 * */

/**
 * 200 success / ok
 * 201 created
 *
 * 400 error bad request
 * 401 unauthorized
 * 403 forbident
 * 404 was not found
 *
 *
 * 500 server error
 */

/**
 *
 * get  headers , params , authorization ,query
 * post  // body  to create content
 * patch // to update content
 * delete // to delete content
 *
 *  
 * 
 * 
 * sign   => 
 *        {id_user} / (secret)
 *        
 * 
 * verify => (token) / (secret)  >> id_user
 * 
 *
 *
 */

/***
 *
 * connect to database
 *   host
 *   port
 *   name
 *
 *
 *
 *  collection
 * products
 *
 * collection
 *    documents
 *          schema
 * save data
 * fetch data
 *
 *
 *
 *
 */