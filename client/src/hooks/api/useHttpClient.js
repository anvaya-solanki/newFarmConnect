import React, { useEffect, useState } from "react";
import axios from "axios";
import { notify } from "../../utils/helper/notification";
import { notifyType } from "../../utils/helper/notificationType";
import { useCookies } from "react-cookie";

axios.defaults.baseURL = import.meta.env.VITE_CROPCONNECT_API;

const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [cookies, setCookie] = useCookies([
    "user_access_token",
    "seller_access_token",
  ]);

  const sendRequest = async (
    url,
    method = "GET",
    body = null,
    headers = {},
    showToast = true,
    withCredentials = false
  ) => {
    setIsLoading(true);
    try {
      const response = await axios({
        url,
        method,
        data: body,
        headers,
        withCredentials,
      });

      if (response.data.cookies) {
        Object.keys(response.data.cookies).forEach((cookie) => {
          setCookie(cookie, response.data.cookies[cookie]);
        });
      }

      console.log("URL RESPONSE", url, " ", response);
      if (showToast) notify(response.data.message, "success");
      return response;
    } catch (error) {
      console.log(error);

      if (error.response.status === 504) {
        notify(
          "Gateway timeout occurred. Please try to reload the page.",
          "error"
        );
        return;
      }
      if (showToast)
        notify(error.response.data.message, notifyType(error.response.status));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendAuthorizedRequest = async (
    requestType = "user",
    url,
    method = "GET",
    body = null,
    headers = {},
    showToast = true,
    withCredentials = false
  ) => {
    if (requestType === "user" && !cookies.user_access_token) {
      notify("Please login as user to continue", "info");
      window.location.href = "/account/user";
      return false;
    }

    if (requestType === "seller" && !cookies.seller_access_token) {
      notify("Please login as seller to continue", "info");
      window.location.href = "/account/seller";
      return false;
    }

    try {
      const token = requestType === "user" 
        ? cookies.user_access_token 
        : cookies.seller_access_token;
      
      console.log(`Using ${requestType} token for ${url}:`, token ? "Token exists" : "No token");
      
      return await sendRequest(
        url,
        method,
        body,
        {
          authorization: `Bearer ${token}`,
          ...headers,
        },
        showToast,
        withCredentials
      );
    } catch (error) {
      console.error(`Auth request failed for ${url}:`, error);
      
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        if (requestType === "user") {
          setCookie("user_access_token", "", {expires: new Date(0)});
          notify("Your session has expired. Please login again.", "error");
          window.location.href = "/account/user";
        } else {
          setCookie("seller_access_token", "", {expires: new Date(0)});
          notify("Your session has expired. Please login again.", "error");
          window.location.href = "/account/seller";
        }
      }
      throw error;
    }
  };

  return { isLoading, sendRequest, sendAuthorizedRequest, setIsLoading };
};

export default useHttpClient;
