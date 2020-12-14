pragma solidity 0.5.12;

contract Coinflip {

function flip() public payable costs(0.01 ether) returns(bool){
      require(address(this).balance >= msg.value, "The contract hasn't enought funds");
      bool success;
      if(now % 2 == 0){
          ContractBalance += msg.value;
          success = false;
      }
      else if(now % 2 == 1){
          ContractBalance -= msg.value;
          msg.sender.transfer(msg.value * 2);
          success = true;
      }

      //assert(ContractBalance == address(this).balance);
      emit bet(msg.sender, msg.value, success);
      return success;
    }

    // Function to Withdraw Funds
    function withdrawAll() public onlyContractOwner returns(uint){
        msg.sender.transfer(address(this).balance);
        assert(address(this).balance == 0);
        return address(this).balance;

    }

        // Function to get the Balance of the Contract
   function getBalance() public view returns (address, uint, uint) {
       return (address(this), address(this).balance, ContractBalance);
   }



  function get () public view returns (uint) {
      return 1;
}

// Fund the Contract
  function fundContract() public payable onlyContractOwner returns(uint){
      require(msg.value != 0);
      //ContractBalance += msg.value;
      emit funded(msg.sender, msg.value);
      //assert(ContractBalance == address(this).balance);
      return msg.value;

}

}
