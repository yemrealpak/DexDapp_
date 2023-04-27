import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import { HiOutlineTicket } from "react-icons/hi";
import "./index.css";
import {
  TokenAddress,
  LotteryAddress,
  LotteryABI,
} from "../../contract/index.js";
import { useNetwork, useSigner, erc20ABI, useAccount } from "wagmi";
import { ethers, BigNumber, Contract } from "ethers";
import { toast } from "react-toastify";


function BuyTicketModal({ lotteryData }) {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const { chain } = useNetwork();
  const chainRpcUrl = chain?.rpcUrls?.default;
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const provider = new ethers.providers.StaticJsonRpcProvider(
    chainRpcUrl === undefined ? process.env.REACT_APP_DEFAULT_CHAIN_RPC : chainRpcUrl
  );
  const [ticketAmount, setTicketAmount] = useState(null);
  const [ticketPrice, setTicketPrice] = useState(null);
  const [ticketDiscountInfo, setTicketDiscountInfo] = useState(null);
  const [ticketFrokPrice, setTicketFrokPrice] = useState(null);
  const lotteryContract = new ethers.Contract(
    LotteryAddress,
    LotteryABI,
    provider
  );
  const currentAddress =
    address === undefined
      ? "0x0000000000000000000000000000000000000000"
      : address;
  const [youPayPrice, setYouPayPrice] = useState(null);

  const getTicketPrice = async () => {
    const currentPower = ticketAmount === null ? "1" : parseInt(ticketAmount);
    try {
      const ticketPrice = await lotteryContract.getPrice(
        currentAddress,
        currentPower
      );

      setTicketPrice(BigNumber.from(ticketPrice[2]).toString() / 1e3);
      setTicketFrokPrice(BigNumber.from(ticketPrice[4]).toString() / 1e18);
      setTicketDiscountInfo({
        discount: BigNumber.from(ticketPrice[1]).toString() / 1e3,
        frokDiscount: BigNumber.from(ticketPrice[3]).toString() / 1e18,
        state: ticketPrice[0],
      });
      setYouPayPrice(BigNumber.from(ticketPrice[5]).toString() / 1e18);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getTicketPrice();
  }, [address, lotteryData]);

  useEffect(() => {
    const interval = setInterval(() => {
      getTicketPrice();
    }, 50000);
    return () => clearInterval(interval);
  }, []);

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
        LotteryAddress
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
        LotteryAddress,
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

  const [buyTicketLoading, setBuyTicketLoading] = useState(false);
  const handleBuyTicket = async () => {
    if (signer === undefined || signer === null) {
      toast.error("Please connect your wallet", {
        position: "top-center",
      });

      return;
    }

    const currentSigner =
      signer === undefined || signer === null ? provider : signer;

    const buyContract = new ethers.Contract(
      LotteryAddress,
      LotteryABI,
      currentSigner
    );



    const currentPower = ticketAmount === null ? "1" : parseInt(ticketAmount);


    

    const currentTicketRate =
      ticketAmount > 0
        ? ticketAmount *
          (ticketDiscountInfo !== null && ticketDiscountInfo?.frokDiscount)
        : 0;

    try {
      const ticketPriceMoment = await lotteryContract.getPrice(
        currentAddress,
        currentPower
      );
      if (Number(ticketPriceMoment[5] / 1e18) * 0.999 > currentTicketRate) {
        toast.error("FROK Price Updated", {
          position: "top-center",
        });
        getTicketPrice();
        return;
      }
      const buyTx = await buyContract.deposit(currentPower);
      setBuyTicketLoading(true);
      await buyTx.wait();
      setBuyTicketLoading(false);
      toast.success("Succesfully Bought Ticket", {
        position: "top-center",
      });

      handleClose();
    } catch (error) {
      console.log(error);
      toast.error(
        error
          ? error.reason !== undefined
            ? error.reason
            : error.message !== undefined
            ? error.message
            : "Something went wrong"
          : "Something went wrong",
        { position: toast.POSITION.TOP_CENTER }
      );
    }
  };

  const handleChangeTicketAmount = (value) => {
    const re = /^[0-9\b]+$/;
    if (value == '' || re.test(value)) {
      setTicketAmount(value);
  }
  };




  return (
    <>
      <button className="totalPrizeTicket" onClick={handleShow}>
        <HiOutlineTicket className="totalPrizeTicketIcon" />
        <div className="totalPrizeTicketText"> Buy Ticket</div>
      </button>
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Buy Ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="buyTicketInputWrapper">
            <div className="buyTicketInputWrapperTitle">Buy</div>

            <div className="buyTicketInputContent">
              <input
                type="text"
                className="buyTicketInput"
                // min={1}
                placeholder={ticketAmount === 0 ? "0" : "0"}
                onChange={(e) => handleChangeTicketAmount(e.target.value)}
                // onChange={(e) => setTicketAmount(e.target.value)}
                value={ticketAmount}
                maxLength={5}
              />
              <span style={{ cursor: "default" }}>Ticket</span>
            </div>
          </div>

          <div className="buyTicketCostWrapper">
            <span>Cost (1 Ticket)</span>
            <div className="costTicketWrapper">
              <span>
                ~{ticketFrokPrice !== null && ticketFrokPrice.toLocaleString()}{" "}
                FROK
              </span>

              {/* <span
                style={{
                  padding: "0 1rem",
                  fontSize: "13px",
                  color: "#b2afaf",
                }}
              >
                ~{ticketPrice !== null && ticketPrice} BNB
              </span> */}
            </div>
          </div>

          <div className="buyTicketCalculateWrapper">
            {ticketDiscountInfo !== null && ticketDiscountInfo?.state === true && (
              <div
                className="buyTicketCalculateContent"
                style={{
                  marginBottom: "1rem",
                }}
              >
                <div
                  className="costTicketWrapper"
                  style={{ alignItems: "start" }}
                >
                  <span>Discounted Price  <span style={{ color: "rgba(46, 182, 125, 1)" }}>
                    {(
                      (100 *
                        (ticketPrice !== null &&
                          Number(ticketPrice) -
                            Number(ticketDiscountInfo?.discount))) /
                      (ticketPrice !== null && ticketPrice)
                    ).toFixed(0)}
                    %
                  </span></span>
                 
                </div>

                <div className="costTicketWrapper">
                  <span>
                    ~
                    {ticketDiscountInfo?.frokDiscount !== null
                      ? (ticketDiscountInfo?.frokDiscount).toLocaleString()
                      : 0}{" "}
                    FROK
                  </span>
                  {/* <span
                    style={{
                      fontSize: "13px",
                      color: "#b2afaf",
                    }}
                  >
                    ~{ticketDiscountInfo?.discount} BNB
                  </span> */}
                </div>
              </div>
            )}

            <div className="buyTicketCalculateContent">
              <span>You Pay</span>
              <span>
                ~
                {ticketAmount > 0
                  ? (
                      ticketAmount *
                      (ticketDiscountInfo !== null &&
                        ticketDiscountInfo?.frokDiscount)
                    ).toLocaleString()
                  : 0}{" "}
                FROK
              </span>
            </div>
          </div>

          <div className="buyTicketInfo">
            <span style={{ color: "rgba(46, 182, 125, 1)" }}>
              After 2 weeks from Buy, you will get ~
              {ticketAmount > 0
                ? (
                    (ticketAmount *
                    (ticketDiscountInfo !== null &&
                      ticketDiscountInfo?.frokDiscount))*1.1
                  ).toLocaleString()
                : null}{" "}
              FROK{" "}
            </span>
          </div>

          <div className="buyTicketInfo">
            <span>
              "Buy Instantly" generates a random number for your ticket. 
              Prices are on 1 BNB or 2 BNB worth of FROK token staking depending on the week. 
              Bought ticket stakings can be seen in the Staking section.
            </span>
          </div>

          <div className="buyTicketButtonWrapper">
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
                {approveLoading && <i className="fas fa-spinner fa-spin"></i>}
              </button>
            ) : (
              <button
                className="buyTicketButton"
                disabled={buyTicketLoading || ticketAmount <= 0}
                style={{
                  cursor:
                    buyTicketLoading || ticketAmount <= 0
                      ? "not-allowed"
                      : "pointer",
                  opacity: buyTicketLoading || ticketAmount <= 0 ? "0.5" : "1",
                }}
                onClick={() => handleBuyTicket()}
              >
                Buy{" "}
                {buyTicketLoading && <i className="fas fa-spinner fa-spin"></i>}
              </button>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default BuyTicketModal;
