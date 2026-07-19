function StatisticsCards({
  dashboardStats,
  earningsStats,
  contributorBadge,
  averageLikes,
  totalImages,
  totalLikes,
  totalViews,
  totalDownloads,
}) {
  const cards = [
    {
      title: "📸 Uploads",
      value: dashboardStats.uploads || 0,
      color: "#2196f3",
    },
    {
      title: "❤️ Likes",
      value: dashboardStats.likes || 0,
      color: "#e91e63",
    },
    {
      title: "👁 Views",
      value: dashboardStats.views || 0,
      color: "#ff9800",
    },
    {
      title: "⬇ Downloads",
      value: dashboardStats.downloads || 0,
      color: "#4caf50",
    },
    {
      title: "💰 Earnings",
      value: `$${earningsStats.total_earnings || 0}`,
      color: "#673ab7",
    },
    {
      title: "🏅 Badge",
      value: contributorBadge,
      color: "#009688",
    },
    {
      title: "⭐ Avg Likes / Image",
      value: averageLikes,
      color: "#3f51b5",
    },
    {
      title: "🌍 Site Images",
      value: totalImages,
      color: "#795548",
    },
    {
      title: "❤️ Site Likes",
      value: totalLikes,
      color: "#c2185b",
    },
    {
      title: "👁 Site Views",
      value: totalViews,
      color: "#ff5722",
    },
    {
      title: "⬇ Site Downloads",
      value: totalDownloads,
      color: "#607d8b",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(220px,1fr))",
        gap: "20px",
        marginBottom: "25px",
      }}
    >
      {cards.map((card, index) => (
        <div
          key={index}
          style={{
            background: card.color,
            color: "white",
            borderRadius: "15px",
            padding: "20px",
            textAlign: "center",
            boxShadow: "0 5px 15px rgba(0,0,0,.15)",
          }}
        >
          <h3>{card.title}</h3>

          <h2>{card.value}</h2>
        </div>
      ))}
    </div>
  );
}

export default StatisticsCards;