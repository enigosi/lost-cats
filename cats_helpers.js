// based on
// http://codepen.io/KryptoniteDove/post/load-json-file-locally-using-pure-javascript

 function loadJSON(filePath, callback) {

    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', filePath, true);
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null);
 }

function randomInt(range) {
    return Math.floor(Math.random() * range);
}