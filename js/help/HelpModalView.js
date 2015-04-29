/**
 * Created by aghassaei on 4/29/15.
 */


/**
 * Created by aghassaei on 4/26/15.
 */


HelpModalView = Backbone.View.extend({

    el: "body",

    events: {
        "click .helpModal":             "_render"
    },

    initialize: function(){
        this.helpMessages = buildHelpMessages();
        this.$modal = $("#helpModal");
    },

    _render: function(e){
        e.preventDefault();
        var type = $(e.target).data("type");
        var message = this.helpMessages[type];
        if (!message || message === undefined || message === null){
            console.warn("no help message for type " + type);
            return;
        }
        this.$modal.html(this.template(message));
        this.$modal.modal("show");
    },

    template: _.template('\
            <div class="modal-dialog modal-med">\
                <div class="modal-content">\
                    <div class="modal-header">\
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>\
                    <p class="modal-title" ><%= title %></p>\
                    </div>\
                    <div class="modal-body">\
                        <%= text %>\
                    </div>\
                    <% if (img) {%>\
                    <img class="fullWidth" src="<%= img %>">\
                    <% } %>\
                </div>\
            </div>\
        ')

});