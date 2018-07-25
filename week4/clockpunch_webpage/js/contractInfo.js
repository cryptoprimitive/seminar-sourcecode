clockpunchAddress = "0x863CbdDd1b7f3779Ced3E05bDDB22F6FbDD5DE29";
clockpunchABI = [
	{
		"constant": false,
		"inputs": [
			{
				"name": "_action",
				"type": "string"
			}
		],
		"name": "punch",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "agent",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "action",
				"type": "string"
			},
			{
				"indexed": false,
				"name": "time",
				"type": "uint256"
			}
		],
		"name": "PunchEvent",
		"type": "event"
	}
];
