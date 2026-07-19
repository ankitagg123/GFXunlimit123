import MarketplaceContainer from "../components/MarketplaceContainer";

export default function ExplorePage(props) {
  return (
    <div
      style={{
        paddingTop: 30,
      }}
    >
      <MarketplaceContainer {...props} />
    </div>
  );
}