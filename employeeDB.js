// const mysql = require("promise-mysql");
const mysql = require("mysql");
const consoleTable = require("console.table");
let connection = null;

const dbConfig = {
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "employee_db"
};

class EmployeeDB {
    constructor() {
        this.table = `undefined`;  // how can you force this to be implemented by child class?
        this.rows;
    }

    getAll() {
        connection.query(`SELECT * FROM ${this.table}`, function (err, rows) {
            if (err) throw err;
            console.log(`\n`);
            console.log(`EmployeeDB.getAll: ${rows}`);
            console.table(rows);
            console.log(`\n`);
            this.rows = rows;
            return rows;
        });
    };

    insertInto(params){
        const query = connection.query(`INSERT INTO ${this.table} SET ?`, params, function(err, results){
            if(err) throw err;
            console.log(results.affectedRows + ` ${this.table}(s) inserted!\n`);
        })
    }
    
    // function createProduct() {
    //     console.log("Inserting a new product...\n");
    //     var query = connection.query(
    //       "INSERT INTO products SET ?",
    //       {
    //         flavor: "Rocky Road",
    //         price: 3.0,
    //         quantity: 50
    //       },
    //       function(err, res) {
    //         if (err) throw err;
    //         console.log(res.affectedRows + " product inserted!\n");
    //         // Call updateProduct AFTER the INSERT completes
    //         updateProduct();
    //       }
    //     );

    createConnection() {
        const newConnection = mysql.createConnection(dbConfig);

        newConnection.connect(function (err) {
            if (err) {
                console.log(`error connection to database: ${err}`);
                throw err;
            }
            console.log(`connected as ${newConnection.threadId}`);
        });

        return newConnection;
    }

    connect() {
        connection = this.createConnection();
    };

    disconnect() {
        connection.end();
    }
}

module.exports = EmployeeDB;