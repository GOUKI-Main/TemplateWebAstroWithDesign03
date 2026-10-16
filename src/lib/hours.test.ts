import { describe, expect, it } from "vitest";
import { formatOpeningHours } from "./hours";

// The access section prints hours through this function while the JSON-LD
// prints the raw strings. A wrong conversion would look perfectly normal on
// the page and contradict what search engines are told.
describe("formatOpeningHours", () => {
  it("converts a day range and drops the leading zero", () => {
    expect(formatOpeningHours(["Mo-Fr 09:00-18:00"])).toEqual([
      "月〜金 9:00〜18:00",
    ]);
  });

  it("converts comma lists", () => {
    expect(formatOpeningHours(["Mo,We,Fr 10:00-19:00"])).toEqual([
      "月・水・金 10:00〜19:00",
    ]);
  });

  it("merges entries with the same hours, keeping first-seen order", () => {
    expect(
      formatOpeningHours([
        "Mo 10:00-20:00",
        "Sa 10:00-17:00",
        "We-Su 10:00-20:00",
      ]),
    ).toEqual(["月・水〜日 10:00〜20:00", "土 10:00〜17:00"]);
  });

  it("passes unreadable entries through instead of dropping them", () => {
    expect(formatOpeningHours(["Xx 10:00-20:00", "24時間営業"])).toEqual([
      "Xx 10:00-20:00",
      "24時間営業",
    ]);
  });
});
