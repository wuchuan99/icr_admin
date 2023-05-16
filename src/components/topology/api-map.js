import {
  networkElementSwitchl2Add,
  networkElementSwitchl2Update,
  networkElementSwitchl2Delete,
  networkElementSwitchl3Add,
  networkElementSwitchl3Update,
  networkElementSwitchl3Delete,
  networkElementRouterAdd,
  networkElementRouterUpdate,
  networkElementRouterDelete,
  networkElementCableAdd,
  networkElementCableUpdate,
  networkElementCableDelete,
  networkElementTerminalAdd,
  networkElementTerminalUpdate,
  networkElementTerminalDelete,
  networkElementTerminalRetrieve,
  scenetargetSubnetAddvirtualnet,
  scenetargetSubnetAttachvirtualnet,
  scenetargetSubnetUpdatevirtualnet,
  scenetargetSubnetDelete
} from '@/api/scene'

export default {
  layerTwoSwitches: {
    add: networkElementSwitchl2Add,
    update: networkElementSwitchl2Update,
    del: networkElementSwitchl2Delete
  },
  layerThreeSwitches: {
    add: networkElementSwitchl3Add,
    update: networkElementSwitchl3Update,
    del: networkElementSwitchl3Delete
  },
  router: {
    add: networkElementRouterAdd,
    update: networkElementRouterUpdate,
    del: networkElementRouterDelete
  },
  cable: {
    add: networkElementCableAdd,
    update: networkElementCableUpdate,
    del: networkElementCableDelete
  },
  desktop: {
    add: networkElementTerminalAdd,
    update: networkElementTerminalUpdate,
    del: networkElementTerminalDelete,
    retrieve: networkElementTerminalRetrieve
  },
  notebook: {
    add: networkElementTerminalAdd,
    update: networkElementTerminalUpdate,
    del: networkElementTerminalDelete,
    retrieve: networkElementTerminalRetrieve
  },
  virtualNetwork: {
    add: scenetargetSubnetAddvirtualnet,
    update: scenetargetSubnetUpdatevirtualnet,
    del: scenetargetSubnetDelete
  },
  attach: {
    virtualNetwork: scenetargetSubnetAttachvirtualnet
  }
}
