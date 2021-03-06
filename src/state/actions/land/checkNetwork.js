import {
  store,
} from '../../store';

// if has web3 wallet
const checkNetwork = () => async (dispatch) => {
  const checkNetworkFunc = new Promise((resolve) => {
    window.web3.version.getNetwork((err, netId) => { // eslint-disable-line no-undef
      switch (netId) {
        case '1':
          resolve('Main');
          break;
        case '2':
          resolve('Morder');
          break;
        case '3':
          resolve('Ropsten');
          break;
        case '4':
          resolve('Rinkeby');
          break;
        case '42':
          resolve('Kovan');
          break;
        default:
          resolve('Unknown');
      }
    });
  });

  // // check network, compatible with old & new v of MetaMask
  let currentNetwork;
  try {
    if (window.web3.eth.net) { // eslint-disable-line no-undef
      await window.web3.eth.net.getNetworkType() // eslint-disable-line no-undef
        .then((network) => {
          currentNetwork = network;
        });
    } else {
      await checkNetworkFunc.then((network) => {
        currentNetwork = network;
      });
    }
  } catch (err) {
    console.error(err);
  }

  const prevPrevNetwork = window.localStorage.getItem('prevNetwork'); // eslint-disable-line no-undef
  const prevNetwork = window.localStorage.getItem('currentNetwork'); // eslint-disable-line no-undef
  const shouldShowSwitchNetwork = window.localStorage.getItem('shouldShowSwitchNetwork'); // eslint-disable-line no-undef
  window.localStorage.setItem('prevPrevNetwork', prevPrevNetwork); // eslint-disable-line no-undef
  window.localStorage.setItem('prevNetwork', prevNetwork); // eslint-disable-line no-undef
  window.localStorage.setItem('currentNetwork', currentNetwork); // eslint-disable-line no-undef

  if (prevNetwork && (prevNetwork !== currentNetwork) && store.getState().userState.isLoggedIn && shouldShowSwitchNetwork === 'true') {
    window.localStorage.setItem('shouldShowSwitchNetwork', false); // eslint-disable-line no-undef
    dispatch({
      type: 'USER_NETWORK_UPDATE',
      currentNetwork,
      prevNetwork,
      prevPrevNetwork,
    });
    dispatch({
      type: 'UI_HANDLE_DIFFERENT_NETWORK_MODAL',
      showDifferentNetworkModal: true,
      onBoardingModal: false,
      onBoardingModal2: false,
      isFetchingThreeBox: false,
    });
  } else {
    window.localStorage.setItem('shouldShowSwitchNetwork', true); // eslint-disable-line no-undef
    dispatch({
      type: 'USER_NETWORK_UPDATE',
      currentNetwork,
      prevNetwork,
      prevPrevNetwork,
    });
  }
};

export default checkNetwork;