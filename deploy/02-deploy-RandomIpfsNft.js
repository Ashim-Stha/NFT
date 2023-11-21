const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const { ethers, network } = require("hardhat");
const { verify } = require("../utils/verify");
const { storeImages } = require("../utils/uploadToPinata");

const imagesLocation = "./images/randomNft/";

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  let vrfCoordinatorV2address, subscriptionId;

  if (developmentChains.includes(network.name)) {
    const vrfCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    );
    vrfCoordinatorV2address = vrfCoordinatorV2Mock.address;

    const tx = await vrfCoordinatorV2Mock.createSubscription();
    const txReceipt = await tx.wait(1);
    subscriptionId = txReceipt.events[0].args.subId;
  } else {
    vrfCoordinatorV2address = networkConfig[chainId].vrfCoordinatorV2;
    subscriptionId = networkConfig[chainId].subscriptionId;
  }

  log("-------------------------");

  //get the ipfs hashes of our images
  let tokenUris;
  if (process.env.UPLOAD_TO_PINATA == "true") {
    tokenUris = await handleTokenUris();
  }

  await storeImages(imagesLocation);
  // const args = [
  //   vrfCoordinatorV2address,
  //   networkConfig[chainId].gasLane,
  //   subscriptionId,
  //   networkConfig[chainId].callbackGasLimit,
  //   ,
  //   networkConfig[chainId].mintFee,
  // ];

  // const randomIpfsNft = await deploy("RandomIpfsNft", {
  //   from: deployer,
  //   args: args,
  //   log: true,
  //   waitConfirmations: network.config.blockConfirmations || 1,
  // });
};

async function handleTokenUris() {
  tokenUris = [];
  return tokenUris;
}

module.exports.tags = ["all", "randomipfs", "main"];
