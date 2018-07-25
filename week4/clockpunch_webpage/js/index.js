window.onload = function() {

  window.app = new Vue({
    el: '#app',
    data: {
      userAddressOutput: "Loading...",
      networkIDOutput: "Loading...",
      transactions: [],
      agentAddressInput: "",
      punchActions: [],
      hoursWorked: 0
    },
    computed: {
      clockpunchContractInstance: function() {
        return web3.eth.contract(clockpunchABI).at(clockpunchAddress)
      }
    }
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

  //console.log(getAllPunchEvents());
}

function getPunchEventsFromAgent() {
  eventFilter = window.app.clockpunchContractInstance.PunchEvent({}, {fromBlock: 3700000, toBlock:'latest'});

  eventFilter.get( (err, res) => {
    if (err) console.log("error in event fetch:", err);
    else {
      console.log(res);
      window.allPunchEvents = res;
    }

    eventsFromAgent = [];
    for (var i=0; i<window.allPunchEvents.length; i++) {
      if (window.allPunchEvents[i].args['agent'].toLowerCase() == window.app.agentAddressInput.toLowerCase()) {
        console.log(allPunchEvents[i]);
        window.app.punchActions.push(allPunchEvents[i])
      }
    }

    var secondsWorked = 0;

    var inActionFound = false;
    var inActionTime = 0;
    var outActionFound = false;

    for (var i=0; i<window.app.punchActions.length; i++) {
      if (inActionFound && outActionFound) {
        inActionFound = false;
        inActionTime = 0;
        outActionFound = false;
      }
      if (!inActionFound && !outActionFound) {
        if (window.app.punchActions[i].args['action'] == "in") {
          inActionFound = true;
          inActionTime = window.app.punchActions[i].args['time'];
          continue;
        }
      }
      else if (inActionFound && !outActionFound) {
        if (window.app.punchActions[i].args['action'] == "out") {
          outActionFound = true;
          var outActionTime = window.app.punchActions[i].args['time'];
          secondsWorked += (outActionTime - inActionTime);
          continue;
        }
      }
    }

    window.app.hoursWorked = secondsWorked/(60.0*60.0);
  });
}
