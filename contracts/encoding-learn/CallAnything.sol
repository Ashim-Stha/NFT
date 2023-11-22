// SPDX-License-Identifier: MIT

// In order to call a function using only the data field of call, we need to encode:
// The function name
// The parameters we want to add
// Down to the binary level

// Now each contract assigns each function it has a function ID. This is known as the "function selector".
// The "function selector" is the first 4 bytes of the function signature.
// The "function signature" is a string that defines the function name & parameters.
// Let's look at this

pragma solidity ^0.8.7;

contract CallAnything {
    address public s_address;
    uint256 public s_amount;

    function transfer(address addr, uint256 amt) public {
        s_address = addr;
        s_amount = amt;
    }

    function getSelecterOne() public pure returns (bytes4 selector) {
        selector = bytes4(keccak256(bytes("transfer(address,uint256)")));
    }

    function getDataToCallTransfer(
        address addr,
        uint256 amt
    ) public pure returns (bytes memory) {
        return abi.encodeWithSelector(getSelecterOne(), addr, amt);
    }

    function callTransferFunctionDirectly(
        address addr,
        uint256 amt
    ) public returns (bytes4, bool) {
        (bool success, bytes memory returnData) = address(this).call(
            getDataToCallTransfer(addr, amt)
        );
        return (bytes4(returnData), success);
    }

    function callTransferFunctionDirectlySignature(
        address addr,
        uint256 amt
    ) public returns (bytes4, bool) {
        (bool success, bytes memory returnData) = address(this).call(
            abi.encodeWithSignature("transfer(address,uint256)", addr, amt)
        );
        return (bytes4(returnData), success);
    }
}
