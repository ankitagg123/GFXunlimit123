import DashboardContainer from "./DashboardContainer";

import AnalyticsDashboard from "../components/dashboard/AnalyticsDashboard";
import AdminDashboard from "../components/dashboard/AdminDashboard";
import ContributorDashboard from "../components/dashboard/ContributorDashboard";
import CustomerDashboard from "../components/dashboard/CustomerDashboard";

import { useEffect } from "react";

export default function DashboardPage(props) {

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "earnings") {
        const el = document.getElementById("earnings");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    } catch (err) {
      // ignore
    }
  }, []);

  return (
    <>
      <DashboardContainer
        dashboardProps={props.dashboardProps}
      />

      {props.userRole === "admin" && (
        <AdminDashboard />
      )}

      {props.userRole === "contributor" && (
        <ContributorDashboard />
      )}

      {(props.userRole === "customer" ||
        props.userRole === "buyer") && (
        <CustomerDashboard />
      )}

      {!props.userRole && (
        <AnalyticsDashboard
          darkMode={props.darkMode}
        />
      )}
    </>
  );
}