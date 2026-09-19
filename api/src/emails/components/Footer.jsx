import React from "react";
import { Section, Img, Text, Row, Column, Link } from "@react-email/components";

export function Footer() {
  return (
    <Section style={{ textAlign: "center" }}>
      <table style={{ width: "100%" }}>
        <tbody>
          <tr style={{ width: "100%" }}>
            <td align="center">
              <Img alt="React Email logo" height="42" width="42" src="https://react.email/static/logo-without-background.png" />
            </td>
          </tr>
          <tr style={{ width: "100%" }}>
            <td align="center">
              <Text style={{ marginTop: 8, marginBottom: 8, fontSize: 16, lineHeight: "24px", fontWeight: 600, color: "rgb(17,24,39)" }}>
                Vanom
              </Text>
              <Text style={{ marginTop: 4, marginBottom: 0, fontSize: 16, lineHeight: "24px", color: "rgb(107,114,128)" }}>
                Shop with confidence
              </Text>
            </td>
          </tr>
          <tr>
            <td align="center">
              <Row style={{ display: "table-cell", height: 44, width: 56, verticalAlign: "bottom" }}>
                <Column style={{ paddingRight: 8 }}>
                  <Link href="#"><Img alt="Facebook" height="36" width="36" src="https://react.email/static/facebook-logo.png" /></Link>
                </Column>
                <Column style={{ paddingRight: 8 }}>
                  <Link href="#"><Img alt="X" height="36" width="36" src="https://react.email/static/x-logo.png" /></Link>
                </Column>
                <Column>
                  <Link href="#"><Img alt="Instagram" height="36" width="36" src="https://react.email/static/instagram-logo.png" /></Link>
                </Column>
              </Row>
            </td>
          </tr>
          <tr>
            <td align="center">
              <Text style={{ marginTop: 8, marginBottom: 8, fontSize: 16, lineHeight: "24px", fontWeight: 600, color: "rgb(107,114,128)" }}>
                123 Main Street Anytown, CA 12345
              </Text>
              <Text style={{ marginTop: 4, marginBottom: 0, fontSize: 16, lineHeight: "24px", fontWeight: 600, color: "rgb(107,114,128)" }}>
                mail@example.com +123456789
              </Text>
            </td>
          </tr>
        </tbody>
      </table>
    </Section>
  );
}
