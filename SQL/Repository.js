
class Repo {
    constructor(DB_Op){
        this.DB_Op = DB_Op;
    }

    // ----------------------------------> Writing to DB 'methods'
    createUsersTable(){ // Creates a new table (In this case it creates the Users table) / isVerified = email verified (0 = false, 1 = true) 
        const sql = `
            CREATE TABLE IF NOT EXISTS Users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                email TEXT NOT NULL,
                isVerified NUMBER(1) NOT NULL,
                accountTier TEXT NOT NULL,
                dateJoined DATETIME NOT NULL,
                avatarImage TEXT,
                bannerImage TEXT,
                about TEXT
            )`
        return this.DB_Op.run(sql); // remote_sessions = remote machines logged in as this user
    }

    RegisterUser(username, password, email){ // Registers a new user
        return this.DB_Op.run(
            `INSERT INTO Users (username, password, email, isVerified, accountTier, dateJoined, avatarImage, bannerImage, about) VALUES (?, ?, ?, 0, "Member", CURRENT_DATE, null, null, null)`,
            [username, password, email]
        );
    }

    updatePassword(username, newPassword){ // Updates the password of the specified user
        const password = newPassword;
        return this.DB_Op.run(
            `UPDATE Users SET password = ? WHERE username = ?`,
            [password, username]
        );
    }

    deleteUser(username){ // Deletes row from database where the specified user exists
        return this.DB_Op.run(
            `DELETE FROM Users WHERE username = ?`,
            [username]
        );
    }

    updateUserProfile(username, about, userAvatar, userBanner){ // Updates a user's profile
        return this.DB_Op.run(
            `UPDATE Users SET about = ?, avatarImage = ?, bannerImage = ? WHERE username = ?`,
            [about, userAvatar, userBanner, username]
        );
    }


    // ----------------- >> MESSAGES:
    createMessagesTable(){ // Creates a new table (In this case it creates the Users table) / isVerified = email verified (0 = false, 1 = true) 
        const sql = `
            CREATE TABLE IF NOT EXISTS Messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sentBy TEXT NOT NULL,
                content TEXT,
                timestamp DATETIME NOT NULL
            )`
        return this.DB_Op.run(sql); // remote_sessions = remote machines logged in as this user
    }

    saveMessage(sentBy, content){
        return this.DB_Op.run(
            `INSERT INTO Messages (sentBy, content, timestamp) VALUES (?, ?, CURRENT_DATE)`,
            [sentBy, content]
        );
    }

    getAllMessages(){
        return this.DB_Op.all(`SELECT * FROM Messages`);
    }

    //-------------------------------------------------------------------------------

    // ----------------------------------> Reading from DB 'methods'
    getAllUserInfo(userId){ // returns all info to the coresponding user
        return this.DB_Op.get(
            `SELECT * FROM Users WHERE username = ?`,
            [userId]
        );
    }

    getByUsername(username){ // Displays all data from the rows in which the specified username exists
        return this.DB_Op.get(
            `SELECT username FROM Users WHERE username = ?`,
            [username]
        );
    }

    getByEmail(email){
        return this.DB_Op.get( // Returns an email address if it exists
            `SELECT email FROM Users WHERE email = ?`,
            [email]
        );
    }

    getUserPassword_byUser(username){ // Returns a user's password
        return this.DB_Op.get(
            `SELECT password FROM Users WHERE username = ?`,
            [username]
        );
    }

    getUserAccountTier(username){
        return this.DB_Op.get(
            `SELECT accountTier FROM Users WHERE username = ?`,
            [username]
        );
    }

    getAllUsers(){ // Returns every user's data
        return this.DB_Op.all(`SELECT * FROM Users`);
    }
}

module.exports = Repo;
