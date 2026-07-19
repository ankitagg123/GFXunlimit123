import { useEffect, useState } from "react";
import axios from "axios";

export default function useHeroStats() {

  const [heroStats, setHeroStats] =
    useState({

      totalAssets:0,

      totalSearches:0,

      totalDownloads:0,

      todayVisitors:0,

    });

  useEffect(() => {

    fetchHeroStats();

  }, []);

  async function fetchHeroStats(){

    try{

      const res =
      await axios.get(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/hero-stats`
      );

      setHeroStats(
        res.data
      );

    }

    catch(err){

      console.log(err);

    }

  }

  return heroStats;

}