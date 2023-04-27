import React, { useEffect, useState } from "react";
import "./index.css";
import { useNetwork, useSigner, useAccount } from "wagmi";
import { ethers } from "ethers";
import axios from "axios";
import { TokenAddress, TokenABI, wbnbAddress } from "../../contract/index.js";

import { getReservess } from "../../hook/hooks.js";
import truncateEthAddress from "truncate-eth-address";

function SummaryPage() {
  const { chain } = useNetwork();
  const chainRpcUrl = chain?.rpcUrls?.default;
  const { address } = useAccount();
  const provider = new ethers.providers.StaticJsonRpcProvider(
    chainRpcUrl === undefined ? process.env.REACT_APP_DEFAULT_CHAIN_RPC : chainRpcUrl
  );
  const { data: signer } = useSigner();
  const [referralReward, setReferralReward] = useState(null);
  const [referralCode, setReferralCode] = useState(null);
  const [myReferralCode, setMyReferralCode] = useState(null);
  const [eTMBalance, setETMBalance] = useState(null);
  const [eTMBalanceValue, setETMBalanceValue] = useState(null);
  const [usdPrice, setusdPrice] = useState(null);
  const [bnbPrice, setbnbPrice] = useState(null);

  const currentAddress =
    address === undefined
      ? "0x0000000000000000000000000000000000000000"
      : address;

  const currentSigner =
    signer === undefined || signer === null ? provider : signer;

  const getBnbPrice = async () => {
    const response = await axios.get(
      "https://api.binance.com/api/v3/ticker/price",
      {
        params: {
          symbol: "ETHUSDT",
        },
      }
    );
    const bnbPrice = response.data.price;;
    setbnbPrice(bnbPrice);
    // return parseFloat(bnbPrice);
  };

  const [reserves, setReserves] = useState();

  const fetchGetReserves = async () => {
    const reserves = await getReservess(provider, TokenAddress, wbnbAddress);
    setReserves(reserves);
  };

  const getUsdPrice = async () => {
    if (reserves !== null) {
      const usdPrice = (bnbPrice * reserves[1]) / reserves[0];

      let userBalanceValues = eTMBalance * usdPrice;

      userBalanceValues = Number(userBalanceValues).toFixed(2);
      setusdPrice(usdPrice);
      setETMBalanceValue(userBalanceValues);
    }
  };

  useEffect(() => {
    const interval = setInterval(
      (function x() {
        fetchGetReserves();
        return x;
      })(),
      10000
    );

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    getUsdPrice();
    getBnbPrice();
  });

  const matrixContract = new ethers.Contract(TokenAddress, TokenABI, provider);

  const getuserRef = async () => {
    try {
      const refCodeuser = await matrixContract.userReferralInfo(currentAddress);

      const userBalance = await matrixContract.balanceOf(currentAddress);

      let myRefCode = ethers.utils.parseBytes32String(refCodeuser[0]);
      let refferalCode = ethers.utils.parseBytes32String(refCodeuser[1]);
      let refferalBalance = ethers.utils.formatEther(refCodeuser[2]);

      let userBalanceOf = ethers.utils.formatEther(userBalance);

      refferalBalance = Number(refferalBalance).toFixed(2);
      userBalanceOf = Number(userBalanceOf).toFixed(2);

      setReferralCode(refferalCode);
      setMyReferralCode(myRefCode);
      setReferralReward(refferalBalance);
      setETMBalance(userBalanceOf);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getuserRef();
  }, [address]);

  const tabledatas = [
    [
      currentAddress,
      referralReward,
      myReferralCode,
      referralCode,
      eTMBalance,
      eTMBalanceValue,
    ],
  ];

  const RowTransactions = (datas) => {
    return (
      <tr>
        <td>
          {tabledatas.slice(0, tabledatas.length).map((item, index) => {
            return (
              <tr>
                <td>{item[0]}</td>
              </tr>
            );
          })}
        </td>
        <td>
          {tabledatas.slice(0, tabledatas.length).map((item, index) => {
            return (
              <tr>
                <td>
                  {item[1]}
                  {" ETM"}
                </td>
              </tr>
            );
          })}
        </td>
        <td>
          {tabledatas.slice(0, tabledatas.length).map((item, index) => {
            return (
              <tr>
                <td>{item[3]}</td>
              </tr>
            );
          })}
        </td>
        <td>
          {tabledatas.slice(0, tabledatas.length).map((item, index) => {
            return (
              <tr>
                <td>{item[2]}</td>
              </tr>
            );
          })}
        </td>
        <td>
          {tabledatas.slice(0, tabledatas.length).map((item, index) => {
            return (
              <tr>
                <td>
                  {item[4]}
                  {" ETM"}
                </td>
              </tr>
            );
          })}
        </td>
        <td>
          {tabledatas.slice(0, tabledatas.length).map((item, index) => {
            return (
              <tr>
                <td>
                  {"$ "}
                  {item[5]}
                </td>
              </tr>
            );
          })}
        </td>
      </tr>
    );
  };

  const RowTransactionsMobile = (datas) => {
    return (
      <div className="transaction-body-mobileY">
        <div className="transaction-body-textY">
          <span>Address</span>
        </div>
        <div className="transaction-mobile-data">
          {tabledatas.slice(0, tabledatas.length).map((item, index) => {
            return (
              <tr>
                <td>{item[0]}</td>
              </tr>
            );
          })}
        </div>

        <div className="transaction-body-textY">
          <span>Referral Rewards</span>
        </div>
        <div className="transaction-mobile-data">
          {tabledatas.slice(0, tabledatas.length).map((item, index) => {
            return (
              <tr>
                <td>
                  {item[1]}
                  {" ETM"}
                </td>
              </tr>
            );
          })}
        </div>
        <div className="transaction-body-textY">
          <span>My Referral Code</span>
        </div>
        <div className="transaction-mobile-data">
          {tabledatas.slice(0, tabledatas.length).map((item, index) => {
            return (
              <tr>
                <td>{item[3]}</td>
              </tr>
            );
          })}
        </div>

        <div className="transaction-body-textY">
          <span>Referre Code</span>
        </div>
        <div className="transaction-mobile-data">
          {tabledatas.slice(0, tabledatas.length).map((item, index) => {
            return (
              <tr>
                <td>{item[2]}</td>
              </tr>
            );
          })}
        </div>

        <div className="transaction-body-textY">
          <span>ETM Balance</span>
        </div>
        <div className="transaction-mobile-data">
          {tabledatas.slice(0, tabledatas.length).map((item, index) => {
            return (
              <tr>
                <td>
                  {item[4]}
                  {" ETM"}
                </td>
              </tr>
            );
          })}
        </div>
        <div className="transaction-body-textY">
          <span>ETM Balance Value</span>
        </div>
        <div className="transaction-mobile-data">
          {tabledatas.slice(0, tabledatas.length).map((item, index) => {
            return (
              <tr>
                <td>
                  {"$ "}
                  {item[5]}
                </td>
              </tr>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="transactionsWrapper">
      <div className="transactions">
        <table>
          <thead>
            <tr className="transactions-thead">
              <th>Address</th>
              <th>Referral Rewards</th>
              <th>My Referral Code </th>
              <th>Referre Code</th>
              <th>ETM Balance</th>
              <th>ETM Balance Value</th>
            </tr>
          </thead>

          <tbody className="transactions-tbody">
            {tabledatas.map((item, index) => (
              <RowTransactions item={item} key={index} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="transtactionMobile">
        {tabledatas.map((item, index) => (
          <RowTransactionsMobile item={item} key={index} />
        ))}
      </div>
    </div>
  );
}

export default SummaryPage;
