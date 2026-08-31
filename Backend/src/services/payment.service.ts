import Razorpay from "razorpay";

import { config } from "../types/config.js";

interface CreateOrderParams {
  amount: number;
  currency?: "INR" | "USD" | "EUR" | "GBP";
}
/**
 * @description
 * Initialize the Razorpay client using the API key and private secret.
 *
 * This client is used to securely create and manage Razorpay orders
 * and process payment-related operations from the backend.
 *
 * The Razorpay secret must remain private and should never be exposed
 * to the frontend or committed to source control.
 */

const razorpay = new Razorpay({
  key_id: config.RAZORPAY_KEY_ID,
  key_secret: config.RAZORPAY_KEY_SECRET,
});

export const createOrder = async ({ amount, currency = "INR" }: CreateOrderParams) => {
  const options = {
    amount: amount * 100, // amount in the smallest currency unit
    currency,
  };

  const order = await razorpay.orders.create(options);

  return order;
};
