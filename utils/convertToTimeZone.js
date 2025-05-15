// לייצר בדיקה להתאמת עיר ומדינה או להשאיר לצד לקוח

const cityTimezones = require("city-timezones");
const axios = require("axios");
require("dotenv").config();

const getTimezone = async (city, country) => {
  // 1. חיפוש מקומי
  const results = cityTimezones.lookupViaCity(city);
  const filtered = results.find(
    (entry) => entry.country.toLowerCase() === country.toLowerCase()
  );
  if (filtered) {
    console.log(`from local, ${filtered.timezone}`);

    return filtered.timezone;
  }

  // 2. OpenCage
  try {
    const query = encodeURIComponent(`${city}, ${country}`);
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${query}&key=${process.env.OPENCAGE_API_KEY}&language=en&limit=1`;
    const { data } = await axios.get(url);
    if (data.results.length) {
      // console.log((components = data.results[0].components));

      const timezone = data.results[0].annotations.timezone.name;
      console.log("[API] Found via OpenCage:", timezone);
      return timezone;
    } else {
      console.warn("[API] No results from OpenCage");
      return null;
    }
  } catch (err) {
    console.error("OpenCage API error:", err.message);
    return null;
  }
}

// getTimezone("tel aviv", "israel").then((tz) => console.log("Final Timezone:", tz));
// getTimezone("tel aviv", "china")
// getTimezone("bney brak", "israel");

module.exports = getTimezone;
