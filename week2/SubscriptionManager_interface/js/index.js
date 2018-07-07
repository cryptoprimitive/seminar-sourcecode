window.onload = function() {
  window.app = new Vue({
    el: '#app',
    data: {
      userAddressOutput: "Loading...",
      networkIDOutput: "Loading...",
      SMFactoryAddressOutput: "Loading...",
      transactions: [],
      SMAddressInput: "",
      SMOwner: "Loading...",
      billerAddressInput: "",
      billingRateInput: "",
      billingRateOutput: "Loading...",
      lastBilledOutput: "Loading...",
      userCanBill: false
    },
    computed: {
      SMContractInstance: function() {
        return web3.eth.contract(SMABI).at(this.SMAddressInput);
      },
      userIsOwner: function() {
        return (web3.eth.accounts[0] == this.SMOwner);
      }
    },
    watch: {
      SMContractInstance: function() {
        // Update address QR code
        $("#SMAddressQR").html("");
        $("#SMAddressQR").qrcode(this.SMAddressInput);

        // Update owner output
        this.SMContractInstance.Owner({}, function(err, res) {
          console.log(res);
          window.app.SMOwner = res;
        });

        // Update userCanBill
        this.SMContractInstance.billers(this.userAddressOutput, function(err, res) {
          billingRateInWeiPerSecond = res[0];

          window.app.userCanBill = (billingRateInWeiPerSecond > 0);
        });
      },
      billerAddressInput: function() {
        this.SMContractInstance.billers(this.billerAddressInput, function(err, res) {
          billingRateInWeiPerSecond = res[0];
          lastBilledTimestamp = res[1];

          billingRateInEthPerSecond = web3.fromWei(billingRateInWeiPerSecond, 'ether');
          billingRateInEthPerMonth = billingRateInEthPerSecond*(60*60*24*30);

          window.app.billingRateOutput = Number(billingRateInEthPerMonth);
          window.app.lastBilledOutput = Number(lastBilledTimestamp);
        })
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

  app.SMFactoryAddressOutput = SMFactoryAddress;

  // window.contractInstance.DepositHolder({}, function(err, res) {
  //   $('#DepositHolderOutput').text(res);
  // });
  // window.contractInstance.DepositSubmitter({}, function(err, res) {
  //   $('#DepositSubmitterOutput').text(res);
  // });
  // web3.eth.getBalance(contractAddress, function(err, res) {
  //   weiValue = res;
  //   etherValue = web3.fromWei(res, 'ether');
  //   $('#DepositBalanceOutput').text(etherValue.toString() + " ETH");
  // });

  window.SMFactoryInstance = web3.eth.contract(SMFactoryABI).at(SMFactoryAddress);
}

function callNewSubscriptionManager() {
  txObject = {gas: 600000, gasPrice: web3.toWei(20, 'gwei')};
  window.SMFactoryInstance.newSubscriptionManager(txObject, function(err, res) {
    if (err) {
      console.log(err);
    }
    else {
      app.transactions.push("Create SM contract tx: " + res);
    }
  });
}

function triggerDeposit() {
  depositAmountInEth = prompt("Deposit how much? (ETH)");

  depositAmountInWei = web3.toWei(depositAmountInEth, 'ether');

  txObject = {value: depositAmountInWei,
              to: window.app.SMAddressInput,
              gasPrice: web3.toWei(10, 'gwei')};

  web3.eth.sendTransaction(txObject, function(err, res) {
    if (err) {
      console.log("Error depositing ether: " + err);
    }
    else {
      app.transactions.push("deposit tx: " + res);
    }
  });
}

function triggerWithdraw() {
  withdrawAmountInEth = prompt("Withdraw how much? (ETH)");

  withdrawAmountInWei = web3.toWei(withdrawAmountInEth, 'ether');

  txObject = {gas: 600000, gasPrice: web3.toWei(10, 'gwei')};
  window.app.SMContractInstance.withdraw(withdrawAmountInWei, txObject, function(err, res) {
    if (err) {
      console.log("Error calling withdraw: " + err);
    }
    else {
      app.transactions.push("withdraw tx: " + res);
    }
  });
}

function callCallBill() {
  txObject = {gas: 600000, gasPrice: web3.toWei(10, 'gwei')};
  window.app.SMContractInstance.callBill(txObject, function(err, res) {
    if (err) {
      console.log("Error calling callBill: " + err);
    }
    else {
      app.transactions.push("callBill tx: " + res);
    }
  });
}

function callSetBillRate() {
  billerAddress = window.app.billerAddressInput;

  billingRateInEthPerMonth = web3.toBigNumber(prompt("New Billing Rate (Eth per 30 days)"));
  billingRateInWeiPerMonth = web3.toWei(billingRateInEthPerMonth, 'ether');
  billingRateInWeiPerSecond = billingRateInWeiPerMonth/(30*24*60*60);

  txObject = {gas: 600000, gasPrice: web3.toWei(10, 'gwei')};
  window.app.SMContractInstance.setBillRate(billerAddress, billingRateInWeiPerSecond, txObject, function(err, res) {
    if (err) {
      console.log("Error calling setBillRate: " + err);
    }
    else {
      app.transactions.push("setBillRate tx: " + res);
    }
  });
}
