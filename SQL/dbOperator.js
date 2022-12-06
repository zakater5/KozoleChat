
const sqlite3 = require('sqlite3');
const Promise = require('bluebird');

class AppDB {
    constructor(dbFilePath){ // Creates new SQLite3 Database
        this.db = new sqlite3.Database(dbFilePath, (err) => {
            if(err){
                console.log("Error connecting to database: ", err);
            } else {
                console.log("Connected to database.");
            }
        });
    }

    run(sql, params = []){ // Runs an SQL query
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err){
                if(err){
                    console.log("Error executing SQL code: ", sql);
                    console.log(err);
                    reject(err);
                } else {
                    resolve({ id: this.lastID});
                }
            });
        });
    }

    get(sql, params = []){ // Gets a single row of data
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, result) => {
                if(err){
                    console.log("Error retrieving data from db: " + sql);
                    console.log(err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    all(sql, params = []){ // Gets many rows of data
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if(err){
                    console.log("Error getting rows of data: " + sql);
                    console.log(err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
}

module.exports = AppDB;
