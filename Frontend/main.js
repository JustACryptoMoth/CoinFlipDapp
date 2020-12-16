const contractId = CONTRACT_ID;
const abi = ABI;
const web3 = new Web3(Web3.givenProvider);

let playerAddress;
let contractInstance;

$(document).ready(() => {
	window.ethereum.enable().then((accounts) => {

		playerAddress = accounts[0];
		contractInstance = new web3.eth.Contract(abi, contractId, {from: playerAddress});
		displayDappBalance();
		displayPlayerBalance();
		$('#wager_button').click(inputData);
	});
});

function displayDappBalance() {
	contractInstance.methods.getDappBalance().call().then((res) => {
		$('#dapp_balance_output').text(web3.utils.fromWei(res, "ether"));
	});
}

function displayPlayerBalance() {
	web3.eth.getBalance(playerAddress).then((res) => {
		$('#player_balance_output').text(web3.utils.fromWei(res, "ether"))
	});
}

function inputData() {
	let config = {
		value: web3.utils.toWei($('#wager_input').val(), 'ether')
	};
	let flipValue = $('#inlineFormCustomSelect').val() === 'Heads' ? true : false;

	contractInstance.methods.flip(flipValue).send(config)
	.on('transactionHash', (hash) => {
		// console.log('1: ', hash);
	})
	.on('confirmation', (confirmationNr) => {
		// console.log('2: ', confirmationNr);
	})
	.on('receipt', (receipt) => {
		let result = receipt.events.flipResult.returnValues.value === '1' ? 'Heads' : 'Tails';
		let waitingPeriod;
		let n = 4;

		waitingPeriod = setInterval(() => {
			$('#result').text(n-=1);
		}, 1000);

		setTimeout(() => {
			if (receipt.events.flipResult.returnValues.result === true) {
				$('#result').text(result + '... You Won!')
			} else {
				$('#result').text(result + '... You Lost!')
			}
			clearInterval(waitingPeriod);
			displayDappBalance();
			displayPlayerBalance();
		}, 4000);
	});
}
