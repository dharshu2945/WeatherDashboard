import { useState } from "react";

function WeatherApp() {
  const [city, setCity] = useState("");
  const [searchType, setSearchType] = useState("");
  const [date, setDate] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (!city || !searchType) {
      alert("Enter city and select search type");
      return;
    }

    try {
      setResults([]);

      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        alert("City not found");
        return;
      }

      const lat = geoData.results[0].latitude;
      const lon = geoData.results[0].longitude;

      const dailyParams =
        "temperature_2m_max,temperature_2m_min,temperature_2m_mean,relative_humidity_2m_mean,precipitation_sum,windspeed_10m_max";

      let startDate = "";
      let endDate = "";

      if (searchType === "date") {
        if (!date) return alert("Select a date");
        startDate = date;
        endDate = date;
      }

      if (searchType === "month") {
        if (!month || !year) return alert("Enter month and year");
        const m = month.padStart(2, "0");
        const lastDay = new Date(year, month, 0).getDate();
        startDate = `${year}-${m}-01`;
        endDate = `${year}-${m}-${lastDay}`;
      }

      if (searchType === "year") {
        if (!year) return alert("Enter year");
        startDate = `${year}-01-01`;
        endDate = `${year}-12-31`;
      }

      const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=${dailyParams}&timezone=auto`;

      const response = await fetch(url);
      const data = await response.json();

      if (!data.daily || !data.daily.time) {
        alert("No data available");
        return;
      }

      const formattedResults = data.daily.time.map((d, index) => ({
        date: d,
        maxTemp: data.daily.temperature_2m_max[index],
        minTemp: data.daily.temperature_2m_min[index],
        meanTemp: data.daily.temperature_2m_mean[index],
        humidity: data.daily.relative_humidity_2m_mean[index],
        precipitation: data.daily.precipitation_sum[index],
        windSpeed: data.daily.windspeed_10m_max[index],
      }));

      setResults(formattedResults.slice(0, 7));
    } catch {
      alert("Error fetching data");
    }
  };

  return (
    <div style={{ width: "90%", margin: "30px auto", textAlign: "center" }}>
      <h2>Weather Dashboard</h2>

      <div>
        <input
          type="text"
          placeholder="Enter City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
        >
          <option value="">Select Search Type</option>
          <option value="date">Search by Date</option>
          <option value="month">Search by Month</option>
          <option value="year">Search by Year</option>
        </select>

        {searchType === "date" && (
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        )}

        {searchType === "month" && (
          <>
            <input
              type="number"
              placeholder="Month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
            <input
              type="number"
              placeholder="Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </>
        )}

        {searchType === "year" && (
          <input
            type="number"
            placeholder="Enter Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        )}

        <button onClick={handleSearch}>Search</button>
      </div>

      {results.length > 0 && (
        <table
          border="1"
          style={{ width: "100%", marginTop: "20px", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th>Date</th>
              <th>Max Temp</th>
              <th>Min Temp</th>
              <th>Mean Temp</th>
              <th>Humidity</th>
              <th>Precipitation</th>
              <th>Wind Speed</th>
            </tr>
          </thead>
          <tbody>
            {results.map((item, index) => (
              <tr key={index}>
                <td>{item.date}</td>
                <td>{item.maxTemp}</td>
                <td>{item.minTemp}</td>
                <td>{item.meanTemp}</td>
                <td>{item.humidity}</td>
                <td>{item.precipitation}</td>
                <td>{item.windSpeed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default WeatherApp;

