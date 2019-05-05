"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CreateGetVideosUri = function (request) {
    console.log(request);
    var base = '/api/videos/';
    var asc = "?Asc=" + (request.Asc ? 'true' : 'false');
    var orderBy = "&OrderBy=" + request.OrderBy;
    var search = request.Search ? "&Search=" + request.Search : '';
    var page = "&Page=" + request.Page.toString(10);
    var amount = "&Amount=" + request.Amount.toString(10);
    var from = request.From ? "&From=" + request.From : '';
    var until = request.Until ? "&From=" + request.Until : '';
    var completeUri = "" + base + asc + orderBy + search + page + amount + from + until;
    console.log(completeUri);
    return completeUri;
};
exports.CreateGetVideosUri = CreateGetVideosUri;
