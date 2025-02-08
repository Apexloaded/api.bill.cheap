import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

export default buildModule('DeployModule', (m) => {
  const owner = m.getAccount(0);
  const initializeArgs = [owner];

  const gateway = m.contract('Gateway');
  const bct = m.contract('BillcheapToken');
  const busdc = m.contract('BillcheapUSDCoin');
  const busdt = m.contract('BillcheapTether');

  // Deploy ProxyAdmin for managing all proxies
  const proxyAdmin = m.contract('ProxyAdmin', initializeArgs);

  const gatewayProxy = m.contract(
    'TransparentUpgradeableProxy',
    [
      gateway,
      proxyAdmin,
      m.encodeFunctionCall(gateway, 'init_gateway', initializeArgs),
    ],
    { id: 'GatewayProxy' },
  );

  const bctProxy = m.contract(
    'TransparentUpgradeableProxy',
    [bct, proxyAdmin, m.encodeFunctionCall(bct, 'initialize', initializeArgs)],
    { id: 'BCTProxy' },
  );

  const busdcProxy = m.contract(
    'TransparentUpgradeableProxy',
    [
      busdc,
      proxyAdmin,
      m.encodeFunctionCall(busdc, 'initialize', initializeArgs),
    ],
    { id: 'BUSDCProxy' },
  );

  const busdtProxy = m.contract(
    'TransparentUpgradeableProxy',
    [
      busdt,
      proxyAdmin,
      m.encodeFunctionCall(busdt, 'initialize', initializeArgs),
    ],
    { id: 'BUSDTProxy' },
  );

  return {
    proxyAdmin,
    gateway: gatewayProxy,
    bct: bctProxy,
    busdc: busdcProxy,
    busdt: busdtProxy,
    gatewayImpl: gateway,
    bctImpl: bct,
    busdtImpl: busdt,
    busdcImpl: busdc,
  };
});
