function ContributorRankCard({
  username,
  contributorRank,
  contributorLevel,
  reputationScore,
  reputationTier,
  rawScore,
  monthsOld,
  contributorXP,
  currentLevelXP,
  nextLevelXP,
  dashboardStats,
  maxUploads,
  nextRank,
  contributorBadge,
  earningsStats,
}) {
  return (
    <div
      style={{
        background:
          "linear-gradient(135deg,#2196f3,#673ab7)",
        color: "white",
        padding: "25px",
        borderRadius: "20px",
        marginBottom: "25px",
        boxShadow:
          "0 6px 18px rgba(0,0,0,0.2)",
      }}
    >
      <h2>👋 Welcome Back, {username}</h2>

      <div
        style={{
          display: "inline-block",
          padding: "10px 20px",
          borderRadius: "30px",
          fontWeight: "bold",
          fontSize: "18px",
          marginBottom: "15px",
          background:
            contributorRank === "👑 Platinum"
              ? "#e5e4e2"
              : contributorRank === "🥇 Gold"
              ? "#ffd700"
              : contributorRank === "🥈 Silver "
              ? "#c0c0c0"
              : "#92918f",
          color: "black",
        }}
      >
        🏅 {contributorRank} Contributor

        <p
          style={{
            fontWeight: "bold",
            marginTop: "10px",
            fontSize: "18px",
          }}
        >
          ⭐ Level {contributorLevel}
        </p>

        <div
          style={{
            background: "#2196f3",
            color: "white",
            padding: "12px",
            borderRadius: "12px",
            marginTop: "10px",
          }}
        >
          📈 Reputation Score: {reputationScore}

          <p>Raw Score: {rawScore}</p>

          <p>{reputationTier}</p>

          <p>Account Age: {monthsOld} month(s)</p>
        </div>

        <p>XP: {contributorXP}</p>

        <div
          style={{
            width: "100%",
            height: "15px",
            background: "#ddd",
            borderRadius: "20px",
            overflow: "hidden",
            marginTop: "10px",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              width: `${currentLevelXP}%`,
              height: "100%",
              background: "#ff9800",
            }}
          />
        </div>

        <p>
          XP Progress {currentLevelXP}/{nextLevelXP}
        </p>
      </div>

      <p>Uploads: {dashboardStats.uploads}</p>

      <div
        style={{
          width: "100%",
          height: "20px",
          background: "#ddd",
          borderRadius: "20px",
          overflow: "hidden",
          marginTop: "10px",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            width: `${Math.min(
              (dashboardStats.uploads / maxUploads) * 100,
              100
            )}%`,
            height: "100%",
            background: "#4caf50",
          }}
        />
      </div>

      <p>
        Progress to {nextRank}
        <br />
        {dashboardStats.uploads}/{maxUploads} Uploads
      </p>

      <h3>
        🏅 Current Badge: {contributorBadge}
      </h3>

      <p id="earnings">
        💰 Earnings: ${earningsStats.total_earnings || 0}
      </p>

      <p>
        ⬇ Downloads: {earningsStats.total_downloads || 0}
      </p>

      <p>
        📸 Uploads: {dashboardStats.uploads || 0}
      </p>
    </div>
  );
}

export default ContributorRankCard;