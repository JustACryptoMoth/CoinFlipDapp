var web3 = new Web3(Web3.givenProvider);
var contractInstance;

$(document).ready(function() {
    window.ethereum.enable().then(function(accounts){
      contractInstance = new web3.eth.Contract(window.abi, "0xc22f6f52Ad85613b4a27eD86Dd414Be9952dF3e6", {from: accounts[0]});
      console.log(contractInstance);
    });
    $("#add_data_button").click(inputData)



  });

  function inputData(){
  var bet amount = $("#Bet Amount_input").val();

  var config = {
    value: web3.utils.toWei("1", "ether")
  })

  .on("confirmation", function(confirmationNr){
    console.log(confirmationNr);
  })
  .on("receipt", function(receipt){
    console.log(receipt);
  });

};
