import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "@rainbow-me/rainbowkit/styles.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import Logo from "./Assets/etm.png";
import { Buffer } from 'buffer';





import {
  RainbowKitProvider,
  connectorsForWallets,
  AvatarComponent
} from "@rainbow-me/rainbowkit";

import {
  metaMaskWallet,
  trustWallet,
  walletConnectWallet,
  coinbaseWallet,
} from '@rainbow-me/rainbowkit/wallets';

import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

window.Buffer = Buffer;


const EthChain = {
  id: 1,
  name: "ETH Mainnet",
  network: "ETH Mainnet",
  iconUrl:
    "https://cryptologos.cc/logos/ethereum-eth-logo.png",
  iconBackground: "#fff",
  nativeCurrency: {
    decimals: 18,
    name: "ETH",
    symbol: "ETH", 
  },
  rpcUrls: {
    default: "https://cloudflare-eth.com",
  },
  blockExplorers: {
    default: {
      name: "ETH Mainnet",
      url: "https://etherscan.io/",
    },
    mainn: {
      name: "ETH Mainnet",
      url: "https://etherscan.io/",
    },
  },
  testnet: true,
};



const { provider, chains } = configureChains(
  [EthChain],
  [jsonRpcProvider({ rpc: (chain) => ({ http: chain.rpcUrls.default }) })]
);

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      metaMaskWallet({ chains }),
      trustWallet({ chains }),
      walletConnectWallet({ chains }),
      coinbaseWallet({ chains }),
    ],
  },
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});




const CustomAvatar: AvatarComponent = ({ address, ensImage, size }) => {
  
  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: 999,
        height: size,
        width: size,
      }}
    >
      <img
      src={Logo}
      width={size}
      height={size}
      style={{ borderRadius: 999 }}
    />
      
    </div>
  );
};


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <WagmiConfig client={wagmiClient}>
    <RainbowKitProvider 
    modalSize="compact" 
    chains={chains}
    avatar={CustomAvatar}
    >
      
        <App />
      
    </RainbowKitProvider>
  </WagmiConfig>
);

reportWebVitals();
