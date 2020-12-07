pragma solidity 0.5.12;

contract Coinflip {
  string message = "Coinflip";

  function getMessage() public view returns (string memory) {
    return message;
  }
  function setMessage(string memory newMessage) public payable {
    message = newMessage;
  }
}
