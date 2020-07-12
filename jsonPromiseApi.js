// api class maybe
/*

Provide list of pools/urls to query simple json server for
worker data


// two miners

// https://rvn.2miners.com/api/accounts/RGuttSk2qyFDSdwbhwxSXR5G9wU21gYkdh
// mint pond
// fetch and display similar to nicehash
// https://api.mintpond.com/v1/zcoin/miner/status/a9UKiXi6FS3kmKpnyrB4YpiDShFcmyscXy
*/
var request = require("request-promise-native");
var qs = require("qs");

class jsonPromiseFetch {
	constructor(url) {
		this.host = url
		return request({
			uri: this.host,
			json: true
		})
	}
}
module.exports = jsonPromiseFetch