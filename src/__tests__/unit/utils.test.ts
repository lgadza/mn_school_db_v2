/**
 * Basic utils tests
 */
import DateTimeUtil from "@/common/utils/date/dateTimeUtil";

describe("Utilities", () => {
  describe("DateTimeUtil", () => {
    it("should format dates correctly", () => {
      const date = new Date("2023-01-01T12:00:00Z");
      const formatted = DateTimeUtil.formatDate(date);
      expect(formatted).toContain("2023-01-01");
    });

    it("should validate dates correctly", () => {
      expect(DateTimeUtil.isValidDate(new Date())).toBe(true);
      expect(DateTimeUtil.isValidDate("invalid-date")).toBe(false);
      expect(DateTimeUtil.isValidDate(null)).toBe(false);
    });
  });
});
