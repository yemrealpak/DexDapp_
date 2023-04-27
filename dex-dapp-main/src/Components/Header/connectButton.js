import { ConnectButton } from "@rainbow-me/rainbowkit";
import "./index.css";
import { BiWallet } from "react-icons/bi";

export const ConnectWallet = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        return (
          <div
            {...(!mounted && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!mounted || !account || !chain) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="connectWallet"
                  >
                    <span>Connect</span>
                  </button>
                );
              }
              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="wrongNetwork"
                  >
                    Wrong Network
                  </button>
                );
              }
              return (
                <button
                  onClick={openAccountModal}
                  type="button"
                  className="connectedWallet"
                >
                  <BiWallet className="wallet-icon" size={16}/>
                  <span className="account-address">
                    {account.address.slice(0, 4) +
                      "..." +
                      account.address.slice(
                        account.address.length - 3,
                        account.address.length
                      )}
                  </span>
                </button>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
