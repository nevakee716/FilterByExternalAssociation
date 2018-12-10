/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */

/*global jQuery */
(function (cwApi, $) {

    "use strict";
    // constructor
    var nodeFilter = function (policy,node) {
        this.policy = policy;
        this.filterField = {};
        this.label = "";
        this.node = node;

    };

    nodeFilter.prototype.addfield = function (otScriptName,name,id) {
        if(!this.filterField.hasOwnProperty(id)) {
            this.filterField[id] = {};
            this.filterField[id].name = name;
            this.filterField[id].state = false;
        }
        if(!this.label) {
            this.label = otScriptName;
        }
    };

    nodeFilter.prototype.show = function (id) {
        if(this.filterField.hasOwnProperty(id)) {
            this.filterField[id].state = true;
        }
    };

    nodeFilter.prototype.hide = function (id) {
        if(this.filterField.hasOwnProperty(id)) {
            this.filterField[id].state = false;
        }
    };

    nodeFilter.prototype.areAllUnselected = function () {
        var id;
        for (id in this.filterField) {
            if (this.filterField.hasOwnProperty(id)) {
                if(this.filterField[id].state === true) {
                    return false;
                }
            }
        }
        return true;   
    };


    nodeFilter.prototype.getFields = function (state) {
        var result = [];
        var id;
        for (id in this.filterField) {
            if (this.filterField.hasOwnProperty(id) && this.filterField[id].state === state) {
                result.push(id);
            }
        }    
        return result;
    };

    nodeFilter.prototype.isObjectMatching = function (object,policy) {
        var i;
        var state = undefined; // if there are no filter check state stay undefined and return false
        var id;
        var isFieldInObject;
        if(this.areAllUnselected()) return this.policy;
       
        // go throught all filter fields that are true
        for (id in this.filterField) {
            if (this.filterField.hasOwnProperty(id) && this.filterField[id].state === true) {
                
                //init
                if(state === undefined) {
                    state = policy;
                }

                isFieldInObject = false;
                for (i = 0; i < object.length; i += 1) {
                    if(object[i].object_id == id) {
                        isFieldInObject = true;
                    }
                }
                if(isFieldInObject === !policy) {
                    state = !policy;
                }
            }
        }    

        if(state === false || state === undefined) {
            return !this.policy;
        }

        return this.policy;
    };

    nodeFilter.prototype.setAllState = function (value) {
        var id;
        for (id in this.filterField) {
            if (this.filterField.hasOwnProperty(id)) {
               this.filterField[id].state = value;
            }
        }   
    };


    nodeFilter.prototype.getFilterObject = function (classname) {
        var filterObject;
        var object;
        var id;

        filterObject = document.createElement("select");
        filterObject.setAttribute('multiple','');
        filterObject.setAttribute('title',this.label);
        filterObject.setAttribute('data-live-search','true');
        filterObject.setAttribute('data-selected-text-format','count > 2');
        filterObject.setAttribute('data-actions-box','true');
        filterObject.setAttribute('data-size','10');
       // filterObject.setAttribute('data-width','fit');
        
        filterObject.className = classname;
        filterObject.setAttribute('id',this.node);

        for (id in this.filterField) {
            if (this.filterField.hasOwnProperty(id)) {
                object = document.createElement("option");
                object.setAttribute('id',id);
                object.textContent = this.filterField[id].name;
                filterObject.appendChild(object);
            }                                                                                                                                                                                                                                                                                                                                                                                                            
        }
        return filterObject;
    };

    if(!cwApi.customLibs) {
        cwApi.customLibs = {};
    }
    if(!cwApi.customLibs.cwFilterByExternalAssociation){
        cwApi.customLibs.cwFilterByExternalAssociation = {};
    };
    if(!cwApi.customLibs.cwFilterByExternalAssociation.nodeFilter){
        cwApi.customLibs.cwFilterByExternalAssociation.nodeFilter = nodeFilter;
    };


}(cwAPI, jQuery));