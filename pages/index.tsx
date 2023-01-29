import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Web3Modal from "web3modal";
import { providers, Contract, utils } from "ethers";
import { Button } from "@/components";
import { ABI, NFT_CONTRACT_ADDRESS } from "@/constants";

export default function Home() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [presaleStarted, setPresaleStarted] = useState(false);
  const [presaleEnded, setPresaleEnded] = useState(false);
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");

  const getSignerOrProvider = async (needSigner = false) => {
    const web3Modal = new Web3Modal({
      network: "goerli",
      cacheProvider: true,
      providerOptions: {},
      disableInjectedProvider: false,
    });

    const provider = await web3Modal.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Goerli network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Change the network to Goerli");
      throw new Error("Change network to Goerli");
      return;
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const startPresale = async () => {
    try {
      const signer = await getSignerOrProvider(true);

      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, ABI, signer);

      const tx = await nftContract.startPresale();
      setLoading(true);

      await tx.wait();
      setLoading(false);
    } catch (e) {
      console.debug(e);
      setLoading(false);
    }
  };

  const getOwner = async () => {
    try {
      const provider = await getSignerOrProvider();

      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, ABI, provider);

      const onwer = await nftContract.owner();

      const signer = await getSignerOrProvider(true);
      const signerAddress = await signer?.getAddress();

      if (signerAddress.toLowerCase() === onwer.toLowerCase()) {
        setIsOwner(true);
      } else {
        setIsOwner(false);
      }

      console.log(onwer, signerAddress);
    } catch (e) {
      console.debug(e);
    }
  };

  const checkIfPresaleStarted = async () => {
    try {
      const provider = await getSignerOrProvider();
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, ABI, provider);

      const _presaleStarted = await nftContract.presaleStarted();
      if (!_presaleStarted) {
        await getOwner();
      }
      setPresaleStarted(_presaleStarted);
      return _presaleStarted;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const checkIfPresaleEnded = async () => {
    try {
      const provider = await getSignerOrProvider();

      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, ABI, provider);
      const _presaleEnded = await nftContract.presaleEnded();

      const hasEnded = _presaleEnded.lt(Math.floor(Date.now() / 1000));

      setPresaleEnded(!!hasEnded);

      return hasEnded;
    } catch (e) {
      console.debug(e);
    }
  };

  const getTokenIdsMinted = async () => {
    try {
      const provider = await getSignerOrProvider();
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, ABI, provider);

      const _tokenIds = await nftContract.tokenIds();
      setTokenIdsMinted(_tokenIds.toString());
    } catch (err) {
      console.error(err);
    }
  };

  const handleAccountsChange = async () => {
    const provider = new providers.Web3Provider(window?.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);

    if (accounts && accounts.length > 0) {
      setCurrentAccount(accounts[0]);
      setIsConnected(true);
      await getOwner();
      await checkIfWhitelisted();
    } else {
      setCurrentAccount("");
      setIsConnected(false);
      return;
    }
  };

  const checkIfWhitelisted = async () => {
    try {
      const provider = await getSignerOrProvider();
      const accounts = await provider.send("eth_requestAccounts", []);

      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, ABI, provider);

      const _isWhitelisted = await nftContract.whitelist.whitelistedAddresses(
        currentAccount
      );
      setIsWhitelisted(_isWhitelisted);
    } catch (e) {
      console.debug(e);
    }
  };

  const presaleMint = async () => {
    try {
      const signer = await getSignerOrProvider(true);

      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, ABI, signer);
      const tx = await nftContract.presaleMint({
        value: utils.parseEther("0.01"),
      });
      setLoading(true);

      await tx.wait();
      setLoading(false);
      alert("Successfully minted an Orisa");
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const publicMint = async () => {
    try {
      const signer = await getSignerOrProvider(true);

      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, ABI, signer);
      const tx = await nftContract.mint({
        value: utils.parseEther("0.01"),
      });
      setLoading(true);

      await tx.wait();
      setLoading(false);
      alert("You have successfully minted an Orisa");
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const checkIfConnected = async () => {
    try {
      const provider = await getSignerOrProvider();
      const accounts = await provider.send("eth_requestAccounts", []);
      setCurrentAccount(accounts[0]);
      setIsConnected(true);
    } catch (e) {
      setIsConnected(false);
      setCurrentAccount("");
      console.debug(e);
    }
  };

  const connectWallet = async () => {
    try {
      const provider = await getSignerOrProvider();
      const accounts = await provider.listAccounts();
      setCurrentAccount(accounts[0]);
      setIsConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    checkIfConnected();
  }, [currentAccount]);

  useEffect(() => {
    if (isConnected) {
      checkIfPresaleStarted();
      getTokenIdsMinted();

      const presaleEndedInterval = setInterval(async () => {
        if (presaleStarted) {
          const _presaleEnded = await checkIfPresaleEnded();
          if (_presaleEnded) {
            clearInterval(presaleEndedInterval);
          }
        }
      }, 5000);

      setInterval(async () => {
        await getTokenIdsMinted();
      }, 5000);
    }
  });

  useEffect(() => {
    window?.ethereum?.on("accountsChanged", handleAccountsChange);

    return () => {
      window?.ethereum?.on("accountsChanged", handleAccountsChange);
    };
  });

  return (
    <>
      <Head>
        <title>Orisa NFT Collection</title>
        <meta name="description" content="Orisa NFT Collection" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/coins-3D.png" />
      </Head>

      <main>
        {currentAccount && (
          <div className="current-account">
            {`${currentAccount.slice(0, 5)}...${currentAccount.slice(35)}`}
          </div>
        )}
        <div className="main">
          <div className="intro-block">
            <h1 className="title">Orisa</h1>
            <p className="description">For fans of Yoruba mythology</p>
            <p className="description">
              {tokenIdsMinted} / 30 have been minted so far
            </p>
            {!isConnected && (
              <Button
                className="btn-glow"
                content="Connect Wallet"
                onClick={connectWallet}
              />
            )}
            {isOwner && !presaleStarted && (
              <Button
                className="btn-glow"
                content={loading ? "Loading..." : "Start presale"}
                onClick={startPresale}
              />
            )}
            {!presaleEnded && presaleStarted && (
              <Button
                className="btn-glow"
                content="Presale Mint"
                onClick={presaleMint}
              />
            )}
            {presaleEnded && (
              <Button
                className="btn-glow"
                content="Mint"
                onClick={publicMint}
              />
            )}
          </div>
          <div>
            <Image
              className="orisa-img"
              src="https://res.cloudinary.com/dtumqh3dd/image/upload/v1674788519/nft-dapp/sango_jh9hb4.jpg"
              alt="Sango"
              priority
              width={400}
              height={600}
            />
          </div>
        </div>
      </main>
    </>
  );
}
