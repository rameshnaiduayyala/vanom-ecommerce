import React from "react";
import { Section, Row, Column, Img, Link } from "@react-email/components";
import { env } from "../../config/env.js";

export function Header() {
  return (
    <Section style={{ paddingTop: 40, paddingBottom: 40, paddingLeft: 32, paddingRight: 32 }}>
      <Row>
        <Column style={{ width: "80%" }}>
          <Img
            alt="Vanom logo"
            width="180"
            height="60"
            src={`${env.assetPublicUrl.replace(/\/$/, "")}/logo.png`}
          />
        </Column>
        <Column align="right">
          <Row align="right">
            <Column>
              <Link href="#">
                <Img alt="X" height="36" width="36" src="https://react.email/static/x-logo.png" style={{ marginLeft: 4, marginRight: 4 }} />
              </Link>
            </Column>
            <Column>
              <Link href="#">
                <Img alt="Instagram" height="36" width="36" src="https://react.email/static/instagram-logo.png" style={{ marginLeft: 4, marginRight: 4 }} />
              </Link>
            </Column>
            <Column>
              <Link href="#">
                <Img alt="Facebook" height="36" width="36" src="https://react.email/static/facebook-logo.png" style={{ marginLeft: 4, marginRight: 4 }} />
              </Link>
            </Column>
          </Row>
        </Column>
      </Row>
    </Section>
  );
}
