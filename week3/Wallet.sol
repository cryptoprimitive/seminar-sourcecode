pragma solidity ^0.4.24;

contract WalletFactory {
    address[] public walletAddresses;
    address[] public billableWalletAddresses;
    address[] public timeLockWalletAddresses;

    function newWallet()
    external
    returns (address) {
        address newAddress = (new Wallet)(msg.sender);

        walletAddresses.push(newAddress);

        return newAddress;
    }

    function newBillableWallet()
    external
    returns (address) {
        address newAddress = (new BillableWallet)(msg.sender);

        billableWalletAddresses.push(newAddress);

        return newAddress;
    }

    function newTimeLockWallet(uint _unlockTime)
    external
    returns (address) {
        address newAddress = (new TimeLockWallet)(msg.sender, _unlockTime);

        timeLockWalletAddresses.push(newAddress);

        return newAddress;
    }
}

contract Wallet {
    address public Owner;
    modifier onlyOwner() {
        require(msg.sender == Owner);
        _;
    }

    constructor(address _Owner) {
        Owner = _Owner;
    }

    event Deposit(address from, uint amount);
    event Withdraw(uint amount);


    function()
    external
    payable {
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint amount)
    public
    onlyOwner {
        require(amount <= address(this).balance, "Requested withdraw amount exceeds balance");
        Owner.transfer(amount);

        emit Withdraw(amount);
    }
}

contract BillableWallet is Wallet {
    constructor(address _Owner)
    Wallet(_Owner) {

    }

    event BillRateSet(address billerAddress, uint newRate);
    event BillProcessed(address billerAddress, uint amountBilled);
    //TODO: BillProcessed should also log the rate, so billers can more easily verify
    //      they've gotten what they're owed

    struct Biller {
        uint rate; // wei per second
        uint lastBillTime;
    }
    mapping (address => Biller) public billers;

    function processBill(address billerAddress)
    internal {
        if (billers[billerAddress].rate != 0) {
            uint billableTime = now - billers[billerAddress].lastBillTime;
            uint billableAmount = billableTime * billers[billerAddress].rate;

            require(billableAmount <= address(this).balance, "Bill amount exceeds balance");
            billerAddress.transfer(billableAmount);
        }

        billers[billerAddress].lastBillTime = now;

        emit BillProcessed(billerAddress, billableAmount);
    }

    function callBill()
    external {
        address billerAddress = msg.sender;
        require(billers[billerAddress].rate > 0, "You are not approved to bill.");

        processBill(billerAddress);
    }

    function setBillRate(address billerAddress, uint newRate)
    external
    onlyOwner() {
        processBill(billerAddress);

        billers[billerAddress].rate = newRate;

        emit BillRateSet(billerAddress, newRate);
    }
}

contract TimeLockWallet is Wallet {
    uint public unlockTime;

    constructor(address _Owner, uint _unlockTime)
    Wallet(_Owner) {
        require(_unlockTime > now);
        unlockTime = _unlockTime;
    }

    function withdraw(uint amount)
    public {
        require(now > unlockTime, "The time lock has not yet been released");

        Wallet.withdraw(amount);
    }
}
