import React from "react";
import useHttpClient from "../api/useHttpClient";
import { CROP_PREDICTOR } from "../../constants/apiEndpoints";

const useAI = () => {
  const { sendRequest, isLoading } = useHttpClient();

  const predictCrops = async (formData) => {
    console.log(`sending formData to backend`, formData);
    const resp = await sendRequest(
      CROP_PREDICTOR(
        formData.soil,
        formData.altitude,
        formData.temperature,
        formData.humidity,
        formData.rainfall
      ),
      "GET",
      null,
      null,
      false
    );
    console.log("Response from backend:", resp);
    return resp.data.prediction;
  };

  return { isLoading, predictCrops };
};

export default useAI;
