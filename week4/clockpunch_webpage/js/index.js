window.onload = function() {

  window.app = new Vue({
    el: '#app',
    data: {
      userAddressOutput: "Loading...",
      networkIDOutput: "Loading...",
      transactions: [],
      agentAddressInput: "",
      punchActionsForAgent: [],
      secondsWorked: 0,
      punchActionOutputVars: []
    },
    computed: {
      clockpunchContractInstance: function() {
        return web3.eth.contract(clockpunchABI).at(clockpunchAddress)
      },
      humanizedTimeWorked: function() {
        return humanizeDuration(this.secondsWorked*1000, {largest: 2});
      }
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

  //console.log(getAllPunchEvents());
}

function getPunchEventsFromAgent() {
  var timestampFormatString = "YYYY.MM.DD HH:mm:ss";

  eventFilter = window.app.clockpunchContractInstance.PunchEvent({}, {fromBlock: 3700000, toBlock:'latest'});

  eventFilter.get( (err, res) => {
    if (err) console.log("error in event fetch:", err);
    else {
      window.allPunchEvents = res;
    }

    window.app.punchActionsForAgent = [];
    for (var i=0; i<window.allPunchEvents.length; i++) {
      if (window.allPunchEvents[i].args['agent'].toLowerCase() == window.app.agentAddressInput.toLowerCase()) {
        window.app.punchActionsForAgent.push(allPunchEvents[i])
      }
    }

    var secondsWorked = 0;

    var inActionFound = false;
    var inActionTime = 0;
    var outActionFound = false;

    window.app.punchActionOutputVars = []

    for (var i=0; i<window.app.punchActionsForAgent.length; i++) {
      if (inActionFound && outActionFound) {
        inActionFound = false;
        inActionTime = 0;
        outActionFound = false;
      }
      if (!inActionFound && !outActionFound && window.app.punchActionsForAgent[i].args['action'] == "in") {
        inActionFound = true;
        inActionTime = window.app.punchActionsForAgent[i].args['time'].toNumber();
        window.app.punchActionOutputVars.push({time: inActionTime,
                                               action: "in",
                                               secondsAdded: 0,
                                               humanizedTimeAdded: humanizeDuration(0, {largest:2}),
                                               humanizedTimestamp: moment.unix(inActionTime).format(timestampFormatString)});
      }
      else if (inActionFound && !outActionFound && window.app.punchActionsForAgent[i].args['action'] == "out") {
        outActionFound = true;
        var outActionTime = window.app.punchActionsForAgent[i].args['time'].toNumber();
        var secondsToAdd = (outActionTime - inActionTime)
        secondsWorked += secondsToAdd;
        window.app.punchActionOutputVars.push({time: outActionTime,
                                               action: "out",
                                               secondsAdded: secondsToAdd,
                                               humanizedTimeAdded: humanizeDuration(secondsToAdd*1000, {largest:2}),
                                               humanizedTimestamp: moment.unix(outActionTime).format(timestampFormatString)});
      }
      else {
        console.log(window.app.punchActionsForAgent[i]);
        var actionTime = window.app.punchActionsForAgent[i].args['time'].toNumber()
        window.app.punchActionOutputVars.push({time: actionTime,
                                               action: window.app.punchActionsForAgent[i].args['action'],
                                               secondsAdded: 0,
                                               humanizedTimeAdded: humanizeDuration(0, {largest:2}),
                                               humanizedTimestamp: moment.unix(actionTime).format(timestampFormatString)});
      }
    }

    window.app.secondsWorked = secondsWorked;
  });
}
