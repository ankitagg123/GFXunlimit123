import {
  getContributorRank,
  getContributorXP,
  getContributorLevel,
  getCurrentLevelXP,
  getAverageDownloads,
  getLikeRate,
  getViewDownloadRate,
} from "../utils/statsUtils";

export default function useContributorStats(dashboardStats) {

  const {
    contributorRank,
    nextRank,
    maxUploads,
  } = getContributorRank(
    dashboardStats.uploads
  );

  const contributorXP =
    getContributorXP(dashboardStats);

  const contributorLevel =
    getContributorLevel(contributorXP);

  const currentLevelXP =
    getCurrentLevelXP(contributorXP);

  const avgDownloadsPerImage =
    getAverageDownloads(dashboardStats);

  const likeRate =
    getLikeRate(dashboardStats);

  const viewDownloadRate =
    getViewDownloadRate(dashboardStats);

  const reputationScore =
    dashboardStats.reputationScore || 0;

  const rawScore =
    dashboardStats.rawScore || 0;

  const monthsOld =
    dashboardStats.monthsOld || 1;

  let reputationTier =
    "🟢 New Contributor";

  if (reputationScore >= 100)
    reputationTier =
      "🔵 Trusted Contributor";

  if (reputationScore >= 500)
    reputationTier =
      "🟣 Verified Contributor";

  if (reputationScore >= 1000)
    reputationTier =
      "🟠 Premium Contributor";

  if (reputationScore >= 5000)
    reputationTier =
      "🔴 Elite Contributor";

  return {
    contributorRank,
    nextRank,
    maxUploads,
    contributorXP,
    contributorLevel,
    currentLevelXP,
    avgDownloadsPerImage,
    likeRate,
    viewDownloadRate,
    reputationScore,
    reputationTier,
    rawScore,
    monthsOld,
  };

}