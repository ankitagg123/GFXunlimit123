export const getContributorRank = (uploads) => {

  let contributorRank = "🥉 Bronze";
  let nextRank = "🥈 Silver";
  let maxUploads = 500;

  if (uploads >= 500) {
    contributorRank = "🥈 Silver";
    nextRank = "🥇 Gold";
    maxUploads = 1500;
  }

  if (uploads >= 1500) {
    contributorRank = "🥇 Gold";
    nextRank = "👑 Platinum";
    maxUploads = 5000;
  }

  if (uploads >= 5000) {
    contributorRank = "👑 Platinum";
    nextRank = "🏆 Max Rank";
    maxUploads = 25000;
  }

  return {
    contributorRank,
    nextRank,
    maxUploads,
  };

};

export const getContributorXP = (stats) => {

  return (
    stats.uploads +
    stats.likes +
    stats.downloads
  );

};

export const getContributorLevel = (xp) => {

  return Math.floor(xp / 50) + 1;

};

export const getCurrentLevelXP = (xp) => {

  return xp % 100;

};

export const getAverageDownloads = (stats) => {

  if (stats.uploads === 0)
    return 0;

  return (
    stats.downloads /
    stats.uploads
  ).toFixed(2);

};

export const getLikeRate = (stats) => {

  if (stats.views === 0)
    return 0;

  return (
    (
      stats.likes /
      stats.views
    ) * 100
  ).toFixed(1);

};

export const getViewDownloadRate = (stats) => {

  if (stats.views === 0)
    return 0;

  return (
    (
      stats.downloads /
      stats.views
    ) * 100
  ).toFixed(1);

};