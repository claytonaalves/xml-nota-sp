/* 
 * This script is responsible for storing and retrieving 
 * configuration in a json file 
 *
 */

var fs = require('fs');
var filename = './config.json'

exports.get = function() {
    var data = fs.readFileSync(filename);
    var myObj;

    try {
        myObj = JSON.parse(data);
        return myObj
    } catch (err) {
        // console.log('There has been an error parsing your JSON.')
        console.log(err);
    }
}

exports.set = function(params) {
    var data = JSON.stringify(params);

    fs.writeFile(filename, data, function (err) {
        if (err) {
          // console.log('There has been an error saving your configuration data.');
          console.log(err.message);
          return;
        }
        // console.log('Configuration saved successfully.')
    });
}
