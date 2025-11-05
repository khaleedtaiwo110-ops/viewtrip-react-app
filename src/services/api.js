// src/services/api.js
export const fetchAmadeusData = async (query) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/search?keyword=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch Amadeus data");
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("❌ API error:", error);
    return [];
  }
};


