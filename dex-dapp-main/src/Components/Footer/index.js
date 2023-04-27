import React from "react";
import "./index.css";
import { Container, Row, Col } from "react-bootstrap";
import HeaderLogo from "../../Assets/etm.png";
import { BsDiscord, BsReddit, BsTwitter, BsGithub } from "react-icons/bs";
import { FaTelegram } from "react-icons/fa";
import { TfiWorld } from "react-icons/tfi";

function Footer() {
  return (
    <div className="footerBackground">
      <Container>
        <Row>
          <Col>
            <div className="footerMain">
              <div className="footerRight">
                <img className="footerLogo" src={HeaderLogo} />
                <div className="footerRightText">Escape The Matrix</div>
              </div>
              <div className="footerLeft">
                <div className="footerLeftText">
                  Copyright @ Escape The Matrix 2022
                </div>
                <div className="footerLeftIcons">
                  <a
                    href="https://t.me/etm_coin"
                    target="_blank"
                    className="navBarLinkIcon"
                  >
                    <FaTelegram />
                  </a>
                  <a
                    href="https://twitter.com/ETM_coin"
                    target="_blank"
                    className="navBarLinkIcon"
                  >
                    <BsTwitter />
                  </a>
                  <a
                    href="https://www.escapethematrix.finance/"
                    className="navBarLinkIcon"
                  >
                    <TfiWorld />
                  </a>
                  <a
                    href="https://discord.gg/9mtHjVrZbt"
                    className="navBarLinkIcon"
                  >
                    <BsDiscord />
                  </a>
                </div>
              </div>
              <div className="footerLeftMobile">
                <div className="footerLeftIconsMobile">
                  <a
                    href="https://t.me/etm_coin"
                    target="_blank"
                    className="navBarLinkIcon"
                  >
                    <FaTelegram />
                  </a>
                  <a
                    href="https://twitter.com/ETM_coin"
                    target="_blank"
                    className="navBarLinkIcon"
                  >
                    <BsTwitter />
                  </a>
                  <a
                    href="https://www.escapethematrix.finance/"
                    className="navBarLinkIcon"
                  >
                    <TfiWorld />
                  </a>
                  <a
                    href="https://discord.gg/9mtHjVrZbt"
                    className="navBarLinkIcon"
                  >
                    <BsDiscord />
                  </a>
                </div>
                <div className="footerLeftTextMobile">
                  Copyright @ Escape The Matrix 2022
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Footer;
