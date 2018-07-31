const ipfs = window.IpfsApi('ipfs.infura.io', '5001', {protocol: 'https'})
const Buffer = window.IpfsApi().Buffer

function uploadToIpfs(toStore, ipfsHashHandler) {
  ipfs.add(new Buffer(toStore), function (err, res) {
    if (err || !res) {
      return console.error('ipfs add error', err, res)
    }
    res.forEach(function (file) {
      console.log('successfully stored', file.hash)
      ipfsHashHandler(file.hash)
    })
  })
}

window.onload = function() {

  window.app = new Vue({
    el: '#app',
    data: {
      userAddressOutput: "Loading...",
      networkIDOutput: "Loading...",
      transactions: [],
      uploadInput: "",
      nameInput: "",
      ipfsLogs: []
    },
    computed: {
      timestamperContractInstance: function() {
        return web3.eth.contract(timestamperABI).at(timestamperAddress)
      },
    },
  });

  web3.version.getNetwork((err, netId) => {
    if (netId != "1") {
      $(".warnings").show();
      $("#networkWarning").show();
    }
  });
  if (web3.eth.accounts.length == 0) {
    $(".warnings").show();
    $("#noWeb3AccountWarning").show();
  }

  app.userAddressOutput = web3.eth.accounts[0];

  web3.version.getNetwork(function(err, res) {
    if (!err) { // I skip this later in this file. This is bad! Bad Logan
      if (res == 1) {
        app.networkIDOutput = "mainnet";
      }
      else if (res == 3) {
        app.networkIDOutput = "Ropsten";
      }
    }
    else {
      console.log(err);
    }
  });

  getAllIpfsLogsFromTimestamper();
}

function uploadAndTimestamp() {
  var dataToUpload = window.app.uploadInput;
  var dataName = window.app.nameInput;

  //upload to ipfs, get hash
  uploadToIpfs(dataToUpload, function(ipfsHash) {
    dataToTimestamp = {dataType: 'ipfs',
                       name: dataName,
                       data: ipfsHash};

    var data = JSON.stringify(dataToTimestamp);

    window.app.timestamperContractInstance.makeTimestamp(data, function(err, res) {
      if (err) console.log("error in makeTimestamp call: ", err);
      else {
        txOutputObject = {'string':"Timestampt tx: " + res,
                          'tx':res};
        window.app.transactions.push(txOutputObject);
      }
    });
  });

  //upload hash to contract with metadata

}

function getAllIpfsLogsFromTimestamper() {
  eventFilter = window.app.timestamperContractInstance.Timestamp({}, {fromBlock: 3700000, toBlock:'latest'});

  eventFilter.get( (err, res) => {
    if (err) console.log("error in event fetch:", err);
    else {
      window.allTimestampLogs = res;
      console.log(res);
    }

    window.app.ipfsLogs = [];
    for (var i=0; i<window.allTimestampLogs.length; i++) {
      var parsedData;
      try {
        parsedData = JSON.parse(window.allTimestampLogs[i].args['data']);
      }
      catch(err) {
        continue;
      }

      if (parsedData['dataType'] == 'ipfs') {
        var ipfsLog = {
          agent: window.allTimestampLogs[i].args['agent'],
          timestamp: window.allTimestampLogs[i].args['time'],
          name: parsedData['name'],
          ipfsUrl: "https://ipfs.io/ipfs/" + parsedData['data']
        }
        window.app.ipfsLogs.push(ipfsLog);
      }
    }
  });
}
