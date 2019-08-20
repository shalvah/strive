'use strict';

const strive = require('../src/index');

describe("strive", () => {

    describe("using values", () => {
        const isTrue = (value) => !!value;

        const values = [
            ["param1"],
            ["param2"],
            ["param3"],
            ["param4"],
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

            const { result, lastAttempt, success } = await strive({
                values,
                action: (param) => {
                    return getValue(param);
                },
                check: isTrue
            });

            expect(result).toBe(true);
            expect(lastAttempt).toBe(2);
            expect(success).toBe(true);

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

            const { result, lastAttempt, success } = await strive({
                values,
                action: (param) => {
                    return getValue(param);
                },
                check: isTrue,
            });

            expect(result).toBe(false);
            expect(lastAttempt).toBe(3);
            expect(success).toBe(false);

        });

        it("returns defaultValue if no successes and defaultValue is specified", async () => {
            const getValue = (param) => {
                const object = {
                    param1: false,
                    param2: false,
                    param3: false,
                    param4: false,
                };
                return object[param];
            };

            const defaultValue = 69;

            const { result, lastAttempt, success } = await strive({
                values,
                action: (param) => {
                    return getValue(param);
                },
                check: isTrue,
                defaultValue,
            });

            expect(result).toBe(defaultValue);
            expect(lastAttempt).toBe(3);
            expect(success).toBe(false);

        });
    });

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

            const { result, lastAttempt, success } = await strive({
                mutations,
                action: (param) => {
                    return getValue(param);
                },
                check: isTrue
            });

            expect(result).toBe(true);
            expect(lastAttempt).toBe("useParam3");

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

            const { result, lastAttempt, success } = await strive({
                mutations,
                action: (param) => {
                    return getValue(param);
                },
                check: isTrue,
            });

            expect(result).toBe(false);
            expect(lastAttempt).toBe("useParam4");
            expect(success).toBe(false);

        });

        it("returns defaultValue and empty lastAttempt if no successes and defaultValue is specified", async () => {
            const getValue = (param) => {
                const object = {
                    param1: false,
                    param2: false,
                    param3: false,
                    param4: false,
                };
                return object[param];
            };

            const defaultValue = 69;

            const { result, lastAttempt, success } = await strive({
                mutations,
                action: (param) => {
                    return getValue(param);
                },
                check: isTrue,
                defaultValue,
            });

            expect(result).toBe(defaultValue);
            expect(lastAttempt).toBe("useParam4");
            expect(success).toBe(false);

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
            const { result, lastAttempt, success } = await strive({
                strategies,
                check: (v) => v === 3,
            });

            expect(result).toBe(3);
            expect(lastAttempt).toBe("returns3");
            expect(success).toBe(true);

        });

        it("returns final result if no successes", async () => {
            const { result, lastAttempt, success } = await strive({
                strategies,
                check: (v) => v === 0,
            });

            expect(result).toBe(4);
            expect(lastAttempt).toBe("returns4");
            expect(success).toBe(false);

        });

        it("returns defaultValue and empty lastAttempt if no successes and defaultValue is specified", async () => {
            const defaultValue = 69;

            const { result, lastAttempt, success } = await strive({
                strategies,
                check: (v) => v === 0,
                defaultValue,
            });

            expect(result).toBe(defaultValue);
            expect(lastAttempt).toBe("returns4");
            expect(success).toBe(false);

        });
    });
});