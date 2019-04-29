"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dom_operations_1 = require("./lib/dom-operations");
var enum_converters_1 = require("./lib/enum-converters");
(function () {
    document.addEventListener("DOMContentLoaded", function () {
        var selector = document.getElementById('resource-selector');
        var displayer = document.getElementById('resource-displayer');
        if (!selector || !displayer) {
            return;
        }
        selector.addEventListener("change", function () {
            var newValue = selector.value;
            if (!newValue) {
                return;
            }
            // create new table body
            var tableBody = document.createElement('tbody');
            fetch("/api/resources?ResourceType=" + newValue + "&IncludeMod=true&IncludeTags=true&OrderBy1=1&Asc=true").then(function (response) { return response.json(); }).then(function (response) {
                response.map(function (r) {
                    // fill it with table rows
                    var tr = document.createElement('tr');
                    // create admin edit link if admin flag is set
                    var adminLink = undefined;
                    if (admin_mode) {
                        adminLink = document.createElement('a');
                        adminLink.innerText = 'Edit';
                        adminLink.href = "/Admin/Isaac/Details/" + r.id;
                    }
                    dom_operations_1.fillTableCells(tr, r.name, r.id, enum_converters_1.convertGameModeToString(r.game_mode), enum_converters_1.convertExistsInToString(r.exists_in), "x: " + r.x + ", y: " + r.y + ", w: " + r.w + ", h: " + r.h, r.color, r.mod ? r.mod.name : null, r.display_order ? r.display_order : null, r.difficulty ? r.difficulty : null, adminLink);
                    tableBody.appendChild(tr);
                    if (r.id === 'TwoSpooky') {
                        console.log(r);
                    }
                });
            }).then(function () {
                // clear old table and append new
                if (displayer.lastElementChild && displayer.lastElementChild.tagName === 'TBODY') {
                    displayer.removeChild(displayer.lastElementChild);
                }
                displayer.appendChild(tableBody);
            }).catch(function (e) { return console.error(e); });
        });
    });
})();
