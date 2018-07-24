import json, pprint, binascii
from web3 import Web3

address = "0x51b7b23A7F79200716F6F0A36C9D91e21cd5290a"
abi = json.load(open("clockpunch_abi.json",'r'))

w3 = Web3(Web3.WebsocketProvider("wss://gladly-golden-parrot.quiknode.io/8959339e-f0ab-4403-876f-1aed9422a44f/xh9aJBYpYQHEhu6q8jQrkA==/"))
#w3 = Web3(Web3.HTTPProvider("https://mainnet.infura.io/fUjKw6wcuY9M21d1yhYS"))

print("At block", w3.eth.blockNumber)

contract = w3.eth.contract(abi = abi, address = address)

employeeAddress = "0x95615F991C588D81695722Be9048f913E6B22b0d"

clockFilter = contract.events.PunchEvent.createFilter(fromBlock=6000000, argument_filters={'agent':employeeAddress})

#clockOutFilter = contract.events.PunchEvent.createFilter(fromBlock=6000000, argument_filters={'agent':employeeAddress, 'action':'out'})

clockActions = clockFilter.get_all_entries()

for clockAction in clockActions:
    print((clockAction['args']['action']))

#pprint.pprint(clockActions)
