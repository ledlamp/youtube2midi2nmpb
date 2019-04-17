var fs = require("fs");
var MPPclient = require("mpp-client-xt");

require("./wsrv");



// convert youtube video to midi and save to file for web server
async function convertYouTubeVideoToMidi(youtubeVideo) {
	var {filename, filepath} = await require("./yt2of")(youtubeVideo);
	var {filename, midifile} = await require("./a2m")(fs.readFileSync(filepath), filename);
	fs.writeFileSync("/tmp/"+filename, midifile);
	return filename;
}




var bot = new MPPclient("ws://www.multiplayerpiano.com:443");
bot.setChannel("NMPB Autoplayer (Sockets)");
bot.start();
bot.on("hi", () => bot.setName("YT2MID2NMPB"));

bot.on("a", async msg => {
	if (msg.a.startsWith("/convert")) {
		try {
			var filename = await convertYouTubeVideoToMidi(msg.a.split(" ").slice(1).join(" "));
			bot.say("/u " + "https://youtube2midi2nmpb--ledlamp89.repl.co/" + encodeURIComponent(filename) /*+ " " + "[YT2M] " + filename*/);
		} catch(e) {
			bot.say(e.message || e);
		}
	}
});