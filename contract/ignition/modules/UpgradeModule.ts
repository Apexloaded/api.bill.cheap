import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import DeployModule from './DeployModule';

const UpgradeModule = buildModule('UpgradeModule', (m) => {
  const proxyAdminOwner = m.getAccount(0);

  const { proxyAdmin, gateway } = m.useModule(DeployModule);

  const gatewayV2 = m.contract('GatewayV2');

  m.call(proxyAdmin, 'upgradeAndCall', [gateway, gatewayV2, '0x'], {
    from: proxyAdminOwner,
  });

  m.call(gateway, 'batchEnlistTokens', [
    '0x2cc63cc30d22613d92402c91a8eb18e0502c8ffa',
    '0x65438c017afc22bd479750417cb230e2e0e056cc',
    '0x1ea0b72e3c2e24f7e125db3dbc106d2179346ee3',
  ]);

  return { proxyAdmin, gateway };
});

export default UpgradeModule;
