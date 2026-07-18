/// <reference types="jest" />
import { validators } from "../utils/validators.js";

describe("validators", () => {
    describe("lengthUnit", () => {
        it("accepts px values", () => expect(validators.lengthUnit("10px")).toBe(true));
        it("accepts rem values", () => expect(validators.lengthUnit("1.5rem")).toBe(true));
        it("accepts % values", () => expect(validators.lengthUnit("50%")).toBe(true));
        it("accepts calc()", () => expect(validators.lengthUnit("calc(100% - 20px)")).toBe(true));
        it("rejects plain words", () => expect(validators.lengthUnit("red")).toBe(false));
    });

    describe("color", () => {
        it("accepts hex", () => expect(validators.color("#fff")).toBe(true));
        it("accepts 6-digit hex", () => expect(validators.color("#1a2b3c")).toBe(true));
        it("accepts rgb()", () => expect(validators.color("rgb(0, 128, 255)")).toBe(true));
        it("accepts named", () => expect(validators.color("red")).toBe(true));
        it("rejects invalid", () => expect(validators.color("10px")).toBe(false));
    });

    describe("border", () => {
        it("accepts width", () => expect(validators.border("1px")).toBe(true));
        it("accepts style", () => expect(validators.border("solid")).toBe(true));
        it("accepts combined", () => expect(validators.border("1px_solid_#000")).toBe(true));
    });
});
