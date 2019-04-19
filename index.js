console.log("oi"); // hard to tell when started in repl.it
var youtubedl = require("youtube-dl");
var request = require("request-promise-native");
var mppClient = require("mpp-client-xt");
var fs = require("fs");
var os = require("os");
var http = require("http");


var bot = new mppClient();
bot.setChannel("NMPB Autoplayer (Sockets)");
bot.start();
bot.on("hi", () => bot.setName("yt2mid2nmbp"));

bot.on("a", async msg => {
	try {
		var args = msg.a.split(" ");
		var cmd = args[0].toLowerCase();
		var query = args.slice(1).join(" ");
		if (cmd == "/convert") {
			if (!query.startsWith("http")) query = `ytsearch:${query}`;
			bot.say("Waiting for youtube-dl…");
			var ytdl = youtubedl(query, ["-f 171"]);
			var videoinfo, dlpath;
			ytdl.on("info", info => {
				console.log(info);
				bot.say(`Downloading video: ${info.title} (https://youtu.be/${info.id})`.substr(0,512));
				videoinfo = info;
				dlpath = os.tmpdir() + "/" + info._filename;
				ytdl.pipe(fs.createWriteStream(dlpath));
			});
			ytdl.on("end", async function(){
				bot.say("Finished downloading; uploading to MIDI converter…");
				var response = await request.post("https://ct1.ofoct.com/upload.php", {
					rejectUnauthorized: false,
					formData: {
						myfile: {
							value: fs.readFileSync(dlpath), // fs.createReadStream() would be better but fsr it dont work
							options: {
								filename: videoinfo._filename
							}
						}
					}
				});
				console.log(response);
				try {
					var ofoctTmpFileName = JSON.parse(response)[0];
				} catch(e) {
					return bot.say("Invalid response from MIDI converter: " + response);
				}
				bot.say("Waiting for MIDI converter…");
				var response = await request.get("https://ct1.ofoct.com/convert-file_v2.php", {
					rejectUnauthorized: false,
					qs: {
						cid: "audio2midi",
						output: "MID",
						tmpfpath: ofoctTmpFileName,
						row: "file1",
						sourcename: videoinfo._filename,
						rowid: "file1",
					}
				});
				console.log(response);
				response = response.split("|");
				if (response[1] == "ERROR") return bot.say("MIDI conversion failed: "+response[2]);
				var ofoctConvertedTmpFilePath = response[2];
				var ofoctConvertedFileName = response[4];
				var midiurl = `https://ct1.ofoct.com/get-file.php?type=get&genfpath=${encodeURIComponent(ofoctConvertedTmpFilePath)}&downloadsavename=${encodeURIComponent(ofoctConvertedFileName)}`
				bot.say(`/u ${midiurl} [Y2M] ${ofoctConvertedFileName}`)
			});
			ytdl.on('error', error => {
				if (error.message.includes("requested format not available")) {
					bot.say("This video is not available in vorbis format :(");
				} else {
					bot.say(error.message);
				}
				console.error(error);
			})
		} else if (cmd == "/help") {
			bot.say("Convert a YouTube video to MIDI with /convert and a video URL or search query.");
		}
		// TODO /search
	} catch(e) {
		bot.say(e.message || e);
	}
});

http.createServer((req,res) => res.end("OK")).listen(3000); // keeps repl running
