var username = "Aditya";
function log(msg){
  console.log(msg);
}

// All the variables and functions, you declare and define in a module remain 'private to that module'
/* To be able to 'EXPOSE' any variables & functions to other modules which import this module:
    You can export these variables and functions as shown below:
*/
/*
  If you do a 'console.log(module)', you'll see that you get a JSON object named 'module' within that you see an 'exports' property.
  This 'exports' property is the one which holds all the exports that you defined for a module, as shown below.
*/
module.exports.logFunc = log; // Read this line in Hindi as: Module object ka exports object, uska key of name 'log' define karta hu as 'log' (which is a function in this file / module)
// Now just incase you did not know, you can add key:value paired members to JSON objects by defining it as: jsonObj.key = value.
module.exports.usname = username;
// These above two exports depict that you can have either same or different name for things you export.

module.exports = log;
// This directly returns the function (as 'log' is a function in this module). So the alias name given in the calling module will turn into a function itself.

console.log(module);

/* VERY IMPORTANT NOTE */
/* YOU CANNOT PERFORM EXPORTS OF A SINGLE MEMBER SUCH AS A VARIABLE OR A FUNCTION
   BECAUSE THE FINAL EXPORT WILL OVERWRITE THE PREVIOUS NAMED EXPORT.
*/
