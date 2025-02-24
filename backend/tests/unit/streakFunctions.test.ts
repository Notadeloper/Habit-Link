import { adjustToUserDay, getPeriodKey, isConsecutive } from "../../src/controllers/habitController";

describe("adjustToUserDay", () => {
    it("should return the same day with day start if input is after the day start", () => {
        const dayStart = "05:00";
        const input = new Date("2025-02-06T06:00:00Z"); // 6 am, should be same day
        const adjusted = adjustToUserDay(input, dayStart);
        expect(adjusted.toISOString()).toEqual("2025-02-06T05:00:00.000Z");
    });

    it("should return the previous day with day start if input is before the day start", () => {
        const dayStart = "05:00";
        const input = new Date("2025-02-06T04:59:00Z"); // 4:59 am, should be day before
        const adjusted = adjustToUserDay(input, dayStart);
        expect(adjusted.toISOString()).toEqual("2025-02-05T05:00:00.000Z");
    });

    it("should return the current day if it is on day start", () => {
        const dayStart = "05:00";
        const input = new Date("2025-02-06T05:00:00Z"); // 5 am, should be same day
        const adjusted = adjustToUserDay(input, dayStart);
        expect(adjusted.toISOString()).toEqual("2025-02-06T05:00:00.000Z");
    });
});


describe("getPeriodKey", () => {
    it("should return a day period key adjusted by dayStart", () => {
        const dayStart = "05:00";
        const date = new Date("2025-02-06T03:00:00Z");
        const periodKey = getPeriodKey(date, "day", dayStart);
        expect(periodKey).toEqual("2025-02-05");
    });

    it("should return a week period key adjusted by dayStart normal case", () => {
        const dayStart = "05:00";
        const date = new Date("2025-02-01T03:00:00Z");
        const periodKey = getPeriodKey(date, "week", dayStart);
        expect(periodKey).toEqual("2025-01-27");
    });

    it("should return a week period key adjusted by dayStart edge case should be prev week monday", () => {
        const dayStart = "05:00";
        const date = new Date("2025-02-03T03:00:00Z");
        const periodKey = getPeriodKey(date, "week", dayStart);
        expect(periodKey).toEqual("2025-01-27");
    });
  
    it("should return a month period key", () => {
        const dayStart = "00:00";
        const date = new Date("2025-02-15T12:00:00Z");
        const periodKey = getPeriodKey(date, "month", dayStart);
        expect(periodKey).toEqual("2025-02");
    });

    it("should return a month period key", () => {
        const dayStart = "05:00";
        const date = new Date("2025-01-31T04:00:00Z");
        const periodKey = getPeriodKey(date, "month", dayStart);
        expect(periodKey).toEqual("2025-01");
    });
});
  
describe("isConsecutive", () => {
    it("should return true for consecutive day keys", () => {
        expect(isConsecutive("2025-02-06", "2025-02-05", "day")).toBe(true);
    });
  
    it("should return false for non-consecutive day keys", () => {
        expect(isConsecutive("2025-02-06", "2025-02-04", "day")).toBe(false);
    });
});