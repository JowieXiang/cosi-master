import ResultTemplate from "text-loader!./resultTemplate.html";

const ResultView = Backbone.View.extend({
    model: {},
    template: _.template(ResultTemplate),
    render: function () {
        const attr = this.model.toJSON(),
            results = this.model.getResults();
        let currentResult;

        this.$el.html(this.template(attr));
        
        if (results !== {}) {
            for (const district in results) {
                currentResult = `<tr><th>${district}</th><td>${(1000 * results[district]).toFixed(2)}</td></tr>`;
                this.$el.find(".table").append(currentResult);
            }
        }

        return this;
    }
});

export default ResultView;