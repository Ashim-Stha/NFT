const { network, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const fs = require("fs");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const chainId = network.config.chainId;

  let aggregatorV3Adress;
  if (developmentChains.includes(network.name)) {
    aggregatorV3Interface = await ethers.getContract("MockV3Aggregator");
    aggregatorV3Adress = aggregatorV3Interface.address;
  } else {
    aggregatorV3Adress = networkConfig[chainId].ethUsdPriceFeed;
  }

  const lowSvg = fs.readFileSync("./images/dynamicNft/frown.svg", {
    encoding: "utf8",
  });

  const highSvg = fs.readFileSync("./images/dynamicNft/happy.svg", {
    encoding: "utf8",
  });

  const args = [lowSvg, highSvg, aggregatorV3Adress];

  log("-------------------------");
  const DynamicSvgNft = await deploy("DynamicSvgNft", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  if (!developmentChains.includes(network.name)) {
    console.log("Verifying...");
    await verify(DynamicSvgNft.address, args);
  }

  log("------------------------");
};

module.exports.tags = ["all", "dynamicSvgNft", "main"];
