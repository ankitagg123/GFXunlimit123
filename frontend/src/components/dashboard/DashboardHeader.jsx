import ContributorRankCard from "./ContributorRankCard";
import Achievements from "./Achievements";
import GoalsCard from "./GoalsCard";
import StatisticsCards from "./StatisticsCards";

function DashboardHeader({
  username,
  dashboardStats,
  contributorRank,
  contributorLevel,
  contributorXP,
  currentLevelXP,
  nextLevelXP,
  reputationScore,
  reputationTier,
  rawScore,
  monthsOld,
  maxUploads,
  nextRank,
  contributorBadge,
  earningsStats,
  averageLikes,
  totalImages,
  totalLikes,
  totalViews,
  totalDownloads,
  darkMode,
}) {
  return (
    <>
      <ContributorRankCard
        username={username}
        dashboardStats={dashboardStats}
        contributorRank={contributorRank}
        contributorLevel={contributorLevel}
        contributorXP={contributorXP}
        currentLevelXP={currentLevelXP}
        nextLevelXP={nextLevelXP}
        reputationScore={reputationScore}
        reputationTier={reputationTier}
        rawScore={rawScore}
        monthsOld={monthsOld}
        maxUploads={maxUploads}
        nextRank={nextRank}
        contributorBadge={contributorBadge}
        earningsStats={earningsStats}
      />

      <Achievements dashboardStats={dashboardStats} />

      <GoalsCard
        dashboardStats={dashboardStats}
        darkMode={darkMode}
      />

      <StatisticsCards
        dashboardStats={dashboardStats}
        earningsStats={earningsStats}
        contributorBadge={contributorBadge}
        averageLikes={averageLikes}
        totalImages={totalImages}
        totalLikes={totalLikes}
        totalViews={totalViews}
        totalDownloads={totalDownloads}
      />
    </>
  );
}

export default DashboardHeader;