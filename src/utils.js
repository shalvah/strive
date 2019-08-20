"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const returnSuccess = (lastAttempt, result) => {
    return {
        result,
        lastAttempt,
        success: true,
    };
};
exports.returnSuccess = returnSuccess;
const returnFailure = (lastAttempt, result, defaultValue) => {
    return {
        result: defaultValue === undefined ? result : defaultValue,
        lastAttempt,
        success: false,
    };
};
exports.returnFailure = returnFailure;
