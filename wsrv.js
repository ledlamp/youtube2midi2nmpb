/*var http = require("http");
var handler = require("serve-handler");
http.createServer(handler).listen(3609);*/

require("child_process").spawn("python", ["-m", "SimpleHTTPServer", "3000"], {
	cwd: "/tmp"
});