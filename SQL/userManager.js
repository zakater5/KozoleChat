
const LoggerClass = require('../Logger');
const Logger = new LoggerClass();

class userManager{
    registerNewUser(res, repo, email, username, password, confirmPassword){
        return new Promise((resolve, reject) => {
            if(email.trim().length != 0 && username.trim().length != 0 && password.trim().length != 0 && confirmPassword.trim().length != 0){
                if(password == confirmPassword){

                    var userExists = false;
                    var emailExists = false;
        
                    repo.getByUsername(username).then(function(responseObj){
                        if(responseObj){
                            if(responseObj.username){
                                userExists = true;
                            }
                        }               
                    }).then(repo.getByEmail(email).then(function(responseObj){
                        if(responseObj){
                            if(responseObj.email){
                                emailExists = true;
                            }
                        }                
                    })).then(function(){
                        if(!userExists && !emailExists){
                            repo.RegisterUser(username, password, email);
                            console.log(`Registered new user { Username: ${username} Email: ${email} }`);
                            Logger.log(`Registered new user { Username: ${username} Email: ${email} }`);
                            resolve({success: true});
                        } else {
                            //console.log("Email or username already exists!");
                            res.render('Register', {RegistrationError: "Email or username already exists!"});
                            resolve({success: false});
                        }
                    });
        
                } else {
                    //console.log("PASSWORDS DO NOT MATCH!");
                    res.render('Register', {RegistrationError: "Passwords do not match!"});
                    resolve({success: false});
                }      
            } else {
                //console.log("FILL ALL SPOTS DIPSHIT!");
                res.render('Register', {RegistrationError: "Please fill all fields!"});
                resolve({success: false});
            }
        });
    }


    loginUser(res, repo, username, password){
        return new Promise((resolve, reject) => {
            var user = null;
            var pass = null;

            repo.getByUsername(username).then(function(responseObj){
            if(responseObj){
                if(responseObj.username){
                    user = username;
                } else {
                    //console.log("User doesn't exist!")
                    reject({success: false}); //user don't exist
                }
            }             
            }).then(function(){
                if(user != null){
                    repo.getUserPassword_byUser(username).then(function(responseObj){                       
                        if(responseObj){                         
                            pass = responseObj.password;
                            if(password == pass){
                                console.log(`User logged in as { Username: ${username} }`);
                                Logger.log(`User logged in as { Username: ${username} }`);
                                resolve({success: true});
                            } else {
                                res.render('Login', {LoginError: "Incorrect password or username!"});
                                resolve({success: false});
                            }
                        } else {
                            res.render('Login', {LoginError: "Incorrect password or username!"});
                            resolve({success: false});
                        }
                    });
                }
            });
        });
    }
}

module.exports = userManager;
