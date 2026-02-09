"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withRetry = withRetry;
function withRetry(fn_1) {
    return __awaiter(this, arguments, void 0, function* (fn, retries = 3) {
        var _a;
        try {
            return yield fn();
        }
        catch (err) {
            if (retries > 0 &&
                ((_a = err === null || err === void 0 ? void 0 : err.original) === null || _a === void 0 ? void 0 : _a.code) === "ER_LOCK_DEADLOCK") {
                console.log("Deadlock detected. Retrying...");
                return withRetry(fn, retries - 1);
            }
            throw err;
        }
    });
}
