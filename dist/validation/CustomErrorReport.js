"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomErrorReporter = void 0;
const vine_1 = require("@vinejs/vine");
class CustomErrorReporter {
    constructor() {
        /**
         * A flag to know if one or more errors have been
         * reported
         */
        this.hasErrors = false;
        /**
         * A collection of  . Feel free to give accurate types
         * to this property
         */
        this.errors = {};
    }
    /**
     * VineJS call the report method
     */
    report(message, rule, field, meta) {
        this.hasErrors = true;
        /**
         * Collecting errors as per the JSONAPI spec
         */
        this.errors[field.wildCardPath] = message;
    }
    /**
     * Creates and returns an instance of the
     * ValidationError class
     */
    createError() {
        return new vine_1.errors.E_VALIDATION_ERROR(this.errors);
    }
}
exports.CustomErrorReporter = CustomErrorReporter;
