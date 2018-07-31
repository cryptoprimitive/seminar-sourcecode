timestamperAddress = "0x7f48971e3FaeeEC254A676280450A21678491b21";
timestamperABI = [
	{
		"constant": false,
		"inputs": [
			{
				"name": "_data",
				"type": "string"
			}
		],
		"name": "makeTimestamp",
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
				"name": "data",
				"type": "string"
			},
			{
				"indexed": false,
				"name": "time",
				"type": "uint256"
			}
		],
		"name": "Timestamp",
		"type": "event"
	}
];
