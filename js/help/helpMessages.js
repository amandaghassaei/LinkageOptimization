/**
 * Created by aghassaei on 4/29/15.
 */

//all help massages have text, may have img as well

function buildHelpMessages(){
    return {
        optimizationStrategy:{
            title: "Optimization Strategy",
                text:"<b>Hill Climbing</b> - <br/>" +
                "<b>Genetic Algorithm (GA)</b> - <br/>" +
                "<b>Nelder-Mead</b> - <br/>" +
            "<b>Conjugate Gradient</b> - <br/>"
        },
        walkingMetric: {
            title: "Walking Fitness Metric",
                text:""
        },
        targetPathMetric: {
            title: "Target Path Fitness Metric",
                text:""
        },
        numLegPairs: {
            title: "Number of Leg Pairs",
                text:""
        }
    }
};