pragma solidity ^0.4.24;

// Two roles: DepositHolder, DepositSubmitter
// DepositHolder can choose to either confiscate or return the amount deposited.
// DepositHolder must specify the DepsoitSubmitter upon construction.
// DepositSubmitter puts some ether in, and otherwise has no control over the contract.
// If DepositHolder confiscates the deposit, 90% of it is burned.

contract BurnableDepositManager {
    address public DepositHolder;
    address public DepositSubmitter;
    
    event EtherDeposited(uint amount);
    event EtherReturned(uint amount);
    event EtherConfiscated(uint amountBurned, uint amountConfiscated);
    
    // constructor will set DepositHolder as msg.sender,
    // and takes as an argument the intended DepositSubmitter
    constructor(address _DepositSubmitter) {
        DepositHolder = msg.sender;
        
        DepositSubmitter = _DepositSubmitter;
    }
    
    function deposit()
    external
    payable {
        require(msg.sender == DepositSubmitter);
        
        emit EtherDeposited(msg.value);
    }
    
    function returnDeposit()
    external {
        require(msg.sender == DepositHolder);
        
        uint totalBalance = address(this).balance;
        DepositSubmitter.transfer(totalBalance);
        
        emit EtherReturned(totalBalance);
    }
    
    function confiscateDeposit()
    external {
        require(msg.sender == DepositHolder);
        
        uint totalBalance = address(this).balance;
        
        // Burn 90%, confiscate 10%
        uint amountToBurn = (totalBalance*9) / 10;   // * 0.9
        uint amountToConfiscate = totalBalance - amountToBurn;
        
        burn(amountToBurn);
        DepositHolder.transfer(amountToConfiscate);
        
        emit EtherConfiscated(amountToBurn, amountToConfiscate);
    }
    
    function burn(uint amount)
    internal {
        address(0x0).transfer(amount);
    }
}
