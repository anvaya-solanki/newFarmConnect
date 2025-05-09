const OpenAI = require("openai");

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function cropPredictorServices(soil, altitude, temperature, humidity, rainfall) {
  try {
    console.log("Starting crop prediction with parameters:", {
      soil,
      altitude,
      temperature,
      humidity,
      rainfall
    });

    // Validate parameters
    const altitudeNum = parseFloat(altitude);
    const temperatureNum = parseFloat(temperature);
    const humidityNum = parseFloat(humidity);
    const rainfallNum = parseFloat(rainfall);

    if (isNaN(altitudeNum) || isNaN(temperatureNum) || isNaN(humidityNum) || isNaN(rainfallNum)) {
      throw new Error("Invalid numerical parameters provided");
    }

    if (altitudeNum < 0 || altitudeNum > 10) {
      throw new Error("Altitude must be between 0 and 10 kilometers");
    }

    if (temperatureNum < -50 || temperatureNum > 50) {
      throw new Error("Temperature must be between -50 and 50 degrees Celsius");
    }

    if (humidityNum < 0 || humidityNum > 100) {
      throw new Error("Humidity must be between 0 and 100 percent");
    }

    if (rainfallNum < 0 || rainfallNum > 1000) {
      throw new Error("Rainfall must be between 0 and 1000 mm");
    }

    console.log("Creating OpenAI chat completion...");
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert agricultural AI assistant. Provide crop predictions and recommendations based on environmental factors. 
          Keep responses concise, practical, and focused on actionable advice. Include specific crop suggestions and brief explanations.`
        },
        {
          role: "user",
          content: `Predict the crops and give me data based on these environmental factors:
          Soil type: ${soil}
          Altitude (in km): ${altitudeNum}
          Temperature (in degree Celsius): ${temperatureNum}
          Humidity (in %): ${humidityNum}
          Rainfall (in mm): ${rainfallNum}
          
          Note: Ensure the following conditions are met:
          - Altitude should be a numerical value between 0 and 10 (kilometers)
          - Temperature should be a numerical value between -50 and 50 (degree Celsius)
          - Humidity should be a numerical value between 0 and 100 (%)
          - Rainfall should be a numerical value between 0 and 1000 (mm)
          
          Provide a clear, structured response with specific crop recommendations.`
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    console.log("OpenAI response received:", completion);

    if (!completion.choices || completion.choices.length === 0) {
      throw new Error("No response received from OpenAI");
    }

    const response = completion.choices[0].message.content;
    console.log("Processed response:", response);
    return response;
  } catch (error) {
    console.error("Error in crop prediction service:", {
      message: error.message,
      stack: error.stack,
      details: error.response?.data || error
    });
    throw error;
  }
}

module.exports = cropPredictorServices;

