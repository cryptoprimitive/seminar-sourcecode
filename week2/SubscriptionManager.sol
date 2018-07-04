pragma solidity ^0.4.24;

contract SubscriptionManagerFactory {
    address[] public subscriptionManagerAddresses;

    function newSubscriptionManager()
    external
    returns (address) {
        address newSMAddress = (new SubscriptionManager)(msg.sender);

        subscriptionManagerAddresses.push(newSMAddress);

        return newSMAddress;
    }
}

contract SubscriptionManager {
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
    external
    onlyOwner() {
        require(amount <= address(this).balance, "Requested withdraw amount exceeds SubscriptionManager balance");
        Owner.transfer(amount);

        emit Withdraw(amount);
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
