pragma solidity ^0.4.24;

contract Forwarder {
    address public target;
    
    constructor(address _target) {
        target = _target;
    }

    function()
    external
    payable {
        assembly {
            /* Copy call data into free memory region. */
            let free_ptr := mload(0x40)
            calldatacopy(free_ptr, 0, calldatasize)

            /* We must explicitly forward ether to the underlying contract as well. */
            let result := call(gas, sload(target_slot), callvalue, free_ptr, calldatasize, 0, 0)
            returndatacopy(free_ptr, 0, returndatasize)

            /* Revert if the call failed, otherwise return the result. */
            if iszero(result) { revert(free_ptr, returndatasize) }
            return(free_ptr, returndatasize)
        }
    }
}

contract Test {
    bool public flag;

    function setFlag()
    external {
        flag = true;
    }
}
