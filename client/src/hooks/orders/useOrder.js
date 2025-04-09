import React from "react";
import useHttpClient from "../api/useHttpClient";
import { GET_SELLER_ORDERS, ORDER_PRODUCT } from "../../constants/apiEndpoints";
import { removeFromCart } from "../../redux/actions";
import { useDispatch } from "react-redux";
import { useCookies } from "react-cookie";
import { notify } from "../../utils/helper/notification";

const useOrder = () => {
  const dispatch = useDispatch();
  const [cookies] = useCookies(["user_access_token", "seller_access_token"]);
  const { sendAuthorizedRequest, isLoading, sendRequest } = useHttpClient();

  const orderProduct = async (orderData) => {
    try {
      // Check if user is authenticated
      if (!cookies.user_access_token) {
        notify("Please login as user to place an order", "error");
        return { success: false, message: "Authentication required" };
      }

      console.log("Attempting to place order with token:", cookies.user_access_token ? "Token exists" : "No token");
      
      let res = await sendAuthorizedRequest(
        "user",
        ORDER_PRODUCT,
        "POST",
        orderData
      );

      if (res !== false) {
        // Successfully placed order, now clear the cart
        for (const item of orderData) {
          dispatch(removeFromCart(item.productId));
        }
        return { success: true, data: res.data };
      } else {
        return { success: false, message: "Failed to place order" };
      }
    } catch (error) {
      console.error("Error placing order:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Failed to place order" 
      };
    }
  };

  const getSellerOrders = async () => {
    try {
      // Check if seller is authenticated
      if (!cookies.seller_access_token) {
        notify("Please login as seller to view orders", "error");
        return [];
      }

      const res = await sendAuthorizedRequest(
        "seller",
        GET_SELLER_ORDERS,
        "GET"
      );
      
      return res ? res.data : [];
    } catch (error) {
      console.error("Error fetching seller orders:", error);
      return [];
    }
  };

  return { orderProduct, getSellerOrders, isLoading };
};

export default useOrder;
