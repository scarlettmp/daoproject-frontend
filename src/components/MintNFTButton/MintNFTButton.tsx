import { useState, FunctionComponent } from "react";
import { Button } from "@mui/material";
import { BigNumber, ethers } from "ethers";
import { useAppSelector } from "../../redux/app/hooks";
import { ConnectButton } from "@/components";
import Box from "@mui/material/Box";
import NFT from "../../../nftABI.json";

// Contract address to the ERC-721 or ERC-1155 token contract needed to create a connection to the contract
const CONTRACT_ADDRESS = "0x7c31Cc8609BA54E7E2549AC934cF98b833B823eC";

const MintNFTButton: FunctionComponent<{
  canvasRef: HTMLCanvasElement | null;
  fabricCanvas: fabric.Canvas;
}> = ({ canvasRef, fabricCanvas }) => {
  const { data } = useAppSelector((state) => state.web3);
  const { address: userAddress, network } = data;
  // State for whether or not the user is minting
  const [minting, setMinting] = useState<boolean>(false);
  // State for whether the user has claimed the NFT or not
  const [hasClaimed, setHasClaimed] = useState<boolean>(false);
  // State for the message when a user claims the NFT
  const [claimedMessage, setclaimedMessage] = useState<string>(
    "Congrats you have claimed your NFT :)"
  );

  // // Function to handle updating the amount of NFTs minted whenever a new NFT is minted
  // const handleNewMint = async (_from: string, tokenId: BigNumber) => {
  //   const id = tokenId.toNumber();
  //   // setAmountMinted(id + 1);
  //   setclaimedMessage(
  //     `Congrats you have claimed your NFT :)\n\nIt can take up to 10 min to see your NFT on OpenSea! Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${id}`
  //   );
  // };

  const askContractToMintNft = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      // Create connection to NFT contract
      const contract = new ethers.Contract(CONTRACT_ADDRESS, NFT.abi, signer);
      console.log("Going to pop wallet now to pay gas...");
      // Begin mint
      const url = canvasRef?.toDataURL("image/svg+xml");
      console.log(url);
      // if (url) {
      //   fetch(url)
      //     .then((res) => res.blob())
      //     .then((blob) => {
      //       const file = new File([blob], "myart", { type: "image/png" });
      //     });
      // }
      // const buffer = Buffer.from(url, "base64");
      // console.log(url);

      // const canvas = document.getElementById("canvas");
      // if (canvas) {
      //   console.log(canvas);
      //   const xml = new XMLSerializer().serializeToString(canvas);
      //   const url = Buffer.from(xml).toString("base64");
      //   console.log(url);
      //   console.log(canvas);
      //   const metadata = JSON.stringify({
      //     name: "My Art",
      //     description: "Custom drawing I made",
      //     image: `data:image/svg+xml;base64,${url}`,
      //   });
      //   const base64string = Buffer.from(metadata).toString("base64");
      //   const base64url = `data:application/json;base64,${base64string}`;
      //   let nftTxn = await contract.mint(base64url);
      //   setMinting(true);
      //   // Wait for mint to finish
      //   await nftTxn.wait();
      //   setMinting(false);
      //   // We can return an opensea link to the NFT here or a link to the transaction on a blockchain explorer
      //   console.log(
      //     `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
      //   );
      //   setHasClaimed(!hasClaimed);
      // }
      // setclaimedMessage(
      //   `Congrats you have claimed your NFT :)\n\nIt can take up to 10 min to see your NFT on OpenSea! Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${id}`
      // );
    } catch (error) {
      console.log(error);
    }
  };

  if (!userAddress) {
    return <ConnectButton />;
  }

  if (network !== "Rinkeby Testnet") {
    return <div>Make sure you are on the Rinkeby Testnet</div>;
  }
  // Check if user has claimed NFT
  if (hasClaimed) {
    return <div>{claimedMessage}</div>;
  }

  return (
    <Box sx={{ my: 4 }}>
      {minting ? (
        <div>Minting...</div>
      ) : (
        <>
          <Button onClick={askContractToMintNft}>Mint NFT</Button>
        </>
      )}
    </Box>
  );
};

export default MintNFTButton;
