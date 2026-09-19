import React from "react";
import { render } from "@react-email/render";
import WelcomeEmail from "./templates/WelcomeEmail.jsx";
import VerifyEmail from "./templates/VerifyEmail.jsx";
import PasswordReset from "./templates/PasswordReset.jsx";
import OrderConfirmation from "./templates/OrderConfirmation.jsx";
import OrderShipped from "./templates/OrderShipped.jsx";
import OrderDelivered from "./templates/OrderDelivered.jsx";

async function renderTemplate(element, subject) {
  return { subject, html: await render(element), text: await render(element, { plainText: true }) };
}

export const renderWelcomeEmail = (props) => renderTemplate(React.createElement(WelcomeEmail, props), "Welcome to Vanom");
export const renderVerifyEmail = (props) => renderTemplate(React.createElement(VerifyEmail, props), "Verify your Vanom email");
export const renderPasswordResetEmail = (props) => renderTemplate(React.createElement(PasswordReset, props), "Reset your password");
export const renderOrderConfirmationEmail = (props) => renderTemplate(React.createElement(OrderConfirmation, props), "Your order is confirmed");
export const renderOrderShippedEmail = (props) => renderTemplate(React.createElement(OrderShipped, props), "Your order has shipped");
export const renderOrderDeliveredEmail = (props) => renderTemplate(React.createElement(OrderDelivered, props), "Your order was delivered");
