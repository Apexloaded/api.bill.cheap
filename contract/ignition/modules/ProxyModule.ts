import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const ProxyModule = buildModule('ProxyModule', (m) => {
  const owner = m.getAccount(0);
  const initializeArgs = [owner];

  const gateway = m.contract('Gateway');

  const initializeData = m.encodeFunctionCall(
    gateway,
    'init_gateway',
    initializeArgs,
  );

  const proxy = m.contract('TransparentUpgradeableProxy', [
    gateway,
    owner,
    initializeData,
  ]);

  const proxyAdminAddress = m.readEventArgument(
    proxy,
    'AdminChanged',
    'newAdmin',
  );

  const proxyAdmin = m.contractAt('ProxyAdmin', proxyAdminAddress);

  return { proxyAdmin, proxy, gateway };
});

export default ProxyModule;
