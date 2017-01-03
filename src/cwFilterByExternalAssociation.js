/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */
/*global cwAPI, jQuery*/

(function(cwApi, $) {
    'use strict';

    var cwFilterByExternalAssociation = function(options, viewSchema) {
        cwApi.extend(this, cwApi.cwLayouts.CwLayout, options, viewSchema);
        this.NodesID = {};
        this.createObjectNodes(true,this.options.CustomOptions['filter-in']);
        this.replaceLayout = this.options.CustomOptions['replace-layout'];
        this.betweenAssociationTypePolicy = this.options.CustomOptions['multiple-association-type-policy'];
        this.betweenAssociationPolicy = this.options.CustomOptions['multiple-association-policy'];

        cwApi.extend(this, cwApi.cwLayouts[this.replaceLayout], options, viewSchema);
        cwApi.registerLayoutForJSActions(this);
        this.viewSchema = viewSchema; 
    };

    cwFilterByExternalAssociation.prototype.createObjectNodes = function(nodeType,customOptions) {
        var nodes = customOptions.split(";");
        for (var i = 0; i < nodes.length; i += 1) {
            if(nodes[i] !== "") {
                if(nodeType === true) {
                    this.NodesID[nodes[i]] = new cwApi.customLibs.cwFilterByExternalAssociation.nodeFilter(true,nodes[i]); 
                } else if(nodeType === false){
                    this.NodesID[nodes[i]] = new cwApi.customLibs.cwFilterByExternalAssociation.nodeFilter(false,nodes[i]); 
                }
            }
        }
    };


    // obligatoire appeler par le system
    cwFilterByExternalAssociation.prototype.drawAssociations = function (output, associationTitleText, object) {
        this.findFilterFields(object);
        output.push('<div id="cwLayoutFilter"></div>');
        this.noneFilterObject = object;
        this.associationTitleText = associationTitleText;
        if(cwApi.cwLayouts[this.replaceLayout].drawAssociations) {
            cwApi.cwLayouts[this.replaceLayout].drawAssociations.call(this,output, associationTitleText, object);
        } else {
            cwApi.cwLayouts.CwLayout.prototype.drawAssociations.call(this,output, associationTitleText, object);
        }

    };


    cwFilterByExternalAssociation.prototype.drawOneMethod = function (output, child) {
        if(cwApi.cwLayouts[this.replaceLayout].drawOneMethod) {
            cwApi.cwLayouts[this.replaceLayout].drawOneMethod.call(this, output, child);
        } else if(cwApi.cwLayouts[this.replaceLayout].drawOne) {
            cwApi.cwLayouts[this.replaceLayout].drawOne.call(this, output, child);
        }
    };

    cwFilterByExternalAssociation.prototype.findFilterFields = function(child) {
        var nextChild = null;
        for (var associationNode in child.associations) {
            if (child.associations.hasOwnProperty(associationNode)) {
                var nodeToDelete = [];
                for (var i = 0; i < child.associations[associationNode].length; i += 1) {
                    if(this.NodesID.hasOwnProperty(associationNode)) {
                        this.NodesID[associationNode].addfield(child.associations[associationNode][i].objectTypeScriptName,child.associations[associationNode][i].name,child.associations[associationNode][i].object_id);
                    } else {
                        nextChild = child.associations[associationNode][i];
                        this.findFilterFields(nextChild);
                    }
                }
            }
        }
    };



    cwFilterByExternalAssociation.prototype.applyJavaScript = function () {
        var that = this;
        var libToLoad = [];

        if(cwAPI.isDebugMode() === true) {
            that.createFilter();
        } else {
            libToLoad = ['modules/bootstrap/bootstrap.min.js','modules/bootstrap-select/bootstrap-select.min.js'];
            // AsyncLoad
            cwApi.customLibs.aSyncLayoutLoader.loadUrls(libToLoad,function(error){
                if(error === null) {
                    that.createFilter();                
                } else {
                    console.log(error);
                }
            });
        }



    };
      

    cwFilterByExternalAssociation.prototype.createFilter = function () {
            $('.selectcwLayoutPickerFilterByExternalAssociation').remove();
            var container = document.getElementById("zone_" + this.viewSchema.ViewName);
            var node;
            for (node in this.NodesID) {
                if (this.NodesID.hasOwnProperty(node)) {
                    container.firstChild.appendChild(this.NodesID[node].getFilterObject());
                }
            }

            var nodeID;
            var that = this;
            $('.selectcwLayoutPickerFilterByExternalAssociation').selectpicker();
            $('select.selectcwLayoutPickerFilterByExternalAssociation').on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
                nodeID = $(this).context['id'];
                if(clickedIndex !== undefined) {
                    var id = $(this).context[clickedIndex]['id'];
                    if(newValue === false) {
                        that.NodesID[nodeID].hide(id);
                    } else {
                        that.NodesID[nodeID].show(id);
                    }
                } else { // selectALL
                    if($(this).context[0]) {
                        that.NodesID[nodeID].setAllState($(this).context[0].selected);
                    }

                }
                that.FilterObjectAndDraw(container);
            });
    };


    cwFilterByExternalAssociation.prototype.FilterObjectAndDraw = function(container) {

        //on duplique le l objet json afin de toujours avoir une copie de l'original
        var filterObject = $.extend(true, {}, this.noneFilterObject);
        this.FilterObject(filterObject);
        var output = [];
        var associationTitleText = this.associationTitleText;
        
        if(cwApi.cwLayouts[this.replaceLayout].drawAssociations) {
            cwApi.cwLayouts[this.replaceLayout].drawAssociations.call(this,output, associationTitleText, filterObject);
        } else {
            cwApi.cwLayouts.CwLayout.prototype.drawAssociations.call(this,output, associationTitleText, filterObject);
        }
        container.lastChild.innerHTML = output.join('');
    };

    cwFilterByExternalAssociation.prototype.FilterObject = function(child) {
        var nextChild = null;
        var nodeToDelete;
        var i;
        var state;
        var policyBetweenAT = this.betweenAssociationTypePolicy;

        // check if there is one or several association to be filter
        for (var associationNode in child.associations) {
            if (child.associations.hasOwnProperty(associationNode) && this.NodesID.hasOwnProperty(associationNode)) {
                // init the node if it should be filtered
                if(state === undefined) {
                    state = policyBetweenAT; 
                }
                if(this.NodesID[associationNode].isObjectMatching(child.associations[associationNode],this.betweenAssociationPolicy) === !policyBetweenAT) {
                    state = !policyBetweenAT; 
                }
            }
        }
        // if this node shouldn't be display return false
        if(state === false) {
            return false;
        }

        // otherway continue parsing of the json object
        for (var associationNode in child.associations) {
            if (child.associations.hasOwnProperty(associationNode)) {
                nodeToDelete = [];
                for (i = 0; i < child.associations[associationNode].length; i += 1) {
                    nextChild = child.associations[associationNode][i];
                    if(!this.FilterObject(nextChild)) {
                        nodeToDelete.push(i);
                    }
                }

                for (var i = nodeToDelete.length-1; i >= 0; i -= 1) {
                    delete child.associations[associationNode].splice(nodeToDelete[i], 1);
                }
            }
        }
        return true;
    };

    cwApi.cwLayouts.cwFilterByExternalAssociation = cwFilterByExternalAssociation;

    }(cwAPI, jQuery));