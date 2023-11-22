// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract Encoding {
    // function combineStrings() public pure returns(bytes memory){
    //     return  abi.encodePacked('Hi','Hello');
    // }

    function combineStrings() public pure returns (string memory) {
        return string(abi.encodePacked("Hi", "Hello"));
    }

    function encodeNumber() public pure returns (bytes memory) {
        bytes memory number = abi.encode(1);
        return number;
    }

    function encodeString() public pure returns (bytes memory) {
        bytes memory someString = abi.encode("some string");
        return someString;
    }

    //encodePacked is kind of compressed version
    function encodeStringPacked() public pure returns (bytes memory) {
        bytes memory someString = abi.encodePacked("some string");
        return someString;
    }

    function encodeStringBytes() public pure returns (bytes memory) {
        bytes memory someString = bytes("some string");
        return someString;
    }

    function decodeString() public pure returns (string memory) {
        string memory someString = abi.decode(encodeString(), (string));
        return someString;
    }

    function multiEncodeString() public pure returns (bytes memory) {
        bytes memory someString = abi.encode("some string", "another string");
        return someString;
    }

    function multiDecodeString()
        public
        pure
        returns (string memory, string memory)
    {
        (string memory someString, string memory otherString) = abi.decode(
            multiEncodeString(),
            (string, string)
        );

        return (someString, otherString);
    }

    function multiEncodeStringPacked() public pure returns (bytes memory) {
        bytes memory someString = abi.encodePacked(
            "some string",
            "another string"
        );
        return someString;
    }

    //but decode doesnot works on multiencoding
    function multiDecodeStringPacked()
        public
        pure
        returns (string memory, string memory)
    {
        (string memory someString, string memory otherString) = abi.decode(
            multiEncodeStringPacked(),
            (string, string)
        );

        return (someString, otherString);
    }

    //we can do instead
    function multiStringCastPacked() public pure returns (string memory) {
        string memory someString = string(multiEncodeStringPacked());

        return someString;
    }

    // Remeber how before I said you always need two things to call a contract:
    // 1. ABI
    // 2. Contract Address?
    // Well... That was true, but you don't need that massive ABI file. All we need to know is how to create the binary to call
    // the functions that we want to call.

    // Solidity has some more "low-level" keywords, namely "staticcall" and "call". We've used call in the past, but
    // haven't really explained what was going on. There is also "send"... but basically forget about send.

    // call: How we call functions to change the state of the blockchain.
    // staticcall: This is how (at a low level) we do our "view" or "pure" function calls, and potentially don't change the blockchain state.

    // When you call a function, you are secretly calling "call" behind the scenes, with everything compiled down to the binary stuff
    // for you. Flashback to when we withdrew ETH from our raffle:

    function withdraw(address recentWinner) public {
        (bool success, ) = recentWinner.call{value: address(this).balance}("");
        require(success, "Transfer Failed");
    }

    // Remember this?
    // - In our {} we were able to pass specific fields of a transaction, like value.
    // - In our () we were able to pass data in order to call a specific function - but there was no function we wanted to call!
    // We only sent ETH, so we didn't need to call a function!
    // If we want to call a function, or send any data, we'd do it in these parathesis!
}
