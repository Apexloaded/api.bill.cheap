import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import ProxyModule from './ProxyModule';

const GatewayModule = buildModule('GatewayModule', (m) => {
  const { proxy, proxyAdmin } = m.useModule(ProxyModule);

  const gateway = m.contractAt('Gateway', proxy);

  return { gateway, proxy, proxyAdmin };
});

export default GatewayModule;
