pragma solidity ^ 0.4.24;

import "browser/BurnablePayment.sol";

//Where/how do we store all the extra data?
//  - fee (%?)
//  - deposit deadline
//  - banks
//  - email

contract ToastytradeOfferFactory {
    address[] public toastytradeOffers;

    event OfferCreated(address OfferAddress, address BurnablePaymentAddress, string offerDetails);

    function newToastytradeOffer(address seller, uint autoreleaseInterval, string _offerDetails)
    payable
    external {
        ToastytradeOffer offer = (new ToastytradeOffer).value(msg.value)(seller, autoreleaseInterval, _offerDetails);

        emit OfferCreated(address(offer), offer.offerBP(), _offerDetails);

        toastytradeOffers.push(address(offer));
    }

}

contract ToastytradeOffer {
    address public notifyServiceProvider = 0x0;
    uint public notifyServiceFee = 1;

    address public offerBP;

    string public offerDetails;

    //offerDetails will be json-encoded, and stores the following info:
    //  - fee (%?)
    //  - deposit deadline
    //  - banks
    //  - email

    constructor(address seller, uint autoreleaseInterval, string _offerDetails)
    payable {
        //Prepare vars and create BP
        uint commitThreshold = msg.value / 3;

        uint valueToForwardToBP = msg.value - notifyServiceFee;

        offerBP = (new BurnablePayment).value(valueToForwardToBP)(true, seller, commitThreshold, autoreleaseInterval, "", "");

        offerDetails = _offerDetails;

        //send a fee to our server
        notifyServiceProvider.transfer(notifyServiceFee);

        //Make sure there's no leftover ether
        assert(address(this).balance == 0);
    }
}
