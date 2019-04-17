var fs = require("fs");
var os = require("os");
var ytdl = require("ytdl-core");

// get audio from youtube video as vorbis in webm disguised as ogg (for ofoct)
// input youtube video url or id, get name and path of downloaded file
module.exports = function (youtubeVideo) {
	return new Promise(function(resolve, reject){

		console.log("Downloading YouTube Video", youtubeVideo);

		var dlstream = ytdl(youtubeVideo, {
			//filter: "audioonly"
			filter: format => format.audioEncoding == "vorbis"
		});

		var filename, filepath;

		dlstream.on("info", (videoInfo, videoFormat) => {
			console.log("Received video info");
			filename = `${videoInfo.title} ${videoInfo.video_id}.${/*videoFormat.container*/"ogg"}`;
			filepath = os.tmpdir() + '/' + filename;
			dlstream.pipe(fs.createWriteStream(filepath));
		});

		dlstream.on("finish", () => {
			console.log("YouTube download done");
			resolve({
				filename,
				filepath
			});
		});

		dlstream.on("error", reject);

	});
}