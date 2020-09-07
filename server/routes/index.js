const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const EXCLUSION_LIST = ["index.js", "keys", "auth_helper.js" ]
// TODO: Convert this to Node 14+
// https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
module.exports = function(app) {
	fs.readdirSync(__dirname).forEach(function(file) {
		const fileInfo = fs.statSync(path.resolve(__dirname, file));
		console.log("Parsing Routes for:", file, "Is Directory:", fileInfo.isDirectory());
		if (fileInfo.isDirectory() || _.includes(EXCLUSION_LIST, file)) {
			return;
		}
		var name = file.substr(0, file.indexOf('.'));
		console.log("Loading file", name);
		require('./' + name)(app);
	});
}
