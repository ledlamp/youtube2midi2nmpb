var request = require("request-promise-native");


// input file as buffer and name of file, get midi and new file name
module.exports = async function (inputFile, inputFileName) {

	// step 1 - upload file to bear
	console.log("Uploading audio to bear file converter…");
	var response = await request.post("https://ct1.ofoct.com/upload.php", {
		rejectUnauthorized: false,
		formData: {
			//myfile: inputFile
			myfile: {
				value: inputFile,
				options: {
					filename: inputFileName
				}
			}
		}
	});
	console.log("Response:", response);
	var ofoctTmpFileName = JSON.parse(response)[0];

	// step 2 - convert file
	console.log("Converting file on bear file converter…");
	var response = await request.get("https://ct1.ofoct.com/convert-file_v2.php", {
		rejectUnauthorized: false,
		qs: {
			cid: "audio2midi",
			output: "MID",
			tmpfpath: ofoctTmpFileName,
			row: "file1",
			sourcename: inputFileName,
			rowid: "file1",
		}
	});
	console.log("Response:", response);
	response = response.split("|");
	if (response[1] == "ERROR") throw new Error("Ofoct error: " + response[2]);
	var ofoctConvertedTmpFilePath = response[2];
	var ofoctConvertedFileName = response[4];

	// step 3 - download converted file
	console.log("Downloading converted file…");
	var response = await request.get("https://ct1.ofoct.com/get-file.php", {
		rejectUnauthorized: false,
		qs: {
			type: "get",
			genfpath: ofoctConvertedTmpFilePath,
			downloadsavename: ofoctConvertedFileName
		},
		encoding: null
	});
	console.log("typeof response:", typeof response);

	return {midifile: response, filename: ofoctConvertedFileName};
}