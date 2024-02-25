import React, { useState } from 'react';
import { ethers } from 'ethers';
import ABI from './ABI.json';
import backgroundVideo from './imgs/helldivers-democracy.mp4';


const contractAddress = '0xd6176dCfD007A23AEFceC0cB1ace95a0b87565A2';

const scrollNetwork = {
  chainId: '0x82750',
  chainName: 'Scroll',
  rpcUrls: ['https://rpc.scroll.io'],
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  blockExplorerUrls: ['https://scrollscan.com'],
};

function App() {
  const [amount, setAmount] = useState('');

  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: scrollNetwork.chainId }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [scrollNetwork],
          });
        } catch (addError) {
          alert('Failed to add the Scroll network.');
        }
      }
    }
  };

  const checkNetwork = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const { chainId } = await provider.getNetwork();
    if (chainId !== parseInt(scrollNetwork.chainId, 16)) {
      alert('You are not connected to the Scroll network!');
      await switchNetwork();
      return false; 
    }
    return true; 
  };

  const mintTokens = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to use this feature.');
      return;
    }

    const isCorrectNetwork = await checkNetwork();
    if (!isCorrectNetwork) return;

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, ABI, signer);

      const tokensToMint = ethers.utils.parseUnits(amount, 18);
      const tokenPriceEth = ethers.utils.parseUnits("0.00003", "ether");
      const totalCost = tokenPriceEth.mul(amount);

      const transaction = await contract.mint(tokensToMint, { value: totalCost.toString() });
      await transaction.wait();
      alert('Tokens minted successfully!');
    } catch (error) {
      console.error('Error minting tokens:', error);
      alert('There was an error minting your tokens.');
    }
  };

  return (
    <div className="App">
            <video autoPlay loop muted style={{
        position: "absolute",
        width: "100%",
        left: "50%",
        top: "50%",
        height: "100%",
        objectFit: "cover",
        transform: "translate(-50%, -50%)",
        zIndex: "-1"
      }}>
        <source src={backgroundVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <h2 style={{ marginBottom: '20px' }}>Mint R Tokens</h2>
      <div className='ui'>
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount of tokens"
        />
        <button onClick={mintTokens}>Mint Tokens</button>
      </div>
    </div>
  );
}

export default App;
