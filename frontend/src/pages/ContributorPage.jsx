import DashboardContainer from "./DashboardContainer";
import ContributorDashboard from "../components/dashboard/ContributorDashboard";

export default function ContributorPage(props) {

  return (
    <>
      <DashboardContainer dashboardProps={props.dashboardProps} />

      <ContributorDashboard />
    </>
  );

}
