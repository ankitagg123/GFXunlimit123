import { matchesCategoryFilter } from "./useFilteredImages";

describe("matchesCategoryFilter", () => {
  it("keeps a saved Photos category in the photos bucket", () => {
    expect(
      matchesCategoryFilter(
        { category: "Photos", collection: "", title: "", keywords: "" },
        "photos"
      )
    ).toBe(true);
  });

  it("does not treat vectors as photos", () => {
    expect(
      matchesCategoryFilter(
        { category: "Vector/illustrations", collection: "", title: "", keywords: "" },
        "photos"
      )
    ).toBe(false);
  });
});
