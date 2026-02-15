// I'm using Open-Meteo because it's hackathon-friendly (no API keys!)
export const getLiveWeather = async (lat = -33.92, lon = 18.42) => { 
  // Defaulted to Cape Town coordinates as an example 
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    );
    const data = await response.json();
    
    return {
      temp: Math.round(data.current_weather.temperature),
      conditionCode: data.current_weather.weathercode,
      // I'm returning the raw temp to feed into our Warmth Logic
    };
  } catch (error) {
    console.error("Vara Weather Error:", error);
    return { temp: 20, conditionCode: 0 }; // Fallback to a nice spring day
  }
};