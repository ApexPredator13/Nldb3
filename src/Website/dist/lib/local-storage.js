"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SaveToLocalStorage = function (data, key) {
    var stringifiedData = JSON.stringify(data);
    localStorage.setItem(key, stringifiedData);
};
exports.SaveToLocalStorage = SaveToLocalStorage;
var GetFromLocalStorage = function (key) {
    var data = localStorage.getItem(key);
    if (data) {
        return JSON.parse(data);
    }
    return null;
};
exports.GetFromLocalStorage = GetFromLocalStorage;
var KeyExists = function (key) {
    var result = localStorage.getItem(key);
    return result ? true : false;
};
exports.KeyExists = KeyExists;
