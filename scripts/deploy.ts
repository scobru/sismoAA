import { ethers, Wallet } from "ethers";
import hre from "hardhat";

async function main() {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("Deploying contracts with the account:", deployer);

  // Deploy Verifier contract
  const verifier = await deploy("SismoVerifier", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  console.log("Verifier deployed to:", verifier.address);

  const SismoAAFactory = await deploy("SismoAAFactory", {
    from: deployer,
    args: [verifier.address],
    log: true,
    autoMine: true,
  });

  console.log("SismoAAFactory deployed to:", SismoAAFactory.address);

  const sismoEnrypted = await deploy("SismoEncrypted", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  console.log("SismoPK deployed to:", sismoEnrypted.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
