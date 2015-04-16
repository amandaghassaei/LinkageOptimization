/**
 * Created by aghassaei on 4/11/15.
 */


function Population(linkages){//init a linkage with optional hinges, links, and driveCrank

    if (linkages === undefined) linkages = this._initFirstGeneration();
    this._setLinkages(linkages);
}

Population.prototype._initFirstGeneration = function(){
    var firstGeneration = [];
    for (var i=0;i<globals.appState.get("populationSize");i++){
        var linkage = new Linkage();
        var hinge1 = linkage.addHingeAtPosition({x:0,y:Math.random()*10+20});
        var hinge2 = linkage.addHingeAtPosition({x:0,y:-20});
        var hinge3 = linkage.addHingeAtPosition({x:-10,y:0});
        var hinge4 = linkage.addHingeAtPosition({x:14,y:Math.random()*5}).setStatic(true);
        var hinge5 = linkage.addHingeAtPosition({x:-20,y:-Math.random()*5});

        linkage.link(hinge1, hinge3);//add an optional third param to set to a specific length
        linkage.link(hinge3, hinge2);
        linkage.link(hinge2, hinge4);
        linkage.link(hinge4, hinge1);
        var link35 = linkage.link(hinge3, hinge5);
        linkage.addDriveCrank(hinge5, hinge3, link35.getLength());
        firstGeneration.push(linkage);
    }
    return firstGeneration;
};

Population.prototype._setLinkages = function(linkages){
    this._waitTimePassed = false;//wait for transient motion from new linkage lengths to pass before collecting position info
    this._allHingePositionsStored = false;
    this._theta = 0;
    this._calcLinkageRederingOffsets(linkages);
    this._linkages = linkages;
};

Population.prototype.step = function(){
    var nextGen = this.calcNextGen(this._linkages);
    this.clearAll();
    this._setLinkages(nextGen);
};

Population.prototype.calcNextGen = function(linkages){
    if (!linkages || linkages.length == 0){
        console.warn("this population has no linkages");
        return [];
    }
    var mutationRate = globals.appState.get("mutationRate");
    var nextGenLinkages = [];

    //hill climbing mode
    if (globals.appState.get("isHillClimbing")){
        var parent = this._getBestLinkage(linkages);
        nextGenLinkages.push(parent);
        nextGenLinkages.push(parent.hillClimb(mutationRate));
        return nextGenLinkages;
    }

    //genetic algorithm mode
    var matingPool = this._createMatingPool(linkages);
    for (var i=0;i<linkages.length;i++){//next generation is the same size as this one
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
//        _.each(this._linkages, function(linkage){
//            linkage.drive();
//        });
        globals.physics.update();

        var angle = this._getCurrentDriveCrankAngle();
        _.each(this._linkages, function(linkage, index){
            linkage.render(angle);
        });
    }
};

Population.prototype._calcLinkageRederingOffsets = function(linkages){//draw in grid layout on screen
    var populationNum = linkages.length;
    var numPerRow = Math.ceil(Math.sqrt(populationNum));
    var width = window.innerWidth/numPerRow;
    var numPerCol = numPerRow;
    _.each(linkages, function(linkage, index){
        var position = {x:(index%numPerRow-numPerRow/2)*100,
            y:(Math.floor(index/numPerRow)-numPerCol/2)*100};
        linkage.setDrawOffset(position);
    });
};

Population.prototype._getCurrentDriveCrankAngle = function(){
    var step = Math.PI*2/globals.appState.get("numPositionSteps");
    this._theta += step;
    if (this._theta > Math.PI*2) {
        if (!this._waitTimePassed) this._waitTimePassed = true;//wait for one rotation of crank to start storing hinge pos data
        else {
            this._allHingePositionsStored = true;
            _.each(this._linkages, function(linkage){
                for (var i=0;i<5;i++){
                    linkage.drawTrajectory(i);
                }
            });
        }
        this._theta = 0;
    }
    return this._theta;
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

Population.prototype.shouldStorePosition = function(){
    return this._waitTimePassed && !this._allHingePositionsStored;
};





//Meta

Population.prototype.toJSON = function(){
    return this._linkages;
};

Population.prototype.setFromJSON = function(json){
    this.clearAll();
    var self = this;
    _.each(json, function(linkageJSON){
        self._linkages.push(new Linkage(linkageJSON));
    });
};

Population.prototype.clearAll = function(){
    _.each(this._linkages, function(linkage){
        linkage.destroy();
        linkage = null
    });
    this._setLinkages([]);
};

Population.prototype.reset = function(){
    this.clearAll();
    this._setLinkages(this._initFirstGeneration());
};

Population.prototype.destroy = function(){
    console.log("need this?");
};