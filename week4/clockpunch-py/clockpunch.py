import json, pprint, binascii, sys
from web3 import Web3

from contractinfo import clockpunchAddress, clockpunchABI

#w3 = Web3(Web3.WebsocketProvider("wss://gladly-golden-parrot.quiknode.io/8959339e-f0ab-4403-876f-1aed9422a44f/xh9aJBYpYQHEhu6q8jQrkA==/"))
w3 = Web3(Web3.HTTPProvider("https://ropsten.infura.io/fUjKw6wcuY9M21d1yhYS"))

print("At block", w3.eth.blockNumber)

contract = w3.eth.contract(abi = clockpunchABI, address = clockpunchAddress)

priv = "605faf86831b47801de96d9b8998e7f2512b953f83655e2a24cce4f1936d1ba5"
userAddress = "0x82A3aE9989DF4a175cb2a39B26bb79cED17d943A"

print(w3.fromWei(w3.eth.getBalance(userAddress), 'ether'))

def callPunchWithString(s):
    tx = {'value': 0,
          'nonce': w3.eth.getTransactionCount(userAddress),
          'chainId': 3, # 3 = Ropsten
          'gasPrice': w3.toWei(20, 'gwei')
          }

    tx['gas'] = contract.functions.punch(s).estimateGas()*2

    builtTx = contract.functions.punch(s).buildTransaction(tx)
    builtTx['gasPrice'] = w3.toWei(20, 'gwei')

    signed = w3.eth.account.signTransaction(builtTx, priv)

    #print(builtTx)
    #print(signed.rawTransaction)

    return w3.eth.sendRawTransaction(signed.rawTransaction)

def clockIn():
    return w3.toHex(callPunchWithString("in"))

def clockOut():
    return w3.toHex(callPunchWithString("out"))

if __name__ == "__main__":
    if len(sys.argv) >= 2:
        txid = callPunchWithString(sys.argv[1])
        print("Waiting to mine:", w3.toHex(txid))
        receipt = w3.eth.waitForTransactionReceipt(txid)
        print("Mined!")
