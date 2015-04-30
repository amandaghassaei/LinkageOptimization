/**
 * Created by aghassaei on 4/29/15.
 */

//all help massages have text, may have img as well

function buildHelpMessages(){
    return {
        ga:{
            title: "Genetic Algorithm",
            text: '<a href="http://en.wikipedia.org/wiki/Genetic_algorithm" target="_blank">Genetic algorithms</a> (GAs) are a type of optimization strategy based on the principals of darwinian evolution, ie "survival of the fittest".  In general a GA works by creating a "population" of "individuals" that are all slightly different from each other.  Individuals in a population are selected based on their "fitness" to mate and pass their traits onto the next generation.  During the mating process, traits of the parent individuals may be mutated or crossed with each other to introduce variance into the next generation.<br/><br/>'+
                    'In the context of this app, an "individual" is a linkage design, and the traits it carries are the relative lengths of the links that make up the linkage.  Its fitness is evaluated based on the fitness function you define; for example, it may be more fit if its motion follows a desired trajectory.'
        },
        hillClimbing:{
            title: "Hill Climbing",
            text: ""
        },
        nelderMead:{
            title:"Nelder-Mead",
            text:"",
            img:"http://upload.wikimedia.org/wikipedia/commons/9/96/Nelder_Mead2.gif"
        },
        conjugateGrad:{
            title: "Conjugate Gradient",
            text: ""
        },
        populationSize:{
            title: "Population Size",
            text: ""
        },
        walkingMetric: {
            title: "Walking Fitness Metric",
            text:""
        },
        numLegPairs: {
            title: "Number of Leg Pairs",
            text:""
        },
        terrainType: {
            title: "Terrain",
            text:""
        },
        evalPeriod: {
            title: "Evaluation Period",
            text:""
        },
        friction: {
            title: "Friction",
            text:""
        },
        targetPathMetric: {
            title: "Target Path Fitness Metric",
            text:""
        },
        outputHinge: {
            title: "Output Hinge Index",
            text:""
        },
        simulatedAnnealing: {
            title: "Simulated Annealing",
            text:""
        },
        mutationRate: {
            title: "Mutation Rate",
            text:""
        },
        maxLengthChange: {
            title: "Maximum Length Change",
            text:""
        },
        minLinkLength: {
            title: "Minimum Link Length",
            text:""
        },
        mutateTopology: {
            title: "Mutate Topology",
            text:""
        }
    }
};