import { Web3Provider } from "@ethersproject/providers";
import { providers } from "ethers";
import Web3Modal from "web3modal";

const checkNetwork = async (provider: Web3Provider) => {
  const { chainId } = await provider.getNetwork();
  if (chainId !== 5) {
    window.alert("Change the network to Goerli");
    throw new Error("Change network to Goerli");
    return;
  }
};

export const getProvider = async () => {
  const web3Modal = new Web3Modal({
    network: "goerli",
    cacheProvider: true,
    providerOptions: {},
    disableInjectedProvider: false,
  });

  const provider = await web3Modal.connect();
  const web3Provider = new providers.Web3Provider(provider);

  await checkNetwork(web3Provider);

  return web3Provider;
};

export const getSigner = async () => {
  const web3Modal = new Web3Modal({
    network: "goerli",
    cacheProvider: true,
    providerOptions: {},
    disableInjectedProvider: false,
  });

  const provider = await web3Modal.connect();
  const web3Provider = new providers.Web3Provider(provider);

  await checkNetwork(web3Provider);

  const signer = web3Provider.getSigner();
  return signer;
};
