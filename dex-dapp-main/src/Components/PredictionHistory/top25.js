import React, { useEffect, useState } from "react";
import "./index.css";
import { useNetwork, useSigner, useAccount } from "wagmi";

import { ethers } from "ethers";
import { TokenAddress, TokenABI } from "../../contract/index.js";

function Top25History() {
  const { chain } = useNetwork();
  const chainRpcUrl = chain?.rpcUrls?.default;
  const { address } = useAccount();
  const provider = new ethers.providers.StaticJsonRpcProvider(
    chainRpcUrl === undefined ? process.env.DEFAULT_RPC_URL : chainRpcUrl
  );

  const { data: signer } = useSigner();

  const currentAddress =
    address === undefined
      ? "0x0000000000000000000000000000000000000000"
      : address;

  const matrixContract = new ethers.Contract(TokenAddress, TokenABI, provider);

  const currentSigner =
    signer === undefined || signer === null ? provider : signer;

  const [topHistory, setTopHistory] = useState(null);

  const getTopHistory = async () => {
    try {
      const fetchTopHistory = await matrixContract.getAllReferrers();
      setTopHistory(fetchTopHistory);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getTopHistory();
  }, [currentAddress]);

  useEffect(() => {
    const interval = setInterval(() => {
      getTopHistory();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const tabledatas = [];

  if (topHistory !== null) {
    for (let i = 0; i < topHistory.length; i++) {
      if (topHistory[i][3] != 0) {
        let wallet = topHistory[i][0]; // wallet
        let myRefCode = ethers.utils.parseBytes32String(topHistory[i][1]); // myRefCode
        let refBalance = ethers.utils.formatEther(topHistory[i][3]); // refBalance
        let refRewardBalance = Number(refBalance).toFixed(2); // refRewardBalance
        tabledatas.push([wallet, myRefCode, refRewardBalance]);
      }
    }
  }

  tabledatas.sort(function (a, b) {
    return b[2] - a[2];
  });

  const sorted = [];
  
  let query = tabledatas.length > 25 ? 25 : tabledatas.length;

  if (tabledatas.length > 0) {
    for (let i = 0; i < query; i++) {
        sorted[i] = tabledatas[i];
        sorted[i][3] = i + 1;
    }
  }

  const RowDatas = (datas) => {
    return (
      <tr>
        <td>
          {sorted !== null &&
            sorted.length > 0 &&
            sorted.slice(0, sorted.length).map((item, index) => {
              return (
                <tr>
                  <td>
                    {item[3]}{" "}
                    {(item[3] === 1 ? "The Escaper" : null) ||
                      (item[3] === 2 ? "The Strategist" : null) ||
                      (item[3] === 3 ? "Runner" : null) ||
                      (item[3] === 4 ? "Runner" : null) ||
                      (item[3] === 5 ? "Runner" : null)}
                  </td>
                </tr>
              );
            })}
        </td>
        <td>
          {sorted.slice(0, sorted.length).map((item, index) => {
            return (
              <tr>
                <td>{item[0]}</td>
              </tr>
            );
          })}
        </td>
        <td>
          {sorted.slice(0, sorted.length).map((item, index) => {
            return (
              <tr>
                <td>{item[1]}</td>
              </tr>
            );
          })}
        </td>
        <td>
          {sorted.slice(0, sorted.length).map((item, index) => {
            return (
              <tr>
                <td>
                  {item[2]}
                  {" ETM"}
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
      <div className="transaction-body-mobile">
        <div className="transaction-body-text">
          <tbody className="trMain">
            <td>
              <div className="top25-mobile-thead">Level</div>
              {sorted !== null &&
                sorted.length > 0 &&
                sorted.slice(0, sorted.length).map((item, index) => {
                  return (
                    <>
                      <tr>
                        <td>
                          {item[3]}{" "}
                          {(item[3] === 1 ? " The Escaper" : null) ||
                            (item[3] === 2 ? " The Strategist" : null) ||
                            (item[3] === 3 ? "Runner" : null) ||
                            (item[3] === 4 ? "Runner" : null) ||
                            (item[3] === 5 ? "Runner" : null)}
                        </td>
                      </tr>
                    </>
                  );
                })}
            </td>

            <td>
              <div className="top25-mobile-thead">Address</div>
              {sorted.slice(0, sorted.length).map((item, index) => {
                return (
                  <>
                    <tr>
                      <td>{item[0].slice(0, 5) + "..." + item[0].slice(-4)}</td>
                    </tr>
                  </>
                );
              })}
            </td>
            <td>
              <div className="top25-mobile-thead">My Ref.Code</div>
              {sorted.slice(0, sorted.length).map((item, index) => {
                return (
                  <>
                    <tr>
                      <td>{item[1]}</td>
                    </tr>
                  </>
                );
              })}
            </td>

            <td>
              <div className="top25-mobile-thead">Ref.Rewards</div>
              {sorted.slice(0, sorted.length).map((item, index) => {
                return (
                  <>
                    <tr>
                      <td>
                        {item[2]}
                        {" ETM"}
                      </td>
                    </tr>
                  </>
                );
              })}
            </td>
          </tbody>
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
              <th>Level</th>
              <th>Address</th>
              <th>My Referral Code</th>
              <th>Referral Rewards</th>
            </tr>
          </thead>

          <tbody className="transactions-tbody">
            {[0].map((item, index) => (
              <RowDatas item={item} key={index} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="transactionsMobile">
        {[0].map((item, index) => (
          <RowTransactionsMobile item={item} key={index} />
        ))}
      </div>
    </div>
  );
}

export default Top25History;
