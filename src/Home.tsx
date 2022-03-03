import * as anchor from "@project-serum/anchor";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { WalletDialogButton } from "@solana/wallet-adapter-material-ui";

export interface HomeProps {
  connection: anchor.web3.Connection;
  rpcHost: string;
  discordUserId: string;
}

const Home = (props: HomeProps) => {
  const anchorWallet = useAnchorWallet();

  const wallet = useWallet();

  const handleVerifyClick = async () => {
    if (anchorWallet && wallet) {
      // Fetch one nft token by its mint address TODO iterate mint addresses of whole collection
      const tokenAccountsByOwner: any =
        await props.connection.getTokenAccountsByOwner(anchorWallet.publicKey, {
          mint: new anchor.web3.PublicKey(
            "5LUmXMdxHkjERcUnLCns3omgz8TN5i5ALVSu7DPbRQrA"
          ),
        });

      if (tokenAccountsByOwner.value.length > 0) {
        const message =
          "Please sign this message for proof of address ownership.";
        const data = new TextEncoder().encode(message);

        const toHexString = (buffer: Uint8Array) =>
          buffer.reduce(
            (str, byte) => str + byte.toString(16).padStart(2, "0"),
            ""
          );

        try {
          // @ts-ignore
          const signedMessage = await wallet.signMessage(data);

          window.location.href = `https://dev--basic-discord-example.flippersverification.autocode.gg/events/discord/addrole/?user=${
            props.discordUserId
          }&msg=${toHexString(signedMessage)}&publicKey=${
            anchorWallet.publicKey
          }`;
        } catch (err) {
          console.log(err);
        }
      } else {
        alert("You don't seem to own this nft");
      }
    }
  };

  return (
    <main>
      {!anchorWallet && <WalletDialogButton>Connect Wallet</WalletDialogButton>}

      {anchorWallet && <p>Wallet {anchorWallet.publicKey.toBase58() || ""}</p>}

      {anchorWallet && <button onClick={handleVerifyClick}>Verify</button>}
    </main>
  );
};

export default Home;
