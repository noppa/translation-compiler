"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var constants = require("constants");
/* eslint-disable no-restricted-syntax, no-prototype-builtins, no-continue */
/* eslint-disable no-bitwise, no-underscore-dangle */
var VirtualStatsConfig = /** @class */ (function () {
    function VirtualStatsConfig() {
    }
    return VirtualStatsConfig;
}());
/**
 * Used to cache a stats object for the virtual file.
 *
 * Originally extracted from the `mock-fs` package,
 * later modified to conform to the code style of this repository
 * and to use TypeScript instead of JavScript.
 *
 * @author Tim Schaub http://tschaub.net/
 * @license https://github.com/tschaub/mock-fs/blob/0bbd60a247ddd6426d449ccd5b940670f6072fc1/license.md
 * @link https://github.com/tschaub/mock-fs/blob/0bbd60a247ddd6426d449ccd5b940670f6072fc1/lib/binding.js
 */
var VirtualStats = /** @class */ (function (_super) {
    __extends(VirtualStats, _super);
    function VirtualStats(config) {
        var _this = _super.call(this) || this;
        Object.assign(_this, config);
        return _this;
    }
    /**
     * Check if mode indicates property.
     * @param property Property to check.
     * @return Property matches mode.
     */
    VirtualStats.prototype.checkModeProperty = function (property) {
        return (this.mode & constants.S_IFMT) === property;
    };
    VirtualStats.prototype.isDirectory = function () {
        return this.checkModeProperty(constants.S_IFDIR);
    };
    VirtualStats.prototype.isFile = function () {
        return this.checkModeProperty(constants.S_IFREG);
    };
    VirtualStats.prototype.isBlockDevice = function () {
        return this.checkModeProperty(constants.S_IFBLK);
    };
    VirtualStats.prototype.isCharacterDevice = function () {
        return this.checkModeProperty(constants.S_IFCHR);
    };
    VirtualStats.prototype.isSymbolicLink = function () {
        return this.checkModeProperty(constants.S_IFLNK);
    };
    /**
     * @return Is a named pipe.
     */
    VirtualStats.prototype.isFIFO = function () {
        return this.checkModeProperty(constants.S_IFIFO);
    };
    VirtualStats.prototype.isSocket = function () {
        return this.checkModeProperty(constants.S_IFSOCK);
    };
    return VirtualStats;
}(VirtualStatsConfig));
exports["default"] = VirtualStats;
