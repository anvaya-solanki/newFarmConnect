import React from "react";
import useOrder from "../../hooks/orders/useOrder";
import { useSelector } from "react-redux";
import Spinner from "../../components/loading/Spinner";
import { notify } from "../../utils/helper/notification";
import GooglePayButton from "@google-pay/button-react"; 
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

const PaymentCard = ({
  totalAmount,
  limitForFreeDelivery,
  deliveryCharge,
  customerLatitude,
  customerLongitude,
}) => {
  const cartData = useSelector((state) => state.cartReducer);
  const [cookies] = useCookies(["user_access_token"]);
  const navigate = useNavigate();
  const { orderProduct, isLoading: isPaymentInitiated } = useOrder();

  const orderNow = async () => {
    // Check if user is authenticated
    if (!cookies.user_access_token) {
      notify("Please login to continue with checkout", "info");
      navigate("/account/user");
      return;
    }

    // Check if location is available
    if (customerLatitude === null || customerLongitude === null) {
      notify("Please allow the location access", "info");
      return;
    }

    // Check if cart has items
    if (cartData.length === 0) {
      notify("Your cart is empty", "info");
      return;
    }

    try {
      const orderData = [];
      let hasMissingSellerId = false;
      
      for (const element of cartData) {
        // Ensure all required data is present
        if (!element._id) {
          notify("Some products in your cart are invalid", "error");
          return;
        }
        
        // Check if sellerId is missing
        if (!element.sellerId) {
          console.error(`Missing sellerId for product ${element.name} (${element._id})`);
          hasMissingSellerId = true;
        }
        
        orderData.push({
          productId: element._id,
          orderQty: element.qty,
          orderLocation: {
            coordinates: [customerLongitude, customerLatitude]
          },
          sellerId: element.sellerId,
        });
      }
      
      // Log cart data for debugging
      console.log("Order data details:", orderData.map(item => ({
        productId: item.productId,
        sellerId: item.sellerId,
        qty: item.orderQty
      })));
      
      // Warn if any sellerId is missing
      if (hasMissingSellerId) {
        notify("Some products in your cart are missing seller information. Please remove them and add them again.", "error");
        return;
      }

      // Log for debugging
      console.log("Placing order with user token:", cookies.user_access_token ? "Token exists" : "No token");
      console.log("Order data:", orderData);

      await orderProduct(orderData);
    } catch (error) {
      console.error("Error placing order:", error);
      notify("There was an error processing your order. Please try again.", "error");
    }
  };

  return (
    <div className="flex flex-col justify-center px-4 py-6 md:p-6 xl:p-8 w-full bg-gray-50  space-y-6">
      <h3 className="text-xl  font-semibold leading-5 text-gray-800">
        Shipping
      </h3>
      <div className="flex justify-between items-start w-full">
        <div className="flex justify-center items-center space-x-4">
          <div className="w-8 h-8">
            <img
            loading="lazy"
              className="w-full h-full"
              alt="logo"
              src="https://i.ibb.co/L8KSdNQ/image-3.png"
            />
          </div>
          <div className="flex flex-col justify-start items-center">
            <p className="text-lg leading-6  font-semibold text-gray-800">
              FarmConnect
              <br />
              <span className="font-normal">Delivery within 24 Hours</span>
            </p>
          </div>
        </div>
        <p className="text-lg font-semibold leading-6  text-gray-800">
          Rs.
          {totalAmount +
            (totalAmount >= limitForFreeDelivery ? 0 : deliveryCharge)}
          .00
        </p>
      </div>
      <div className="w-full flex justify-center items-center">
        {/* <button
          className="hover:bg-black    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 py-5 w-96 md:w-full bg-gray-800 text-base font-medium leading-4 text-white flex flex-row justify-center items-center"
          onClick={() => {
            if (cartData.length === 0) {
              notify("First add some items to cart", "info");
            } else {
              orderNow();
            }
          }}
        >
          {isPaymentInitiated && <Spinner width="w-6" color="#ffffff" />}
          Pay Now
        </button> */}
        <br/>
        <GooglePayButton
          environment="TEST"
          buttonColor="black"
          buttonType="long"
          buttonSizeMode="fill"
          paymentRequest={{
            apiVersion: 2,
            apiVersionMinor: 0,
            allowedPaymentMethods: [
              {
                type: 'CARD',
                parameters: {
                  allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                  allowedCardNetworks: ['MASTERCARD', 'VISA'],
                },
                tokenizationSpecification: {
                  type: 'PAYMENT_GATEWAY',
                  parameters: {
                    gateway: 'example',
                    gatewayMerchantId: 'exampleGatewayMerchantId',
                  },
                },
              },
            ],
            merchantInfo: {
              merchantId: '12345678901234567890',
              merchantName: 'FarmConnect',
            },
            transactionInfo: {
              totalPriceStatus: 'FINAL',
              totalPriceLabel: 'Total',
              totalPrice: (totalAmount + (totalAmount >= limitForFreeDelivery ? 0 : deliveryCharge)).toFixed(2),
              currencyCode: 'INR',
              countryCode: 'IN',
            },
            shippingAddressRequired: true,
            callbackIntents: ['PAYMENT_AUTHORIZATION']
          }}
          onLoadPaymentData={(paymentData) => {
            console.log('Payment Successful', paymentData);
            orderNow();
          }}
          onPaymentAuthorized={(paymentData) => {
            console.log('Payment Authorised Success', paymentData);
            return { transactionState: 'SUCCESS'};
          }}
          existingPaymentMethodRequired={false}
          onError={(error) => {
            console.error('Payment Error:', error);
            notify('Payment failed. Please try again.', 'error');
          }}
        />
        
      </div>
    </div>
  );
};

export default PaymentCard;
