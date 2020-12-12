const Coinflip = artifacts.require("Coinflip");

contract("Coinflip", async function(){
  it("should initialize correctly", async function(){
    let instance = await Coinflip.deployed();
    let message = await instance.getMessage();
    assert(message === "SENT VALUE");
  });
  
});
