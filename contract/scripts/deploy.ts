import { ethers, upgrades, network } from 'hardhat';

async function main() {
  const [owner] = await ethers.getSigners();
  const Gateway = await ethers.getContractFactory('Gateway');
  const gateway = await upgrades.deployProxy(Gateway, [owner.address], {
    initializer: 'initialize',
    initialOwner: owner.address,
  });
  await gateway.waitForDeployment();
  const gatewayProxy = await gateway.getAddress();
  console.log('GATEWAY:', gatewayProxy);

  const BCT = await ethers.getContractFactory('BillcheapToken');
  const bct = await upgrades.deployProxy(BCT, [owner.address], {
    initializer: 'initialize',
    initialOwner: owner.address,
  });
  await bct.waitForDeployment();
  const bctProxy = await bct.getAddress();
  console.log('BCT:', bctProxy);

  const USDC = await ethers.getContractFactory('BillcheapUSDCoin');
  const usdc = await upgrades.deployProxy(USDC, [owner.address], {
    initializer: 'initialize',
    initialOwner: owner.address,
  });
  await usdc.waitForDeployment();
  const usdcProxy = await usdc.getAddress();
  console.log('USDC:', usdcProxy);

  const USDT = await ethers.getContractFactory('BillcheapTether');
  const usdt = await upgrades.deployProxy(USDT, [owner.address], {
    initializer: 'initialize',
    initialOwner: owner.address,
  });
  await usdt.waitForDeployment();
  const usdtProxy = await usdt.getAddress();
  console.log('USDT:', usdtProxy);

  await gateway.batchEnlistTokens([bctProxy, usdtProxy, usdcProxy]);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
