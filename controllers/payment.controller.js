import { stripeInt } from "../config/stripe.js";
import {
  errorResponse,
  infoResponse,
  successResponse,
} from "../utils/apiResponse.js";
// payment intent
const newPayment = async (req, res) => {
  const session = await stripeInt.paymentIntents.create({
    amount: 100,
    description: "this is payment for shoe",
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
  });
  return successResponse(res, 200, "succesfull", {
    client_secret: session?.client_secret,
  });
};
// chekcout session
const checkout = async (req, res) => {
  const { productData, delivery, discountCode, addressId, userId } = req.body;
  let line_items = productData?.map((ele) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: ele?.name,
        images: ele.image ? [ele.image] : undefined,
      },
      unit_amount: ele?.price * 100 > 0 ? ele?.price * 100 : -ele?.price * 100,
    },
    quantity: ele?.quantity,
  }));
  // line_items.push({
  //   price_data: {
  //     currency: "usd",
  //     product_data: {
  //       name: delivery?.name,
  //     },
  //     unit_amount: delivery?.price * 100,
  //   },
  //   quantity: delivery?.quantity,
  // });

  // add charges for shiiping
  const shippingRate = await stripeInt.shippingRates.create({
    display_name: delivery?.name,
    type: "fixed_amount",
    fixed_amount: {
      amount: delivery?.price * 100,
      currency: "usd",
    },
    delivery_estimate: {
      minimum: {
        unit: "business_day",
        value: 5,
      },
      maximum: {
        unit: "business_day",
        value: 7,
      },
    },
  });
  // ingrate discount coupon
  const coupon = await stripeInt.coupons.create({
    percent_off: discountCode?.percent,
    duration: "forever",
  });
  // checkout session
  const session = await stripeInt.checkout.sessions.create({
    line_items: line_items,
    mode: "payment",
    shipping_options: [
      {
        shipping_rate: shippingRate.id,
      },
    ],
    discounts: [
      {
        coupon: coupon.id,
      },
    ],
    success_url: `${process.env.APP_URL}/payment?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.APP_URL}/payment`,
    metadata: {
      address: addressId,
      userId: userId,
    },
  });

  return successResponse(res, 200, "session created", {
    paymentUrl: session.url,
    sessionId: session.id,
  });
};

const verifyPayment = async (req, res, next) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return infoResponse(res, 404, "Please provide a valid sessionId");
  }

  // Retrieve the session from Stripe
  const session = await stripeInt.checkout.sessions.retrieve(sessionId);
  // Check the payment status
  if (session.payment_status === "paid") {
    return successResponse(res, 200, "Payment successful", session);
    // res.status(200).json({ message: "Payment successful", session });
  } else if (session.payment_status === "unpaid") {
    return errorResponse(res, 400, "Payment not completed", session);
    // res.status(400).json({ message: "Payment not completed", session });
  } else {
    return errorResponse(
      res,
      400,
      `Payment status: ${session.payment_status}`,
      session
    );
  }
};

export { newPayment, checkout, verifyPayment };
