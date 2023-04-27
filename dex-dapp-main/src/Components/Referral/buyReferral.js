import React, { useEffect, useState } from "react";
import "./referral.css";
import { Container, Row, Col } from "react-bootstrap";
import tokenLogo from "../../Assets/etm.png";
import ethIcon from "../../Assets/ethIcon.png";
import { toast } from "react-toastify";
import { ethers, BigNumber } from "ethers";
import { useAccount, useBalance, useNetwork, erc20ABI, useSigner } from "wagmi";
import { MdSwapVerticalCircle } from "react-icons/md";
import {
  TokenAddress,
  TokenABI,
  routerAddress,
  wbnbAddress,
} from "../../contract/index.js";

import {
  swapExactETHForTokensSupportingFeeOnTransferTokens,
  swapExactTokensForETHSupportingFeeOnTransferTokens,
  getAmountsOut,
  getReservess,
  getPriceImpact,
} from "../../hook/hooks.js";

function BuyReferralsCard() {
  const [userReferralCode, setUserReferralCode] = useState("");
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
  const chainRpcUrl = chain?.rpcUrls?.default;
  const { address } = useAccount();
  const provider = new ethers.providers.StaticJsonRpcProvider(
    chainRpcUrl === undefined ? process.env.REACT_APP_DEFAULT_CHAIN_RPC : chainRpcUrl
  );

  const currentSigner = signer === undefined || signer === null ? provider : signer;

  const currentAddress = address === undefined ? "0x0000000000000000000000000000000000000000" : address;

  const [slippageInput, setSlippageInput] = useState(0);
  const [slippage, setSlippage] = useState(null);
  const handleSlippage = (value) => {
    setSlippage(value);
    setSlippageInput(value);
  };
  const [userBnbAmount, setUserBnbAmount] = useState(null);

  const getUserBnbBalance = async () => {
    if (address !== undefined) {
      const balance = await provider.getBalance(address);
      const balanceInBnb = ethers.utils.formatEther(balance);
      setUserBnbAmount(balanceInBnb);
    }
  };

  const [userMatrixAmount, setUserMatrixAmount] = useState(null);

  const getUserMatrixBalance = async () => {
    if (address !== undefined) {
      const matrixContract = new ethers.Contract(
        TokenAddress,
        TokenABI,
        provider
      );
      const matrixBalance = await matrixContract.balanceOf(address);
      const matrixBalanceInMatrix = ethers.utils.formatEther(matrixBalance);
      setUserMatrixAmount(matrixBalanceInMatrix);
    }
  };

  useEffect(() => {
    getUserBnbBalance();
    getUserMatrixBalance();
  }, [address, chainRpcUrl]);



  // BUY BNB VALUE
  const [bnbValue, setBnbValue] = useState(null);
  const [buyTokenValue, setBuyTokenValue] = useState(null);
  // SELL BNB VALUE
  const [sellBnbValue, setSellBnbValue] = useState(null);
  const [sellTokenValue, setSellTokenValue] = useState(null);

  // MATRIX VALUE
  const [matrixValue, setMatrixValue] = useState(null);
  const [matrixLoading, setMatrixLoading] = useState(false);

  const [slippageValue, setSlippageValue] = useState(null);

  // RESERVES
  const [reserves, setReserves] = useState();

  const fetchGetReserves = async () => {
    const reserves = await getReservess(provider, TokenAddress, wbnbAddress);
    setReserves(reserves);
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

  const getuserReferralCodeFromAddress = async () => {
    const tokenContract = new ethers.Contract(TokenAddress, TokenABI, provider);
    const userReferralContract = await tokenContract.addressToReferrals(
      currentAddress
    );

    if (userReferralContract !== "") {
      setUserReferralCode(
        userReferralContract[2] !== "0x0000000000000000000000000000000000000000"
          ? userReferralContract[2]
          : ""
      );
    } else {
      setUserReferralCode("");
    }
  };

  useEffect(() => {
    getuserReferralCodeFromAddress(address);
  }, [address]);

  const buyButtonValidation = () => {
    if (
      bnbValue === null ||
      bnbValue === 0 ||
      bnbValue > userBnbAmount ||
      buyTokenValue === null ||
      buyTokenValue === 0 ||
      userReferralCode === "" ||
      slippageInput === null ||
      slippageInput === "" ||
      Number(slippageInput) < 0 ||
      Number(slippageInput) > 100
    ) {
      return true;
    } else {
      return false;
    }
  };

  const sellButtonValidation = () => {
    if (
      sellBnbValue === null ||
      sellBnbValue === 0 ||
      sellBnbValue > userBnbAmount ||
      sellTokenValue === null ||
      sellTokenValue === 0 ||
      slippageInput === null ||
      slippageInput === "" ||
      Number(slippageInput) < 0 ||
      Number(slippageInput) > 100
    ) {
      return true;
    } else {
      return false;
    }
  };

  const handleChangeSlippage = (value) => {
    if (value > 100) {
      setSlippageInput(100);
  
      calcSlippage(activeTab ? buyTokenValue : sellBnbValue, 100);
    } else if (value < 0) {
      setSlippageInput(0);
   
      calcSlippage(activeTab ? buyTokenValue : sellBnbValue, 0);
    } else {
      setSlippageInput(value);
   
      calcSlippage(activeTab ? buyTokenValue : sellBnbValue, value);
    }
  };

  const [buyLoading, setBuyLoading] = useState(false);
  const [sellLoading, setSellLoading] = useState(false);

  const handleBuy = async () => {
    if (signer === undefined || signer === null) {
      toast.error("Please connect your wallet", {
        position: toast.POSITION.TOP_CENTER,
      });
      return;
    }
    const currentSigner =
      signer === undefined || signer === null ? provider : signer;

    const amountIn =
      bnbValue === null
        ? 0
        : ethers.utils.parseEther(parseFloat(bnbValue).toFixed(6).toString(10));
    const sendSlippage =
      slippageInput === null || slippageInput === "" ? "50" : slippageInput;


    const AmountsOut = ethers.utils.parseEther(
      (buyTokenValue - buyTokenValue * (sendSlippage / 100)).toString(10)
    );

    try {
      const buyMatrixTx =
        await swapExactETHForTokensSupportingFeeOnTransferTokens(
          AmountsOut,
          address,
          TokenAddress,
          wbnbAddress,
          amountIn,
          currentSigner
        );

      setBuyLoading(true);
      if (buyMatrixTx) {
        await buyMatrixTx.wait();
      }
      getUserBnbBalance();
      getUserMatrixBalance();
      setBuyLoading(false);
      toast.success("Succesfully Bought", {
        position: toast.POSITION.TOP_CENTER,
      });
    } catch (error) {
      setBuyLoading(false);
      console.log(error);
      toast.error(
        error
          ? error.reason === undefined
            ? error.message !== undefined
              ? error.message
              : "Something went wrong"
            : error.reason
          : "Something went wrong",

        {
          position: toast.POSITION.TOP_CENTER,
        }
      );
    }
  };

  const handleSell = async () => {
    if (signer === undefined || signer === null) {
      toast.error("Please connect your wallet", {
        position: toast.POSITION.TOP_CENTER,
      });
      return;
    }

    const currentSigner =
      signer === undefined || signer === null ? provider : signer;

    const amountIn =
      sellTokenValue === null ? 0 : ethers.utils.parseEther(sellTokenValue);
    const sendSlippage =
      slippageInput === null || slippageInput === "" ? "50" : slippageInput;

    const AmountsOut = ethers.utils.parseEther(
      (sellBnbValue - sellBnbValue * (sendSlippage / 100))
        .toFixed(6)
        .toString(10)
    );

    try {
      const sellMatrixTx =
        await swapExactTokensForETHSupportingFeeOnTransferTokens(
          amountIn,
          address,
          wbnbAddress,
          TokenAddress,
          AmountsOut,
          currentSigner
        );

      setSellLoading(true);
      if (sellMatrixTx) {
        await sellMatrixTx.wait();
      }
      getUserBnbBalance();
      getUserMatrixBalance();
      setSellLoading(false);
      toast.success("Succesfully Sold", {
        position: toast.POSITION.TOP_CENTER,
      });
    } catch (error) {
      setSellLoading(false);
      console.log(error);
      toast.error(
        error
          ? error.reason === undefined
            ? error.message !== undefined
              ? error.message
              : "Something went wrong"
            : error.reason
          : "Something went wrong",

        {
          position: toast.POSITION.TOP_CENTER,
        }
      );
    }
  };

  const [activeTab, setActiveTab] = useState(true);

  const [allowance, setAllowance] = useState(null);
  const currentAllowance = 1e26;
  const getAllowance = async () => {
    const allowanceContact = new ethers.Contract(
      TokenAddress,
      erc20ABI,
      provider
    );

    const currentAddress =
      address === undefined
        ? "0x0000000000000000000000000000000000000000"
        : address;

    try {
      const allowance = await allowanceContact.allowance(
        currentAddress,
        routerAddress
      );
      setAllowance(parseInt(BigNumber.from(allowance).toString()));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllowance();
  }, [address, chainRpcUrl]);


  const approveButtonState = () => {
    if (allowance !== null) {
      if (allowance >= currentAllowance) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  };

  const [approveLoading, setApproveLoading] = useState(false);
  const handleApprove = async () => {
    if (signer === undefined || signer === null) {
      toast.error("Please connect your wallet", {
        position: "top-center",
      });
      return;
    }

    const currentSigner =
      signer === undefined || signer === null ? provider : signer;

    const approveContract = new ethers.Contract(
      TokenAddress,
      erc20ABI,
      currentSigner
    );

    try {
      const approve = await approveContract.approve(
        routerAddress,
        ethers.constants.MaxUint256
      );
      setApproveLoading(true);
      await approve.wait();
      getAllowance();
      setApproveLoading(false);
      toast.success("Succesfully Approved", {
        position: toast.POSITION.TOP_CENTER,
      });
    } catch (error) {
      console.log(error);
      toast.error(
        error
          ? error.reason !== undefined
            ? error.reason
            : "Something went wrong"
          : "Something went wrong",
        { position: toast.POSITION.TOP_CENTER }
      );
    }
  };

  const handleBuyBnbValue = async (value, mode) => {

    const regex = /^[0-9]*\.?[0-9]*$/;
    if (value == "" || regex.test(value)) {
      if (mode == "weth") {
        setBnbValue(value);
        setBuyTokenValue(
          getAmountsOut(reserves[1], reserves[0], value).toString(10)
        );
        calcSlippage(
          getAmountsOut(reserves[1], reserves[0], value).toString(10),
          slippageInput
        );
      } else {
        setBuyTokenValue(value);
        setBnbValue(
          getAmountsOut(reserves[0], reserves[1], value).toString(10)
        );
        calcSlippage(value, slippageInput);
      }
    }
  };


  const handleSellBnbValue = async (value, mode) => {
    const regex = /^[0-9]*\.?[0-9]*$/;
    if (value == "" || regex.test(value)) {
      if (mode == "weth") {
        setSellBnbValue(value);
        setSellTokenValue(
          getAmountsOut(reserves[1], reserves[0], value).toString(10)
        );
        calcSlippage(value, slippageInput);
      } else {
        setSellTokenValue(value);
        setSellBnbValue(
          getAmountsOut(reserves[0], reserves[1], value).toString(10)
        );
        calcSlippage(
          getAmountsOut(reserves[0], reserves[1], value).toString(10),
          slippageInput
        );
      }
    }

  };

  const calcSlippage = (value, slippageFromFunc) => {

    const slippageValue = (
      value -
      value * (slippageFromFunc / 100).toString(10)

    ).toFixed(6);

 
    setSlippageValue(slippageValue);
  };

  const [priceImpact, setPriceImpact] = useState(null);

  const priceImpacBnb = async () => {
    let value = 0;
    if (activeTab) {
      value = ethers.utils.parseUnits(buyTokenValue);  
   
    } else {
      value = ethers.utils.parseUnits(sellTokenValue);
 
    }
    try {
      const impact = getPriceImpact(value, reserves[0]);
      setPriceImpact(impact);
    } catch (error) {
      console.log(error);
    }
  };

  const priceImpactToken = async () => {
    let value = 0;
    if (activeTab) {
      value = ethers.utils.parseUnits(bnbValue);

    } else {
      value = ethers.utils.parseUnits(sellBnbValue);


    }
    try {
      const Impact = getPriceImpact(value,reserves[1]);
      setPriceImpact(Impact);
    } catch (error) {
      console.log(error);
    }
  };


  useEffect(() => {
    priceImpacBnb();
    priceImpactToken();
  }, [buyTokenValue, bnbValue, sellTokenValue, sellBnbValue]);

  return (
    <>
      <Container>
        <Row>
          <Col
            lg={{ span: 4, offset: 4 }}
            md={{ span: 10, offset: 1 }}
            sm={{ span: 12 }}
          >
            <div className="buyReferralsCardMain">
              <div className="buySellTitle">{activeTab ? "BUY" : "SELL"}</div>

              {!activeTab ? (
                <>
                  <div className="buyReferralsCardBody">
                    <div className="buyReferralsForkPart">
                      <div className="buyReferralsForkPartUp">
                        <div className="buyReferralsForkPartsLeft">
                          <img src={tokenLogo} className="buyReferralsIcon" />
                          <div className="buyReferralsPartLeftText">ETM</div>
                        </div>
                        {address !== undefined && (
                          <div className="buyReferralsPartsRight">
                            Balance:{" "}
                            {userMatrixAmount !== null
                              ? Number(userMatrixAmount).toLocaleString()
                              : "-"}
                          </div>
                        )}
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="0.0"
                          className="buyReferralsInput"
                          value={sellTokenValue}
                          onChange={(e) =>
                            handleSellBnbValue(e.target.value, "token")
                          }
                        />
                      </div>
                    </div>

                    <div className="finishRoundsButtons">
                      <button
                        className="swapIconWrapper"
                        onClick={() => setActiveTab(!activeTab)}
                      >
                        <MdSwapVerticalCircle className="swapIcon" />
                      </button>
                    </div>

                    <div className="buyReferralsBnbPart">
                      <div className="buyReferralsBnbPartUp">
                        <div className="buyReferralsBnbPartsLeft">
                          <img src={ethIcon} className="buyReferralsIcon" />
                          <div className="buyReferralsPartLeftText">ETH</div>
                        </div>
                        {address !== undefined && (
                          <div className="buyReferralsPartsRight">
                            Balance:{" "}
                            {userBnbAmount !== null
                              ? Number(userBnbAmount).toLocaleString()
                              : "-"}
                          </div>
                        )}
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="0.0"
                          className="buyReferralsInput"
                          value={sellBnbValue}
                          onChange={(e) =>
                            handleSellBnbValue(e.target.value, "weth")
                          }
                        />
                      </div>
                    </div>

                    <div className="buyReferralsSlippage">
                      <div className="buyReferralsSlippageTitle">
                        Slippage Tolerance
                      </div>
                      <div className="buyReferralsSlippageNums">
                        <button
                          className="buyReferralsSlippageNumsItem"
                          onClick={() => handleChangeSlippage("5")}
                          style={{
                            border:
                              slippage === "5" && slippageInput === ""
                                ? "1px solid #00D395"
                                : "none",
                          }}
                        >
                          5%
                        </button>
                        <button
                          className="buyReferralsSlippageNumsItem"
                          onClick={() => handleChangeSlippage("10")}
                          style={{
                            border:
                              slippage === "10" && slippageInput === ""
                                ? "1px solid #00D395"
                                : "none",
                          }}
                        >
                          10%
                        </button>
                        <button
                          className="buyReferralsSlippageNumsItem"
                          onClick={() => handleChangeSlippage("15")}
                          style={{
                            border:
                              slippage === "15" && slippageInput === ""
                                ? "1px solid #00D395"
                                : "none",
                          }}
                        >
                          15%
                        </button>
                        <div className="buyReferralsSlippageNumsItem">
                          <input
                            type="number"
                            value={slippageInput}
                            min={0}
                            max={100}
                            maxLength={3}
                            onChange={(e) =>
                              handleChangeSlippage(e.target.value)
                            }
                          />
                          <div className="perCent">%</div>
                        </div>
                      </div>
                    </div>
                  </div>{" "}
                  <div className="buyReferralsCardFooter">
                    <div className="buyReferralsCardFooterLeft">
                      <div className="buyReferralsCardFooterLeftText">
                        Minimum Received: {slippageValue}
                        {" ETH"}
                      </div>
                    </div>

                    <div className="buyReferralsCardFooterLeft">
                      <div className="buyReferralsCardFooterLeftText">
                        Price Impact:{" "}
                        {priceImpact === null
                          ? "-"   
                          : priceImpact.toFixed(2)}
                        {" %"}
                      </div>
                    </div>
                  </div>
                  {approveButtonState() ? (
                    <button
                      className="buyTicketButton"
                      disabled={approveLoading}
                      onClick={() => handleApprove()}
                      style={{
                        cursor: approveLoading ? "not-allowed" : "pointer",
                        opacity: approveLoading ? "0.5" : "1",
                      }}
                    >
                      Approve{" "}
                      {approveLoading && (
                        <i className="fa fa-spinner fa-spin"></i>
                      )}
                    </button>
                  ) : (
                    <button
                      className="buyReferralsButton"
                      disabled={sellButtonValidation()}
                      style={{
                        cursor:
                          sellButtonValidation() || sellLoading
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          sellButtonValidation() || sellLoading ? 0.5 : 1,
                      }}
                      onClick={() => handleSell()}
                    >
                      Sell{" "}
                      {sellLoading && <i className="fa fa-spinner fa-spin"></i>}
                    </button>
                  )}
                </>
              ) : (
                <>
                  <div className="buyReferralsCardBody">
                    <div className="buyReferralsBnbPart">
                      <div className="buyReferralsBnbPartUp">
                        <div className="buyReferralsBnbPartsLeft">
                          <img src={ethIcon} className="buyReferralsIcon" />
                          <div className="buyReferralsPartLeftText">ETH</div>
                        </div>
                        {address !== undefined && (
                          <div className="buyReferralsPartsRight">
                            Balance:{" "}
                            {userBnbAmount !== null
                              ? Number(userBnbAmount).toLocaleString()
                              : "-"}
                          </div>
                        )}
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="0.0"
                          className="buyReferralsInput"
                          value={bnbValue}
                          onChange={(e) =>
                            handleBuyBnbValue(e.target.value, "weth")
                          }
                        />
                      </div>
                    </div>

                    <div className="finishRoundsButtons">
                      <button
                        className="swapIconWrapper"
                        onClick={() => setActiveTab(!activeTab)}
                      >
                        <MdSwapVerticalCircle className="swapIcon" />
                      </button>
                    </div>

                    <div className="buyReferralsForkPart">
                      <div className="buyReferralsForkPartUp">
                        <div className="buyReferralsForkPartsLeft">
                          <img src={tokenLogo} className="buyReferralsIcon" />
                          <div className="buyReferralsPartLeftText">ETM</div>
                        </div>
                        {address !== undefined && (
                          <div className="buyReferralsPartsRight">
                            Balance:{" "}
                            {userMatrixAmount !== null
                              ? Number(userMatrixAmount).toLocaleString()
                              : "-"}
                          </div>
                        )}
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="0.0"
                          className="buyReferralsInput"
                          value={buyTokenValue}
                          onChange={(e) =>
                            handleBuyBnbValue(e.target.value, "token")
                          }
                        />
                      </div>
                    </div>
                    <div className="buyReferralsSlippage">
                      <div className="buyReferralsSlippageTitle">
                        Slippage Tolerance
                      </div>
                      <div className="buyReferralsSlippageNums">
                        <button
                          className="buyReferralsSlippageNumsItem"
                          onClick={() => handleChangeSlippage("5")}
                          style={{
                            border:
                              slippage === "5" && slippageInput === ""
                                ? "1px solid #00D395"
                                : "none",
                          }}
                        >
                          5%
                        </button>
                        <button
                          className="buyReferralsSlippageNumsItem"
                          onClick={() => handleChangeSlippage("10")}
                          style={{
                            border:
                              slippage === "10" && slippageInput === ""
                                ? "1px solid #00D395"
                                : "none",
                          }}
                        >
                          10%
                        </button>
                        <button
                          className="buyReferralsSlippageNumsItem"
                          onClick={() => handleChangeSlippage("15")}
                          style={{
                            border:
                              slippage === "15" && slippageInput === ""
                                ? "1px solid #00D395"
                                : "none",
                          }}
                        >
                          15%
                        </button>
                        <div className="buyReferralsSlippageNumsItem">
                          <input
                            type="number"
                            value={slippageInput}
                            min={0}
                            max={100}
                            maxLength={3}
                            onChange={(e) =>
                              handleChangeSlippage(e.target.value)
                            }
                          />
                          <div className="perCent">%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="buyReferralsCardFooter">
                    <div className="buyReferralsCardFooterLeft">
                      <div className="buyReferralsCardFooterLeftText">
                        Minimum Received: {slippageValue}
                        {" ETM"}
                      </div>
                    </div>

                    <div className="buyReferralsCardFooterLeft">
                      <div className="buyReferralsCardFooterLeftText">
                        Price Impact:{" "}
                        {priceImpact === null
                          ? "-"
                          : priceImpact.toFixed(2)}
                          {" %"}
                      </div>
                    </div>
                  </div>

                  {bnbValue !== null && bnbValue !== "" && bnbValue > 0 ? (
                    <button
                      className="buyReferralsButton"
                      disabled={buyButtonValidation()}
                      style={{
                        cursor:
                          buyButtonValidation() || buyLoading
                            ? "not-allowed"
                            : "pointer",
                        opacity: buyButtonValidation() || buyLoading ? 0.4 : 1,
                      }}
                      onClick={() => handleBuy()}
                    >
                      Buy{" "}
                      {buyLoading && <i className="fa fa-spinner fa-spin"></i>}
                    </button>
                  ) : (
                    <button className="buyReferralsButtonOpa">Buy</button>
                  )}
                </>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default BuyReferralsCard;
