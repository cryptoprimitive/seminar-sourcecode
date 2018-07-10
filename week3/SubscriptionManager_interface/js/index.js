window.onload = function() {
  window.app = new Vue({
    el: '#app',
    data: {
      userAddressOutput: "Loading...``",
      networkIDOutput: "Loading...",
      FactoryAddressOutput: "Loading...",
      transactions: [],
      WalletAddressInput: "",
      WalletOwner: "Loading...",
      /*billerAddressInput: "",
      billingRateInput: "",
      billingRateOutput: "Loading...",
      lastBilledOutput: "Loading...",
      userCanBill: false*/
    },
    computed: {
      WalletContractInstance: function() {
        return web3.eth.contract(WalletABI).at(this.WalletAddressInput);
      },
      userIsOwner: function() {
        return (web3.eth.accounts[0] == this.WalletOwner);
      }
    },
    watch: {
      WalletContractInstance: function() {
        // Update address QR code
        $("#WalletAddressQR").html("");
        $("#WalletAddressQR").qrcode(this.WalletAddressInput);

        // Update owner output
        this.WalletContractInstance.Owner({}, function(err, res) {
          console.log(res);
          window.app.WalletOwner = res;
        });

        // Update userCanBill
        /*this.WalletContractInstance.billers(this.userAddressOutput, function(err, res) {
          billingRateInWeiPerSecond = res[0];

          window.app.userCanBill = (billingRateInWeiPerSecond > 0);
        });*/
      },
      /*billerAddressInput: function() {
        this.WalletContractInstance.billers(this.billerAddressInput, function(err, res) {
          billingRateInWeiPerSecond = res[0];
          lastBilledTimestamp = res[1];

          billingRateInEthPerSecond = web3.fromWei(billingRateInWeiPerSecond, 'ether');
          billingRateInEthPerMonth = billingRateInEthPerSecond*(60*60*24*30);

          window.app.billingRateOutput = Number(billingRateInEthPerMonth);
          window.app.lastBilledOutput = Number(lastBilledTimestamp);
        })
      }*/
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

  app.FactoryAddressOutput = WalletFactoryAddress;

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

  window.WalletFactoryInstance = web3.eth.contract(WalletFactoryABI).at(WalletFactoryAddress);
}

function callNewWallet() {
  txObject = {gas: 600000, gasPrice: web3.toWei(20, 'gwei')};
  console.log(WalletFactoryAddress);
  window.WalletFactoryInstance.newWallet(txObject, function(err, res) {
    if (err) {
      console.log(err);
    }
    else {
      app.transactions.push("Create Basic Wallet contract tx: " + res);
    }
  });
}
function callNewBillableWallet() {
  txObject = {gas: 600000, gasPrice: web3.toWei(20, 'gwei')};
  window.WalletFactoryInstance.newBillableWallet(txObject, function(err, res) {
    if (err) {
      console.log(err);
    }
    else {
      app.transactions.push("Create Billable Wallet contract tx: " + res);
    }
  });
}
function callNewTimeLockWallet() {
  txObject = {gas: 600000, gasPrice: web3.toWei(20, 'gwei')};
  window.WalletFactoryInstance.newTimeLockWallet(prompt("what time (unix timextamp) should the wallet be unlocked?"), txObject, function(err, res) {
    if (err) {
      console.log(err);
    }
    else {
      app.transactions.push("Create Time-Locked Wallet contract tx: " + res);
    }
  });
}

function triggerDeposit() {
  depositAmountInEth = prompt("Deposit how much? (ETH)");

  depositAmountInWei = web3.toWei(depositAmountInEth, 'ether');

  txObject = {value: depositAmountInWei,
              to: window.app.WalletAddressInput,
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
  window.app.WalletContractInstance.withdraw(withdrawAmountInWei, txObject, function(err, res) {
    if (err) {
      console.log("Error calling withdraw: " + err);
    }
    else {
      app.transactions.push("withdraw tx: " + res);
    }
  });
}

/*function callCallBill() {
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
}*/
