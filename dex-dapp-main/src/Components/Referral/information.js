import React, { useEffect, useState } from "react";
import "./referral.css";
import { Container, Row, Col } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import { FaRegCopy } from "react-icons/fa";
import { FaPencilAlt } from "react-icons/fa";
import BuyReferralsCard from "./buyReferral";
import { toast } from "react-toastify";
import { useAccount, useBalance, useNetwork, useSigner } from "wagmi";
import { ethers } from "ethers";
import { TokenAddress, TokenABI } from "../../contract";
import { FaRandom } from "react-icons/fa";
import { AiFillRightCircle } from "react-icons/ai";

function ProfileInformation() {
  const { address } = useAccount();

  const { chain } = useNetwork();

  const chainRpcUrl = chain?.rpcUrls?.default;
  const { data: signer } = useSigner();

  const provider = new ethers.providers.StaticJsonRpcProvider(
    chainRpcUrl === undefined ? process.env.REACT_APP_DEFAULT_CHAIN_RPC : chainRpcUrl
  );

  const currentAddress =
    address === undefined
      ? "0x0000000000000000000000000000000000000000"
      : address;

  const [getuserReferralCode, setGetUserReferralCode] = useState("");
  const [userReferralCode, setUserReferralCode] = useState("");
  const [referralSetLoading, setReferralSetLoading] = useState(false);
  const [referralSelfLoading, setReferralSelfLoading] = useState(false);
  const [userReferrerAddress, setUserReferrerAddress] = useState("");
  const [userReferralCodeSetted, setUserReferralCodeSetted] = useState("");

  const [userReferralCodeState, setUserReferralCodeState] = useState(
    getuserReferralCode === "" ? true : false
  );

  const [editState, setEditState] = useState(false);

  const [selfUserInputState, setSelfUserInputState] = useState(false);

  const handleSelfRefCode = async () => {
    setSelfUserInputState(true);
    setUserReferralCodeSetted("");
  };

  useEffect(() => {
    setUserReferralCodeState(getuserReferralCode === "" ? true : false);
  }, [address]);

  const [usingReferralCodeSetting, setUsingReferralCodeSetting] = useState("");
  const getActiveReferralCode = async () => {
    try {
      const tokenContract = new ethers.Contract(
        TokenAddress,
        TokenABI,
        provider
      );

      const userReferralCode = await tokenContract.addressToReferrals(
        currentAddress
      );

      const activeReferralCode = ethers.utils.parseBytes32String(
        userReferralCode.referrerCode
      );

      setUsingReferralCodeSetting(activeReferralCode);
    } catch (e) {}
  };

  useEffect(() => {
    getActiveReferralCode();
  }, [currentAddress]);

  // Your Referrals Code
  let referralCode = "12345678902";
  const handleCopyReferralCode = async (value) => {
    navigator.clipboard.writeText(value);
    toast.success("Referral code copied", {
      position: toast.POSITION.TOP_CENTER,
    });
  };

  //getRefferalCodeFromAddress
  const makeReferall = async () => {
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < 9; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    setUserReferralCode(result);
  };

  const getRefferalCodeFromAddress = async () => {
    const referralCodeContract = new ethers.Contract(
      TokenAddress,
      TokenABI,
      provider
    );

    try {
      const referralCode = await referralCodeContract.addressToReferrals(
        currentAddress
      );

      if (ethers.utils.parseBytes32String(referralCode[0]) == "") {
        setGetUserReferralCode("");
      } else {
        setGetUserReferralCode(
          ethers.utils.parseBytes32String(referralCode[0])
        );
        setUserReferrerAddress(referralCode.user);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getRefferalCodeFromAddress();
  }, [address, chainRpcUrl]);

  const handleUserReferralCode = async () => {
    if (signer === undefined || signer === null) {
      toast.error("Please connect your wallet", {
        position: toast.POSITION.TOP_CENTER,
      });
      return;
    }
    const currentSigner =
      signer === undefined || signer === null ? provider : signer;

    const referralCodeContract = new ethers.Contract(
      TokenAddress,
      TokenABI,
      currentSigner
    );

    if (userReferralCode === "") {
      toast.error("Please enter referral code", {
        position: toast.POSITION.TOP_CENTER,
      });
      return;
    }
    if (userReferralCode.length !== 9) {
      toast.error("Please enter valid referral code", {
        position: toast.POSITION.TOP_CENTER,
      });
      return;
    }

    const currentRefCode = userReferralCode.toUpperCase();

    try {
      setReferralSetLoading(true);

      const referralCodeTx = await referralCodeContract.generateMyReferral(
        currentRefCode
      );
      await referralCodeTx.wait();
      setReferralSetLoading(false);
      getRefferalCodeFromAddress();
      setUserReferralCodeState(false);
      toast.success("Referral code set successfully", {
        position: toast.POSITION.TOP_CENTER,
      });
    } catch (err) {
      setReferralSetLoading(false);
      console.log(err);
      toast.error(
        err
          ? err.reason == undefined
            ? err.reason !== undefined
              ? err.message
              : "Referral code set failed"
            : err.reason
          : "Referral code set failed",
        {
          position: toast.POSITION.TOP_CENTER,
        }
      );
    }
  };

  const handleUserSelfReferralCode = async () => {
    if (signer === undefined || signer === null) {
      toast.error("Please connect your wallet", {
        position: toast.POSITION.TOP_CENTER,
      });
      return;
    }
    const currentSigner =
      signer === undefined || signer === null ? provider : signer;

    const referralCodeContract = new ethers.Contract(
      TokenAddress,
      TokenABI,
      currentSigner
    );

    if (userReferralCodeSetted === "") {
      toast.error("Please enter referral code", {
        position: toast.POSITION.TOP_CENTER,
      });
      return;
    }
    if (userReferralCodeSetted.length !== 9) {
      toast.error("Please enter valid referral code", {
        position: toast.POSITION.TOP_CENTER,
      });
      return;
    }

    const currentRefCode = userReferralCodeSetted.toUpperCase();

    try {
      setReferralSelfLoading(true);

      const referralCodeTx = await referralCodeContract.setReferrerToSystem(
        currentRefCode
      );
      await referralCodeTx.wait();
      setReferralSelfLoading(false);
      getRefferalCodeFromAddress();
      setUserReferralCodeState(false);
      setSelfUserInputState(false);
      toast.success("Referral code set successfully", {
        position: toast.POSITION.TOP_CENTER,
      });
    } catch (err) {
      setReferralSelfLoading(false);
      console.log(err);
      toast.error("Referral code set failed", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  return (
    <div className="profileMain">
      <Container>
        <Row>
          <Col lg={{ span: 12 }}>
            <div className="profileInformations">
              <div className="profileInformationsHeader">
                <div className="profileYourReferrals">
                  <div className="profileInformationsBodyParts">
                    <Form.Label className="profileInfoLabel">
                      Your Referral Code{" "}
                      {referralSetLoading && (
                        <i className="fa fa-spinner fa-spin"></i>
                      )}
                      {(getuserReferralCode === "" || editState) && (
                        <FaRandom
                          className="generateButton"
                          style={{
                            color: "#fff",
                            cursor: referralSetLoading
                              ? "not-allowed"
                              : "pointer",
                          }}
                          onClick={() => !referralSetLoading && makeReferall()}
                          disabled={referralSetLoading}
                        />
                      )}
                    </Form.Label>

                    {getuserReferralCode === "" || editState ? (
                      <input
                        className="profileInput"
                        style={{
                          backgroundColor: "red",
                        }}
                        type="text"
                        placeholder="Create Code"
                        // getuserReferralCode === ""
                        //   ? "Create Code"
                        //   : getuserReferralCode

                        maxLength={9}
                        value={userReferralCode}
                        onChange={(e) => setUserReferralCode(e.target.value)}
                      />
                    ) : (
                      <span className="profileInput">
                        {getuserReferralCode}
                      </span>
                    )}

                    {getuserReferralCode === "" || editState ? (
                      <AiFillRightCircle
                        className="referralsIconSubmit"
                        style={{
                          color: referralSetLoading && "gray",
                          cursor: referralSetLoading && "not-allowed",
                        }}
                        onClick={() =>
                          !referralSetLoading && handleUserReferralCode()
                        }
                      />
                    ) : (
                      <>
                        <FaPencilAlt
                          className="referralsIconGiven"
                          onClick={() => setEditState(true)}
                        />

                        <FaRegCopy
                          className="referralsIconGivenCopy"
                          onClick={() =>
                            handleCopyReferralCode(getuserReferralCode)
                          }
                        />
                      </>
                    )}
                  </div>
                </div>

                <div className="profileYourReferrals">
                  <div className="profileInformationsBodyParts">
                    <Form.Label className="profileInfoLabel">
                      Refferal Code You are Using{" "}
                      {referralSelfLoading && (
                        <i className="fa fa-spinner fa-spin"></i>
                      )}
                    </Form.Label>

                    {usingReferralCodeSetting === "" || selfUserInputState ? (
                      <input
                        type="text"
                        placeholder="Ex: WSFH4891W"
                        className="profileInput"
                        maxLength="9"
                        value={userReferralCodeSetted}
                        onChange={(e) =>
                          setUserReferralCodeSetted(e.target.value)
                        }
                      />
                    ) : (
                      <span className="profileInput">
                        {usingReferralCodeSetting}
                      </span>
                    )}

                    {usingReferralCodeSetting === "" || selfUserInputState ? (
                      <>
                        <AiFillRightCircle
                          className="referralsIconSubmit"
                          style={{
                            color: referralSelfLoading && "gray",
                            cursor: referralSelfLoading && "not-allowed",
                          }}
                          onClick={() =>
                            !referralSelfLoading && handleUserSelfReferralCode()
                          }
                        />
                      </>
                    ) : (
                      <>
                        <FaPencilAlt
                          className="referralsIconGiven"
                          onClick={() => handleSelfRefCode()}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>

              <BuyReferralsCard />

              <div className="profileYourReferralsMain">
                {/* <div className="profileYourReferralsTitle">Lorem Ipsum</div>
                <div className="profileYourReferralsText">
                  Lorem ıpsum dolor sit amet, consectetur adipiscing elit. Sed
                  vitae nisl euismod, aliquam nisl eu, aliquam nisl eu, aliquam
                  nisl eu, aliquam nisl eu, aliquam nisl eu, aliquam nisl eu,
                  aliquam nisl eu, aliquam nisl eu, aliquam nisl eu, aliquam
                  nisl
                </div> */}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default ProfileInformation;
