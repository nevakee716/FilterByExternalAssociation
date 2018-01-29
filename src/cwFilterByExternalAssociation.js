/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */
/*global cwAPI, jQuery*/

(function(cwApi, $) {
    'use strict';

    var cwFilterByExternalAssociation = function(options, viewSchema) {
        var error;


        if(options.CustomOptions.hasOwnProperty('replace-layout')) {

            this.replaceLayout = options.CustomOptions['replace-layout'];
            cwApi.extend(this, cwApi.cwLayouts[this.replaceLayout], options, viewSchema);
            this.NodesID = {};
            this.createObjectNodes(true,this.options.CustomOptions['filter-in']);
            this.createObjectNodes(false,this.options.CustomOptions['filter-out']);           
            this.betweenAssociationTypePolicy = this.options.CustomOptions['multiple-association-type-policy'];
            this.betweenAssociationPolicy = this.options.CustomOptions['multiple-association-policy'];

            cwApi.registerLayoutForJSActions(this);
            this.viewSchema = viewSchema; 

            this.CreateOtherOptions(this.options.CustomOptions['other-options']);
        } else {
            error = 'Cannot find replace-layout';
            cwAPI.Log.Error(error);   
            return error;         
        }



    };


    cwFilterByExternalAssociation.prototype.CreateOtherOptions = function(options) {
        if(options) {
            var optionList = options.split("#");
            var optionSplit;

            for (var i = 0; i < optionList.length; i += 1) {
                if(optionList[i] !== "") {
                    var optionSplit = optionList[i].split(":");
                    if(optionSplit[0] && optionSplit[1] && optionSplit[2] && optionSplit[2] === '1') {
                        if(optionSplit[1] === "true") {
                            this.options.CustomOptions[optionSplit[0]] = true;  
                        } else if(optionSplit[1] === "false") {
                            this.options.CustomOptions[optionSplit[0]] = false; 
                        }
                    }
                    else if(optionSplit[0] && optionSplit[1]  && optionSplit[2] === '0') {
                        this.options.CustomOptions[optionSplit[0]] = optionSplit[1];
                    }
                }
            }
        }
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
        this.removeFilterFromSearchEngine(cwAPI.cwConfigs.SearchEngineRequirements[this.viewSchema.ViewName]);
        this.noneFilterObject = object;
        output.push('<div id="cwLayoutFilterByExternalAssociation" class="bootstrap-iso cw-visible"></div></div><div id="cwLayoutContainerWrapper">');
        this.maxDepth = this.analyzeStructureJson(this.noneFilterObject,0).depth;
        this.associationTitleText = associationTitleText;
        if(cwApi.cwLayouts[this.replaceLayout].prototype.drawAssociations) {
            cwApi.cwLayouts[this.replaceLayout].prototype.drawAssociations.call(this,output, associationTitleText, object);
        } else {
            cwApi.cwLayouts.CwLayout.prototype.drawAssociations.call(this,output, associationTitleText, object);
        }
        output.push('</div>');
    };

    cwFilterByExternalAssociation.prototype.findFilterFields = function(child) {
        var nextChild = null;
        for (var associationNode in child.associations) {
            if (child.associations.hasOwnProperty(associationNode)) {
                var nodeToDelete = [];
                for (var i = 0; i < child.associations[associationNode].length; i += 1) {
                    if(this.NodesID.hasOwnProperty(associationNode)) {
                        this.NodesID[associationNode].addfield(this.viewSchema.NodesByID[associationNode].NodeName,child.associations[associationNode][i].name,child.associations[associationNode][i].object_id);
                    } else {
                        nextChild = child.associations[associationNode][i];
                        this.findFilterFields(nextChild);
                    }
                }
            }
        }
    };

    cwFilterByExternalAssociation.prototype.removeFilterFromSearchEngine = function(child) {
        var nodeToDelete = [];
        for (var i = 0; i < child.length; i += 1) {
            if(this.NodesID.hasOwnProperty(child[i].id)) {
                nodeToDelete.push(i);
            } 
            if(child[i].children) {
                this.removeFilterFromSearchEngine(child[i].children);
            }
        }
        for (var i = nodeToDelete.length-1; i >= 0; i -= 1) {
            delete child.splice(nodeToDelete[i], 1);

        }
    };

    cwFilterByExternalAssociation.prototype.analyzeStructureJson = function (child,level,options) {
        var nextChild = null;
        var tempInfo = {};   
        var info = {};
        info.noNodeFiler = true;
        info.depth = 0;

        for (var associationNode in child.associations) {
            if (child.associations.hasOwnProperty(associationNode)) {
                for (var i = 0; i < child.associations[associationNode].length; i += 1) {
                    nextChild = child.associations[associationNode][i];
                    tempInfo = this.analyzeStructureJson(nextChild,level + 1,options);
                    tempInfo.depth += 1; 
                    if(tempInfo.depth > info.depth) {
                        info.depth = tempInfo.depth;
                    }
                    if(!tempInfo.noNodeFiler) {
                        info.noNodeFiler = tempInfo.noNodeFiler;
                    }
                }
                if (this.NodesID.hasOwnProperty(associationNode)) {
                    info.noNodeFiler = false;
                }
            }
        }
        if(options !== false) {
            child.depth = info.depth;
            child.level = level;
        }
        return info;
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
                    cwAPI.Log.Error(error);
                }
            });
        }



    };
      

    cwFilterByExternalAssociation.prototype.createFilter = function () {
            var classname = 'customLayoutFilter';
            

            $('.' + classname).remove();
            var container = document.getElementById("zone_" + this.viewSchema.ViewName);
            var node;
            if(container && container.firstChild){
                for (node in this.NodesID) {
                    if (this.NodesID.hasOwnProperty(node)) {
                        container.firstChild.appendChild(this.NodesID[node].getFilterObject(classname));
                    }
                }
            }

            //var canvaHeight = window.innerHeight - networkContainer.getBoundingClientRect().top;
            container.setAttribute('style','height:' + window.innerHeight + 'px');

            var nodeID;
            var that = this;
            $('.' + classname).selectpicker();
            $('select.' + classname).on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
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

                //$("div.processus_niveau_3_20004_676292586.ot-microprocessus.cw-state-default.cw-accordion-header")[0].click()
                that.FilterObjectAndDraw(container);
            });
    };


    cwFilterByExternalAssociation.prototype.FilterObjectAndDraw = function(container) {

        //on duplique le l objet json afin de toujours avoir une copie de l'original
        var filterObject = $.extend(true, {}, this.noneFilterObject);
        if(!this.areAllFiltersUnselected()) {
            this.FilterObject(filterObject);
        }

        var output = [];
        var associationTitleText = this.associationTitleText;
        var i,j;
        
        var accordion = $('div[class*="accordion-header"]');
        var actives = [];

        //store deploy accordeon
        for (i = 0; i < accordion.length; i += 1) {
            if(accordion[i].className.indexOf("active") !== -1) {
                if(accordion[i] && accordion[i].children && accordion[i].children[2] && accordion[i].children[2].href) {
                    actives[i] = accordion[i].children[2].href;
                }
            }
        }

        //build inner html
        if(cwApi.cwLayouts[this.replaceLayout].prototype.drawAssociations) {
            cwApi.cwLayouts[this.replaceLayout].prototype.drawAssociations.call(this,output, associationTitleText, filterObject);
        } else {
            cwApi.cwLayouts.CwLayout.prototype.drawAssociations.call(this,output, associationTitleText, filterObject);
        }
        container.lastChild.innerHTML = output.join('');

        //enable behaviours
        cwAPI.cwDisplayManager.enableBehaviours(this.viewSchema,filterObject,false);


        //deploy stored accordeon (match are made on the href)
        accordion = $('div[class*="accordion-header"]');
        for (i = 0; i < accordion.length; i += 1) {
            if(accordion[i] && accordion[i].click && accordion[i].children && accordion[i].children[2] && accordion[i].children[2].href) {
                for (j = 0; j < actives.length; j += 1) {
                    if(actives[j] === accordion[i].children[2].href) {
                        accordion[i].click();
                    }
                }
            }
        }
    };

/*        if(cwApi.cwLayouts[this.replaceLayout].prototype.drawAssociations) {
            cwApi.cwLayouts[this.replaceLayout].prototype.drawAssociations.call(this,output, associationTitleText, object);
        } else {
            cwApi.cwLayouts.CwLayout.prototype.drawAssociations.call(this,output, associationTitleText, object);
        }*/


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
                
                var info = this.analyzeStructureJson(child,0,false); 
                if(info.depth !== child.depth || (child.depth === 0 && info.noNodeFiler)) {
                    return false;
                }
            }
        }
        return true;
    };

   cwFilterByExternalAssociation.prototype.areAllFiltersUnselected = function() {
        var id;
        for (id in this.NodesID) {
            if (this.NodesID.hasOwnProperty(id)) {
                if(this.NodesID[id].areAllUnselected() === false) {
                    return false;
                }
            }
        }
        return true;   
    };

    cwApi.cwLayouts.cwFilterByExternalAssociation = cwFilterByExternalAssociation;

    }(cwAPI, jQuery));