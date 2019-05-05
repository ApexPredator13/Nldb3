"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var uri_creator_1 = require("./lib/uri-creator");
var dom_operations_1 = require("./lib/dom-operations");
var createDefaultVideoRequest = function () {
    return {
        Asc: false,
        OrderBy: 2,
        Search: null,
        Page: 1,
        Amount: 50,
        From: null,
        Until: null
    };
};
var request = createDefaultVideoRequest();
var initializeTableHeaderClickEvents = function () {
    var tableHeader = document.getElementById('video-table-head');
    if (!tableHeader) {
        return;
    }
    var tableHeaderFields = tableHeader.getElementsByTagName('th');
    if (!tableHeaderFields || tableHeaderFields.length === 0) {
        return;
    }
    var _loop_1 = function (i) {
        if (tableHeaderFields[i].hasAttribute("data-sort-by")) {
            tableHeaderFields[i].addEventListener('click', function () {
                var sortAttributeValue = tableHeaderFields[i].getAttribute("data-sort-by");
                if (!sortAttributeValue) {
                    return;
                }
                var sortAttributeEnumValue = parseInt(sortAttributeValue, 10);
                if (request.OrderBy === sortAttributeEnumValue) {
                    request.Asc = !request.Asc;
                }
                else {
                    request.OrderBy = sortAttributeEnumValue;
                    request.Page = 1;
                    request.Asc = false;
                }
                loadVideos();
            });
        }
    };
    for (var i = 0; i < tableHeaderFields.length; i++) {
        _loop_1(i);
    }
};
var applyPageClickEvents = function () {
    var paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) {
        return;
    }
    var links = paginationContainer.getElementsByTagName('a');
    if (!links || links.length === 0) {
        return;
    }
    var _loop_2 = function (i) {
        links[i].addEventListener('click', function (e) {
            e.preventDefault();
            var pageText = links[i].innerText;
            request.Page = parseInt(pageText, 10);
            loadVideos();
        });
    };
    for (var i = 0; i < links.length; i++) {
        _loop_2(i);
    }
};
var loadVideos = function () {
    var table = document.getElementById('video-table');
    if (!table) {
        return;
    }
    var oldTBody = table.lastElementChild;
    if (!oldTBody || oldTBody.tagName !== 'TBODY') {
        return;
    }
    fetch(uri_creator_1.CreateGetVideosUri(request)).then(function (x) { return x.json(); }).then(function (x) {
        var newTBody = document.createElement('tbody');
        x.videos.map(function (v) {
            var tr = document.createElement('tr');
            var button = document.createElement('button');
            button.innerText = 'Submit';
            dom_operations_1.fillTableCells(tr, v.title, v.duration, v.published, button, v.likes, v.dislikes, v.ratio, v.view_count, v.favorite_count, v.comment_count, v.is_hd ? 'true' : 'false');
            newTBody.appendChild(tr);
        });
        table.removeChild(oldTBody);
        table.appendChild(newTBody);
    });
};
(function () {
    initializeTableHeaderClickEvents();
    applyPageClickEvents();
})();
