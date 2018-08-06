pragma solidity ^ 0.4.24;

import "browser/BurnablePayment.sol";

contract ToastytradeOfferFactory {
    address public notifyServiceProvider = 0x0;
    uint public notifyServiceFee = 1;

    address[] public toastytradeOffers;

    event OfferCreated(address OfferAddress, address BurnablePaymentAddress, string offerDetails);

    function newToastytradeOffer(address seller, uint autoreleaseInterval, string _offerDetails)
    payable
    external {
        require(msg.value >= notifyServiceFee, "Not enough ether to cover the notify service fee");
        uint valueToForwardToOffer = msg.value - notifyServiceFee;

        ToastytradeOffer offer = (new ToastytradeOffer).value(valueToForwardToOffer)(seller, autoreleaseInterval, _offerDetails);

        emit OfferCreated(address(offer), offer.offerBP(), _offerDetails);

        toastytradeOffers.push(address(offer));

        //send the fee to our server
        notifyServiceProvider.transfer(notifyServiceFee);

        //Make sure there's no leftover ether
        assert(address(this).balance == 0);
    }

}

contract ToastytradeOffer {
    address public offerBP;

    string public offerDetails;

    constructor(address seller, uint autoreleaseInterval, string _offerDetails)
    payable {
        //Prepare vars and create BP
        uint commitThreshold = msg.value / 3;

        offerBP = (new BurnablePayment).value(msg.value)(true, seller, commitThreshold, autoreleaseInterval, "", "");

        offerDetails = _offerDetails;
    }
}
