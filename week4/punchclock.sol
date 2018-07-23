pragma solidity ^0.4.24;

contract Punchclock {
    event PunchEvent(address indexed agent, string indexed action);

    function punch(string _action)
    external {
        emit PunchEvent(msg.sender, _action);
    }
}
