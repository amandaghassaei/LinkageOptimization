/**
 * Created by aghassaei on 4/11/15.
 */


function Population(linkages){//init a linkage with optional hinges, links, and driveCrank

    if (linkages === undefined) linkages = this.initFirstGeneration();
    this._linkages = linkages;
}

Population.prototype.initFirstGeneration = function(){
    var firstGeneration = [];
    //init first generation
    return firstGeneration;
}

Population.prototype.calcNextGen = function(){
    if (!this._linkages || this._linkages.length == 0){
        console.warn("this population has no linkages");
        return [];
    }
    var mutationRate = globals.appState.get("mutationRate");
    var nextGenLinkages = [];

    //hill climbing mode
    if (globals.appState.get("isHillClimbing")){
        var parent = this._getBestLinkage(this._linkages);
        nextGenLinkages.push(parent);
        nextGenLinkages.push(parent.hillClimb(mutationRate));
        return nextGenLinkages;
    }

    //genetic algorithm mode
    var matingPool = this._createMatingPool(this._linkages);
    for (var i=0;i<this._linkages.length;i++){//next generation is the same size as this one
        var parent1 = this._drawFromMatingPool(matingPool);
        var parent2 = this._drawFromMatingPool(matingPool);
        nextGenLinkages.push(parent1.mate(parent2, mutationRate));
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




//Draw

Population.prototype.render = function(){
    if (globals.appState.get("isAnimating")){
        _.each(this._linkages, function(linkage){
            linkage.render();
        });
    }
};

Population.prototype.clearAll = function(){
    console.log("clearAll");
};

Population.prototype.setWidth = function(width){
    _.each(this._linkages, function(linkage){
        linkage.setWidth(width);
    });
};

Population.prototype.setDepth = function(depth){
    _.each(this._linkages, function(linkage){
        linkage.setDepth(depth);
    });
};


//meta

Population.prototype.toJSON = function(){
    console.log("toJSON");
    return {};
};

Population.prototype.destroy = function(){
    console.log("need this?");
};