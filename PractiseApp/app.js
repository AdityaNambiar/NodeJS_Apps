const loggy = require('./logger.js');
// 'require() is the way we 'import' a module into other module.
 // We apply const here. Reason:
/*
Keeping the import 'alias' (an assigned name which can be reused), we are ensuring that
we won't be overwriting this 'alias' name somewhere in our code.
-> This also helps tools like 'jshint' to devise from what the error came and tell us exactly
    what went wrong.
*/

/* 1. */
//loggy("My dawg");
console.log(loggy);
/*
This line worked because we also have an export defined in the logger module that allows us
to use the alias name as a function (since we are exporting the function directly)
*/

/* 2. */
loggy.log = "My dawg loggy called me" ;
console.log(loggy.log);
/*
This line worked because we also have an export defined in the logger module that allows us
to use the alias name as a function (since we are exporting the function directly)
*/
