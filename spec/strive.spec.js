'use strict';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const strive = require('../src/index');

const sleep = (ms) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), ms);
    });
};

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

        it("returns the first success when race is true", async () => {

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
                action: (param) => sleep(1000).then(() => getValue(param)),
                check: isTrue,
                race: true,
            });

            expect(result).toBe(true);
            expect(lastAttempt).toBe(2);
            expect(success).toBe(true);

        });

        it("returns undefined or defaultValue when race is true and all fail", async () => {

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
                action: (param) => sleep(1000).then(() => getValue(param)),
                check: isTrue,
                race: true,
            });

            expect(result).toBe(undefined);
            expect(lastAttempt).toBe(3);
            expect(success).toBe(false);

            const { result: otherResult } = await strive({
                values,
                action: (param) => sleep(1000).then(() => getValue(param)),
                check: isTrue,
                race: true,
                defaultValue: 99,
            });
            expect(otherResult).toBe(99);
        });

        it("ignores errors except the last when race is true", async () => {

            const test = () => strive({
                values,
                action: (param) => {
                    return sleep(1000).then(() => {
                        throw 100;
                    })
                },
                check: isTrue,
                race: true,
                ignoreErrors: false,
            });

            await expectAsync(test()).toBeRejectedWith(100);
        });
    });

    describe("using mutations", () => {
        const isTrue = (value) => !!value;

        const mutations = [
            function useParam1() {
                return ["param1"];
            },

            async function useParam2() {
                return ["param2"];
            },

            function useParam3() {
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

        it("returns the first success when race is true", async () => {

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
                action: (param) => sleep(1000).then(() => getValue(param)),
                check: isTrue,
                race: true,
            });

            expect(result).toBe(true);
            expect(lastAttempt).toBe("useParam3");
            expect(success).toBe(true);

        });

        it("returns undefined or defaultValue when race is true and all fail", async () => {

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
                action: (param) => sleep(1000).then(() => getValue(param)),
                check: isTrue,
                race: true,
            });

            expect(result).toBe(undefined);
            expect(lastAttempt).toBe("useParam4");
            expect(success).toBe(false);

            const { result: otherResult } = await strive({
                mutations,
                action: (param) => sleep(1000).then(() => getValue(param)),
                check: isTrue,
                race: true,
                defaultValue: 99,
            });
            expect(otherResult).toBe(99);
        });

        it("ignores errors except the last when race is true", async () => {

            const test = () => strive({
                mutations,
                action: (param) => {
                    return sleep(1000).then(() => {
                        throw 200;
                    })
                },
                check: isTrue,
                race: true,
                ignoreErrors: false,
            });

            await expectAsync(test()).toBeRejectedWith(200);
        });

    });

    describe("using strategies", () => {
        const strategies = [
            async function returns1() {
                return 1;
            },

            function returns2() {
                return 2;
            },

            function returns3() {
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

        it("returns the first success when race is true", async () => {
            const strategies = [
                function returns3InOneSecond() {
                    return sleep(1000).then(() => 3);
                },
                function returns3InTwoSeconds() {
                    return sleep(2000).then(() => 3);
                },
                function returns3InFiveSeconds() {
                    return sleep(5000).then(() => 3);
                },

            ];

            const { result, lastAttempt, success } = await strive({
                strategies,
                race: true,
                check: (v) => v === 3,
            });

            expect(result).toBe(3);
            expect(lastAttempt).toBe("returns3InOneSecond");
            expect(success).toBe(true);

        });

        it("returns undefined or defaultValue when race is true and all fail", async () => {

            const strategies = [
                function throwsInOneSecond() {
                    return sleep(1000).then(() => { throw 3 });
                },
                function throwsInTwoSeconds() {
                    return sleep(2000).then(() => { throw 3 });
                },
                function throwsInFiveSeconds() {
                    return sleep(5000).then(() => { throw 3 });
                },

            ];

            const { result, lastAttempt, success } = await strive({
                strategies,
                race: true,
                check: (v) => v === 3,
            });

            expect(result).toBe(undefined);
            expect(lastAttempt).toBe("throwsInFiveSeconds");
            expect(success).toBe(false);

            const { result: otherResult } = await strive({
                strategies,
                defaultValue: 99,
                race: true,
                check: (v) => v === 3,
            });
            expect(otherResult).toBe(99);
        });

        it("ignores errors except the last when race is true", async () => {

            const strategies = [
                function throwsInOneSecond() {
                    return sleep(1000).then(() => { throw 3 });
                },
                function throwsInTwoSeconds() {
                    return sleep(2000).then(() => { throw 3 });
                },
                function throwsInFiveSeconds() {
                    return sleep(5000).then(() => { throw 3 });
                },

            ];

            const test = () => strive({
                    strategies,
                    race: true,
                    ignoreErrors: false,
                    check: (v) => v === 3,
                });

            await expectAsync(test()).toBeRejectedWith(3);
        });
    });
});