const Coinflip = artifacts.require("Coinflip");

module.exports = function(deployer, network, accounts){
  deployer.deploy(Coinflip);
  let contract = await Coinflip.deployed();
await contract.setMessage('new message',{from:accounts[0], value:100000000});
let msg = await contract.getMessage();
console.log(msg)
};
