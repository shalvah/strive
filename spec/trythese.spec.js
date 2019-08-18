'use strict';

const tryThese = require('../index');

describe("tryThese", () => {

    describe("using mutations", () => {
        const isTrue = (value) => !!value;

        const mutations = [
            async function useParam1() {
                return ["param1"];
            },

            async function useParam2() {
                return ["param2"];
            },

            async function useParam3() {
                return ["param3"];
            },

            async function useParam4() {
                return ["param4"];
            },

        ];

        it("stops at the first success", async () => {
            const getValue = (param) => {
                const object = {
                    param1: false,
                    param2: false,
                    param3: true,
                    param4: false,
                };
                return object[param];
            };

            const { result, finalStrategy, } = await tryThese({
                mutations,
                action: (param) => {
                    return getValue(param);
                },
                checker: isTrue
            });

            expect(result).toBe(true);
            expect(finalStrategy).toBe("useParam3");

        });

        it("returns final result if no successes", async () => {
            const getValue = (param) => {
                const object = {
                    param1: false,
                    param2: false,
                    param3: false,
                    param4: false,
                };
                return object[param];
            };

            const { result, finalStrategy, } = await tryThese({
                mutations,
                action: (param) => {
                    return getValue(param);
                },
                checker: isTrue,
            });

            expect(result).toBe(false);
            expect(finalStrategy).toBe("useParam4");

        });
    });

    describe("using strategies", () => {
        const strategies = [
            async function returns1() {
                return 1;
            },

            async function returns2() {
                return 2;
            },

            async function returns3() {
                return 3;
            },

            async function returns4() {
                return 4;
            },

        ];

        it("stops at the first success", async () => {
            const { result, finalStrategy, } = await tryThese({
                strategies,
                checker: (v) => v === 3,
            });

            expect(result).toBe(3);
            expect(finalStrategy).toBe("returns3");

        });

        it("returns final result if no successes", async () => {
            const { result, finalStrategy, } = await tryThese({
                strategies,
                checker: (v) => v === 0,
            });

            expect(result).toBe(4);
            expect(finalStrategy).toBe("returns4");

        });
    });
});