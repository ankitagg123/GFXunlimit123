import Header from "../components/home/Header/Header";
import FeaturedCollections from "../components/home/FeaturedCollections/FeaturedCollections";
import FeaturedAssets from "../components/home/FeaturedAssets/FeaturedAssets";
import TrendingAssets from "../components/home/TrendingAssets/TrendingAssets";
import BrowseCategories from "../components/home/BrowseCategories/BrowseCategories";
// TopContributors removed per design request

function HomePage(props) {
  return (
    <>
      <Header {...props} />

      <FeaturedCollections />
      <BrowseCategories {...props} />

      <FeaturedAssets {...props} />

      <TrendingAssets {...props} />
    </>
  );
}

export default HomePage;