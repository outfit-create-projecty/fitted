"use client";

import { useState, useEffect } from "react";

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  emoji: string;
  time: string;
  isDaytime: boolean;
  timeEmoji: string;
  description: string;
}

export default function WeatherInfo() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentTimeEmoji, setCurrentTimeEmoji] = useState<string>("");

  // Function to update time and time emoji
  const updateTime = () => {
    const now = new Date();
    const timeOptions: Intl.DateTimeFormatOptions = { 
      hour: 'numeric', 
      minute: '2-digit',
      second: '2-digit', // Added seconds for more frequent updates
      hour12: true 
    };
    const timeString = now.toLocaleTimeString(undefined, timeOptions);
    setCurrentTime(timeString);
    console.log("Time updated:", timeString); // Debug log

    // Update time emoji based on hour
    const hour = now.getHours();
    const isDaytime = hour >= 6 && hour < 18;
    
    if (isDaytime) {
      setCurrentTimeEmoji("🌞");
    } else {
      // For night, determine moon phase based on date
      const dayOfMonth = now.getDate();
      if (dayOfMonth >= 1 && dayOfMonth <= 7) {
        setCurrentTimeEmoji("🌑");
      } else if (dayOfMonth >= 8 && dayOfMonth <= 14) {
        setCurrentTimeEmoji("🌒");
      } else if (dayOfMonth >= 15 && dayOfMonth <= 21) {
        setCurrentTimeEmoji("🌓");
      } else if (dayOfMonth >= 22 && dayOfMonth <= 28) {
        setCurrentTimeEmoji("🌔");
      } else {
        setCurrentTimeEmoji("🌕");
      }
    }
  };

  // Set up interval to update time every second
  useEffect(() => {
    // Initial update
    updateTime();
    
    // Set up interval for updates - update every second instead of every minute
    const intervalId = setInterval(updateTime, 1000); // Update every second
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        // First, get the user's IP address
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        if (!ipResponse.ok) {
          throw new Error("Failed to fetch IP address");
        }
        const ipData = await ipResponse.json();
        const ip = ipData.ip;
        console.log("IP address:", ip);

        // Then, get the location data based on IP
        const locationResponse = await fetch(`https://ipapi.co/${ip}/json/`);
        if (!locationResponse.ok) {
          throw new Error("Failed to fetch location data");
        }
        const locationData = await locationResponse.json();
        console.log("Location data:", locationData);
        
        // Get the API key from environment variables
        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
        
        if (!apiKey) {
          throw new Error("OpenWeather API key is missing");
        }
        
        // Get weather data using the location coordinates - using imperial units for Fahrenheit
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${locationData.latitude}&lon=${locationData.longitude}&units=imperial&appid=${apiKey}`;
        console.log("Weather URL:", weatherUrl);
        
        const weatherResponse = await fetch(weatherUrl);
        
        if (!weatherResponse.ok) {
          const errorText = await weatherResponse.text();
          console.error("Weather API error response:", errorText);
          throw new Error(`Failed to fetch weather data: ${weatherResponse.status}`);
        }
        
        const data = await weatherResponse.json();
        console.log("Weather data:", data);
        
        // Get current time in the user's timezone
        const now = new Date();
        const timeOptions: Intl.DateTimeFormatOptions = { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        };
        const timeString = now.toLocaleTimeString(undefined, timeOptions);
        
        // Determine if it's daytime or nighttime
        const hour = now.getHours();
        const isDaytime = hour >= 6 && hour < 18; // Consider 6 AM to 6 PM as daytime
        
        // Get time of day emoji
        const getTimeEmoji = () => {
          if (isDaytime) {
            return "🌞"; // Sun for daytime
          } else {
            // For night, try to determine moon phase based on date
            // This is a simplified approach - not as accurate as an API
            const dayOfMonth = now.getDate();
            if (dayOfMonth >= 1 && dayOfMonth <= 7) {
              return "🌑"; // New moon
            } else if (dayOfMonth >= 8 && dayOfMonth <= 14) {
              return "🌒"; // Waxing crescent
            } else if (dayOfMonth >= 15 && dayOfMonth <= 21) {
              return "🌓"; // First quarter
            } else if (dayOfMonth >= 22 && dayOfMonth <= 28) {
              return "🌔"; // Waxing gibbous
            } else {
              return "🌕"; // Full moon
            }
          }
        };
        
        // Get simple weather description
        const getWeatherDescription = (condition: string) => {
          const conditionLower = condition.toLowerCase();
          
          if (conditionLower.includes("clear") || conditionLower.includes("sun")) {
            return "Clear";
          } else if (conditionLower.includes("cloud")) {
            return "Cloudy";
          } else if (conditionLower.includes("rain") || conditionLower.includes("drizzle")) {
            return "Rainy";
          } else if (conditionLower.includes("snow")) {
            return "Snowy";
          } else if (conditionLower.includes("thunder") || conditionLower.includes("storm")) {
            return "Stormy";
          } else if (conditionLower.includes("mist") || conditionLower.includes("fog")) {
            return "Foggy";
          } else {
            return "Partly Cloudy";
          }
        };
        
        // Map weather condition to emoji, considering time of day
        const getWeatherEmoji = (condition: string) => {
          const conditionLower = condition.toLowerCase();
          
          if (conditionLower.includes("clear") || conditionLower.includes("sun")) {
            return isDaytime ? "☀️" : "🌙"; // Sun for day, moon for night
          } else if (conditionLower.includes("cloud")) {
            return isDaytime ? "☁️" : "☁️"; // Same cloud emoji for both
          } else if (conditionLower.includes("rain") || conditionLower.includes("drizzle")) {
            return "🌧️";
          } else if (conditionLower.includes("snow")) {
            return "❄️";
          } else if (conditionLower.includes("thunder") || conditionLower.includes("storm")) {
            return "⛈️";
          } else if (conditionLower.includes("mist") || conditionLower.includes("fog")) {
            return "🌫️";
          } else {
            return isDaytime ? "🌤️" : "🌙"; // Partly cloudy for day, moon for night
          }
        };

        setWeatherData({
          location: `${locationData.city || "Unknown"}, ${locationData.country_name || "Unknown"}`,
          temperature: Math.round(data.main.temp),
          condition: data.weather[0].main,
          emoji: getWeatherEmoji(data.weather[0].main),
          time: timeString,
          isDaytime,
          timeEmoji: getTimeEmoji(),
          description: getWeatherDescription(data.weather[0].main)
        });
      } catch (err) {
        console.error("Error fetching weather data:", err);
        setError(`Unable to fetch weather data: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-2 text-green-100">
        <p>Loading weather information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-2 text-green-100">
        <p>{error}</p>
      </div>
    );
  }

  if (!weatherData) {
    return null;
  }

  return (
    <div className="text-center py-2 text-green-100">
      <p className="text-lg">
        <span className="font-medium">{weatherData.location}</span> • {weatherData.emoji} {weatherData.description} • {weatherData.temperature}°F • {currentTime} {currentTimeEmoji}
      </p>
    </div>
  );
} 