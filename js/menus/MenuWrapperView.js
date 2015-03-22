/**
 * Created by aghassaei on 1/26/15.
 */


MenuWrapper = Backbone.View.extend({

    el: "#menuHeader",

    events: {
        "click .menuWrapperTab>a":                     "_tabWasSelected"
    },

    initialize: function(){

        _.bindAll(this, "render", "_updateCurrentTab", "_setVisibility", "_hide", "_show");

        //init all tab view controllers
        this.drawParams = new DrawParamsMenuView({model:this.model});
        this.script = new ScriptMenuView({model:this.model});

        //bind events
        this.listenTo(this.model, "change:currentNav", this.render);
        this.listenTo(this.model, "change:currentTab", this._updateCurrentTab);
        this.listenTo(this.model, "change:menuIsVisible", this._setVisibility);

        if (this.model.get("menuIsVisible")) this._populateAndShow();
    },

    _tabWasSelected: function(e){
        e.preventDefault();
        var tabName = $(e.target).parent().data('name');
        this.model.set("currentTab", tabName);
    },

    _updateCurrentTab: function(){
        var tabName = this.model.get("currentTab");
        _.each($(".menuWrapperTab"), function(tab){
            var $tab = $(tab);
            if ($tab.data('name') == tabName){
                $tab.addClass("active");
            } else {
                $tab.removeClass("active");
            }
        });

        if (tabName == "drawParams") {
            this.drawParams.render();
        } else if (tabName == "script"){
            this.script.render();
        } else {
            console.warn("no tab initialized!");
            $("#menuContent").html('Coming Soon.');//clear out content from menu
        }

    },

    render: function(){
        var self = this;
        this._hide(function(){
            self._populateAndShow();
            self.model.trigger("change:currentTab");//this was updated silently before
        }, true);
    },

    _populateAndShow: function(){
        this.$el.html(this.template(this.model.toJSON()));
        this._updateCurrentTab();
        this._show();
    },

    _setVisibility: function(){
        if(this.model.get("menuIsVisible")){
            this._populateAndShow();
        } else {
            this._hide();
        }
    },

    _hide: function(callback, suppressModelUpdate){
        this.$el.parent().animate({right: "-420"}, {done: callback});
        if (!suppressModelUpdate) this.model.set("menuIsVisible", false);
    },

    _show: function(){
        this.$el.parent().animate({right: "0"});
        this.model.set("menuIsVisible", true);
    },

    template: _.template('\
        <ul class="nav nav-tabs nav-justified">\
        <% _.each(_.keys(allMenuTabs[currentNav]), function(key){ %>\
          <li role="presentation" class="menuWrapperTab" data-name="<%= key %>"><a href="#"><%= allMenuTabs[currentNav][key] %></a></li>\
        <% }); %>\
        </ul>\
        ')
});