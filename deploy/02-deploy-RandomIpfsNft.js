const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const { ethers, network } = require("hardhat");
const { verify } = require("../utils/verify");
const {
  storeImages,
  storeTokenUriMetadata,
} = require("../utils/uploadToPinata");

const FUND_AMOUNT = "1000000000000000000000";
const imagesLocation = "./images/randomNft/";

const metaDataTemplate = {
  name: "",
  description: "",
  image: "",
  attributes: [
    {
      trait_types: "Cuteness",
      value: 100,
    },
  ],
};

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  let vrfCoordinatorV2address, subscriptionId, vrfCoordinatorV2Mock;

  if (developmentChains.includes(network.name)) {
    vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
    vrfCoordinatorV2address = vrfCoordinatorV2Mock.address;

    const tx = await vrfCoordinatorV2Mock.createSubscription();
    const txReceipt = await tx.wait(1);
    subscriptionId = txReceipt.events[0].args.subId;

    await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT);
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

  //once we got tokenUris ,no need to run handleTokenUris();so we make UPLOAD_TO_PINATA false
  tokenUris = [
    "ipfs://QmWftbwkJZHAA1mVBxJ1Gn3EPzGc8qvcWz5V7ZHpGcroM6",
    "ipfs://QmSdKZHnStsM6g2QmX6x1qC1mjGjPhaw61CzUx4B3EwRsw",
    "ipfs://QmQ1qRt7GWNq1tHVmyir3FJqfjPjdT2EbyYs4VNUbKg541",
  ];

  const args = [
    vrfCoordinatorV2address,
    networkConfig[chainId].gasLane,
    subscriptionId,
    networkConfig[chainId].callbackGasLimit,
    tokenUris,
    networkConfig[chainId].mintFee,
  ];

  const randomIpfsNft = await deploy("RandomIpfsNft", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  if (developmentChains.includes(network.name)) {
    await vrfCoordinatorV2Mock.addConsumer(
      subscriptionId,
      randomIpfsNft.address
    );
  }
  if (!developmentChains.includes(network.name)) {
    console.log("Verifying...");
    await verify(randomIpfsNft.address, args);
  }
};

async function handleTokenUris() {
  tokenUris = [];
  //store the image in ipfs
  //store the metadata in ipfs

  const { responses: imageUploadResponses, files } = await storeImages(
    imagesLocation
  );

  for (imageUploadResponseIndex in imageUploadResponses) {
    //create metadata
    //upload metadata
    let tokenUriMetadata = { ...metaDataTemplate };

    tokenUriMetadata.name = files[imageUploadResponseIndex].replace(".png", "");
    tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!`;
    tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`;

    console.log(`Uploading ${tokenUriMetadata.name}...`);
    //store the json to pinata/ipfs
    const metadataUploadResponse = await storeTokenUriMetadata(
      tokenUriMetadata
    );

    tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`);
  }
  console.log("TokenUris uploaded:");
  console.log(tokenUris);
  return tokenUris;
}

module.exports.tags = ["all", "randomipfs", "main"];
