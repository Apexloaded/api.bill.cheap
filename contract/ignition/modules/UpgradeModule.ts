import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import ProxyModule from './ProxyModule';

const UpgradeModule = buildModule('UpgradeModule', (m) => {
  const proxyAdminOwner = m.getAccount(0);

  const { proxyAdmin, proxy } = m.useModule(ProxyModule);

  const gatewayV2 = m.contract('Gateway');

  m.call(proxyAdmin, 'upgradeAndCall', [proxy, gatewayV2, '0x'], {
    from: proxyAdminOwner,
  });

  return { proxyAdmin, proxy };
});

export default UpgradeModule;
