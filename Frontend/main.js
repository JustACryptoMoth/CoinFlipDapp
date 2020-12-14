var web3 = new Web3(Web3.givenProvider);
var contractInstance;

$(document).ready(function() {
  //THIS BRINGS UP METAMASK
    window.ethereum.enable().then(function(accounts){
        contractInstance = new web3.eth.Contract(abi, "0xcbB04FE63A98C9adBf7Ca158143eB7Db4559881D", {from: accounts[0]});
        console.log(contractInstance);
    });
    $("#bet_button_heads").click(inputData)
    $("#bet_button_tails").click(inputData)
    $("#get_data_button").click(fetchAndDisplay)
});

function inputData(){

  var config = {
    value: web3.utils.toWei("1", "ether")
  }

  contractInstance.methods.play(1).send(config)
  .on("transactionHash", function(hash){
      console.log(hash);
  })
  .on("confirmation", function(confirmationNr){
      console.log(confirnationNr);
  })
  .on("receipt", function(receipt){
    console.log(receipt.events.bet.returnValues[0]);

    if (receipt.events.bet.returnValues[0] == true)  {
      $("#message_output").text("You won 1 Ether!");
      party.screen();
    } else {
      $("#message_output").text("You lost 1 Ether!");
    }
  })
}

function fetchAndDisplay(){
  contractInstance.methods.getPerson().call().then(function(res){
    $("#name_output").text(res.name);
    $("#age_output").text(res.age);
    $("#height_output").text(res.height);

  })

}
