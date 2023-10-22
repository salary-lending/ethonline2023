import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";

import { WagmiConfig, sepolia } from "wagmi";
import { arbitrum, goerli, mainnet } from "wagmi/chains";
import Layout from "@/components/layout/Layout";
import { useEffect, useState } from "react";
import { Spinner } from "@nextui-org/react";

const walletConnectProjectId = "f39a373b2776ef2e4343ee6e7e007791";

const metadata = {
  name: "SalaryFi",
  description: "Borrow  using salary data",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const localhost = { id: 31337,
  name: 'Localhost',
  network: 'localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
    public: { http: ['http://127.0.0.1:8545'] },
  },}
const chains = [sepolia, goerli,localhost];
const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId: walletConnectProjectId,
  metadata,
});

createWeb3Modal({ wagmiConfig, projectId: walletConnectProjectId, chains });

export default function App({ Component, pageProps }: AppProps) {
  const [isMounted,setIsMounted] = useState(false)
  
  useEffect(()=>{
    setIsMounted(true)
  
  },[])

  if(!isMounted){
    return <div className="h-screen w-screen flex flex-col gap-4 items-center justify-center">
      <Spinner color="white"/>
      <h1 className="animate-pulse text-xl">
      Loading...
      </h1>
    </div>
  }
  return (
    <WagmiConfig config={wagmiConfig}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </WagmiConfig>
  );
}
