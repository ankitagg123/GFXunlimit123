import HomePageContainer from "../pages/HomePageContainer";

export default function HomeSection({
  homePageProps,
  galleryProps,
  containerProps,
  popupProps,
}) {
  return (
    <HomePageContainer
      homePageProps={homePageProps}
      galleryProps={galleryProps}
      {...containerProps}
      {...popupProps}
    />
  );
}