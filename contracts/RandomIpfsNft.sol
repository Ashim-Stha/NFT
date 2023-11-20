//SPDX-License-Identifier:MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract RandomIpfsNft is VRFConsumerBaseV2, ERC721 {
    //when we mint a nft,we trigger a chainlink vrf call to get a random number
    //using that num,we get a random nft
    // let say pug;very rare,shiba inu;sort of rare,st. bernard;common

    //let users have to pay to mint nft
    //owner of contract can withdraw eth

    //Chainlink VRF variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinatorAddress;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;
    uint32 private immutable i_callbackGasLimit;

    //VRF helpers
    mapping(uint256 => address) public s_requestIdToSender;

    //NFT variables
    uint256 public s_tokenCounter;

    constructor(
        address vrfCoordinatorAddress,
        bytes32 gasLane,
        uint64 subscriptionId,
        uint32 callbackGasLimit
    )
        VRFConsumerBaseV2(vrfCoordinatorAddress)
        ERC721("Random IPFS NFT", "RIN")
    {
        i_vrfCoordinatorAddress = VRFCoordinatorV2Interface(
            vrfCoordinatorAddress
        );
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
    }

    function requestNft() public returns (uint256 requestId) {
        requestId = i_vrfCoordinatorAddress.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );

        s_requestIdToSender[requestId] = msg.sender;
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        address nftOwner = s_requestIdToSender[requestId];
        uint256 newTokenCounter = s_tokenCounter;
        _safeMint(nftOwner, newTokenCounter);
    }

    function tokenURI(uint256) public view override returns (string memory) {}
}
