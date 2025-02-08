import { ethers, upgrades, network } from 'hardhat';

async function main() {
  const [owner] = await ethers.getSigners();
  const Gateway = await ethers.getContractFactory('Gateway');
  const gateway = await upgrades.upgradeProxy(
    '0x890800109C5f42100111c42a89936a8DA1Cd1e9d',
    Gateway,
  );
  await gateway.waitForDeployment();
  const gatewayProxy = await gateway.getAddress();
  console.log('GATEWAY: ', gatewayProxy);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
