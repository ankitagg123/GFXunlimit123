import { useEffect, useState } from "react";
import axios from "axios";

export default function useTrendingKeywords() {

  const [trendingKeywords, setTrendingKeywords] = useState([]);

  async function fetchTrendingKeywords() {

    try {

      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/trending-keywords`
      );

      setTrendingKeywords(res.data);

    } catch (err) {

      console.log(err);

    }

  }

  useEffect(() => {

    fetchTrendingKeywords();

    const interval = setInterval(() => {

      fetchTrendingKeywords();

    }, 60000);

    return () => clearInterval(interval);

  }, []);

  return trendingKeywords;

}