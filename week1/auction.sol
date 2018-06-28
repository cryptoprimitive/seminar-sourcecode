pragma solidity ^0.4.24;

/*
a. Contract that accepts bids from users, and collates them into a list
DONE

b. Auctioneer can endBid(winningBidIterator), transfer the ether in the winning bid to the Auctioneer, and return all other bids to whoever made the bids.

c. Bidders can recall()/cancel() their bid at any time
DONE

d. Auctioneer can only endBid once, for one bid (enfore with states)
*/

// Roles:
//   Auctioneer

// structs
//   Bids


contract Auction {
    //Monday we'll work on...
    address Auctioneer;

    struct Bid {
        address bidderAddress;
        uint amount; // value variables in Solidity are always stored as the wei value
        string extraData;
        bool valid;
    }

    Bid[] public bids;

    function makeBid(string _extraData)
    external
    payable
    returns(uint bidIterator) {
        require(msg.value > 0);
        bids.push(Bid(msg.sender, msg.value, _extraData, true));

        return bids.length - 1;
    }

    function recallBid(uint bidIterator)
    external {
        require(bidIterator < bids.length, "Invalid bidIterator");
        require(msg.sender == bids[bidIterator].bidderAddress, "msg.sender != bidderAddress");
        require(bids[bidIterator].valid, "Bid is invalid; aborting");

        uint amountToSend = bids[bidIterator].amount;
        bids[bidIterator].amount = 0;
        bids[bidIterator].valid = false;
        bids[bidIterator].bidderAddress.transfer(amountToSend);
    }

    //REMOVE after development:
    function getBalance()
    external
    returns(uint balance){
        return address(this).balance;
    }
}
