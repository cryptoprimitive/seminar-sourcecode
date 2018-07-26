pragma solidity ^0.4.24;

contract Punchclock {
    event PunchEvent(address agent, string action, uint time);

    function punch(string _action)
    external {
        emit PunchEvent(msg.sender, _action, now);
    }
}
