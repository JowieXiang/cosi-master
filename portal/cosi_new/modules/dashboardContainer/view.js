import Template from "text-loader!./template.html";

const DashboardContainerView = Backbone.View.extend({
    events: {
    },
    initialize (content, parent) {
        const attrs = content.model.defaults;

        this.content = content;
        this.attrs = {
            id: attrs.id,
            name: attrs.name,
            glyphicon: attrs.glyphicon
        };

        this.render();
    },
    content: {},
    attrs: {},
    template: _.template(Template),
    render () {
        this.setElement(document.querySelector(this.parentSelector));
        this.$el.html(this.template(this.attrs));

        if (this.content instanceof Backbone.View) {
            this.renderView();
        }
        else if (this.content instanceof Jquery) {
            this.render$el();
        }
        else if (this.content instanceof String) {
            this.renderHtml();
        }

        return this;
    },
    renderView () {
        this.$el.find("#content").append(this.content.render().el);
    },
    render$el () {
        this.$el.find("#content").append(this.content);
    },
    renderHtml () {
        this.$el.find("#content").html(this.content);
    }
});

export default DashboardContainerView;
