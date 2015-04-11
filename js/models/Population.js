/**
 * Created by aghassaei on 4/11/15.
 */


function Population(linkages){//init a linkage with optional hinges, links, and driveCrank

    this.linkages = linkages;
}

Population.prototype.calcNextGen = function(){
    if (!this.linkages || this.linkages.length == 0){
        console.warn("this population has no linkages");
        return [];
    }
    var mutationRate = globals.appState.get("mutationRate");
    var nextGenLinkages = [];

    //hill climbing mode
    if (globals.appState.get("isHillClimbing")){
        var parent = this._getBestLinkage(this.linkages);
        nextGenLinkages.push(parent);
        nextGenLinkages.push(parent.clone().mutate(mutationRate));//we should add simulated annealing ot this as well
        return nextGenLinkages;
    }

    //genetic algorithm mode
    var matingPool = this._createMatingPool(this.linkages);
    for (var i=0;i<this.linkages.length;i++){//next generation is the same size as this one
        var parent1 = this._drawFromMatingPool(matingPool);
        var parent2 = this._drawFromMatingPool(matingPool);
        nextGenLinkages.push(parent1.mate(parent2).mutate(mutationRate));
    }

    return nextGenLinkages;
};


//Hill Climbing Selection (get the best)

Population.prototype._getBestLinkage = function(linkages){
    var bestLinkage = null;
    var bestFitness = 0;
    _.each(linkages, function(linkage){
        if (linkage.getFitness()>bestFitness){
            bestFitness = linkage.getFitness();
            bestLinkage = linkage;
        }
    });
    if (!bestLinkage) console.warn("no linkages have fitness > 0");
    return bestLinkage;
};



//Fitness proportionate selection

Population.prototype._createMatingPool = function(linkages){//create mating pool using fitness proportionate selection
    var pool = [];
    _.each(linkages, function(linkage){
        var numPoolEntries = linkage.getFitness();//this may change
        for (var i=0;i<numPoolEntries;i++){
            pool.push(linkage);
        }
    });
    return pool;
};

Population.prototype._drawFromMatingPool = function(pool){
    var index = Math.floor(Math.random()*pool.length);
    return pool[index];
};