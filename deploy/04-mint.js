const { ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

module.exports = async function ({ getNamedAccounts }) {
  const { deployer } = await getNamedAccounts();

  //BasicNft
  const basicNft = await ethers.getContract("BasicNft", deployer);
  const basicMintTx = await basicNft.mintNft();
  await basicMintTx.wait(1);
  console.log(`Basic NFT index 0 has tokenUri:${await basicNft.tokenUri(0)}`);

  //RandomIpfsNft
  const randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer);
  const mintFee = await randomIpfsNft.getMintFee();

  await new Promise(async (resolve, reject) => {
    setTimeout(resolve, 300000); //5mins
    randomIpfsNft.once("NftMinted", async function () {
      resolve();
    });

    const randomIpfsNftMintTx = await randomIpfsNft.requestNft({
      value: mintFee,
    });
    const randomIpfsNftMintTxReceipt = await randomIpfsNftMintTx.wait(1);

    if (developmentChains.includes(network.name)) {
      const requestId =
        await randomIpfsNftMintTxReceipt.events[1].args.requestId.toString();
      const vrfCoordinatorV2Mock = await ethers.getContract(
        "VRFCoordinatorV2Mock",
        deployer
      );
      await vrfCoordinatorV2Mock.fulfillRandomWords(
        requestId,
        randomIpfsNft.address
      );
    }
  });
  console.log(
    `Random Ipfs Nft index 0 tokenUri:${await randomIpfsNft.tokenUri(0)}`
  );

  //Dynamic Svg Nft
  const highValue = ethers.utils.parseEther("4000");
};
