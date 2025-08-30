// models/Payment.js
import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  paymentId: { type: String },
  signature: { type: String },
  name: { type: String },
  email: { type: String },
  phone: { type: String },
  amount: { type: Number },
  currency: { type: String, default: "INR" },
  cart: { type: Object },
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Payment", PaymentSchema);
