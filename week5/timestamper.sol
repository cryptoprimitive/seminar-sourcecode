pragma solidity ^0.4.24;

contract Timestamper {
    event Timestamp(address agent, string data, uint time);

    function makeTimestamp(string _data)
    external {
        emit Timestamp(msg.sender, _data, now);
    }
}
