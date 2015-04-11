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
    var matingPool = this._createMatingPool(this.linkages);
    var nextGenLinkages = [];
    for (var i=0;i<this.linkages.length;i++){//next generation is the same size and this one
        var parent1 = this._drawFromMatingPool(matingPool);
        var parent2 = this._drawFromMatingPool(matingPool);
        nextGenLinkages.push()
    }
    return nextGenLinkages;
};


//Fitness proportionate selection

Population.prototype._createMatingPool = function(linkages){//create mating pool using fitness proportionate selection
    var pool = [];
    _.each(this.linkages, function(linkage){
        for (var i=0;i<linkage.getFitness();i++){
            pool.push(linkage);
        }
    });
    return pool;
};

Population.prototype._drawFromMatingPool = function(pool){
    var index = Math.floor(Math.random()*pool.length);
    return pool[index];
};