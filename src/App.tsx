import "./App.css";
import { useEffect, useMemo, useState } from "react";

import Home from "./Home";

import * as anchor from "@project-serum/anchor";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  getPhantomWallet,
  getSolflareWallet,
} from "@solana/wallet-adapter-wallets";

import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";

import { WalletDialogProvider } from "@solana/wallet-adapter-material-ui";

const network = process.env.REACT_APP_SOLANA_NETWORK as WalletAdapterNetwork;

const rpcHost = process.env.REACT_APP_SOLANA_RPC_HOST!;
const connection = new anchor.web3.Connection(rpcHost);

const App = () => {
  const endpoint = useMemo(() => clusterApiUrl(network), []);

  const wallets = useMemo(() => [getPhantomWallet(), getSolflareWallet()], []);

  const [discordUsername, setDiscordUserName] = useState("");
  const [discordUserId, setDiscordUserId] = useState("");

  useEffect(() => {
    // parse access_token and token_type that were inserted by Discord into redirect URL
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    console.log(fragment);
    const [accessToken, tokenType] = [
      fragment.get("access_token"),
      fragment.get("token_type"),
    ];
    console.log(accessToken);
    const fetchUsers = () => {
      fetch("https://discord.com/api/users/@me", {
        headers: {
          authorization: `${tokenType} ${accessToken}`,
        },
      })
        .then((result) => result.json())
        .then((response) => {
          // response format
          /*
        {
              "id": "<user_id>",
              "username": "Poopeye",
              "avatar": "3118e64af30fc703b9bf3328d156155c",
              ...
          }
        */
          // user as avatar URL: `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
          setDiscordUserName(response.username);
          setDiscordUserId(response.id);
          console.log(response);
        })
        .catch(console.error);
    };

    if (accessToken) {
      fetchUsers();
    }
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletDialogProvider>
          Hello {discordUsername}.
          <Home
            connection={connection}
            rpcHost={rpcHost}
            discordUserId={discordUserId}
          />
        </WalletDialogProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
