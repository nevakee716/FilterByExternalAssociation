/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */

/*global jQuery */
(function (cwApi, $) {

    "use strict";
    // constructor
    var urlToLoadAsync = function (url,callback) {
        this.url = url;
        this.status = "notLoaded";
        this.callbacks = [callback];
    };

    urlToLoadAsync.prototype.addCallback = function (callback) {
        this.callbacks.push(callback);
    };

    urlToLoadAsync.prototype.getStatus = function () {
        return this.status;
    };

    urlToLoadAsync.prototype.load = function () {
        this.status = "inLoad";
        var that = this;
        $.ajax({
            url: that.url,
            dataType: 'script',
            cache: true, // otherwise will get fresh copy every page load
            success: function() {
                that.status = "loaded";
                that.callbacks.forEach(function(callback) {
                    callback(null);
                });
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) { 
                that.status = "failed";
                that.callbacks.forEach(function(callback) {
                    callback(errorThrown);
                });
            }  
        });
    };




    if(!cwApi.customLibs) {
        cwApi.customLibs = {};
    }
    if(!cwApi.customLibs.urlToLoadAsync){
        cwApi.customLibs.urlToLoadAsync = urlToLoadAsync;
    };


}(cwAPI, jQuery));