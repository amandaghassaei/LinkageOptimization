/**
 * Created by aghassaei on 4/11/15.
 */


function Population(){//init a linkage with optional hinges, links, and driveCrank
}

Population.prototype.init = function(){
    var linkages = this._initFirstGeneration();
    this._setLinkages(linkages);
};

Population.prototype._initFirstGeneration = function(archetype){
    var firstGeneration = [];

    if (archetype === undefined){
        archetype = new Linkage();
        var hinge1 = archetype.addHingeAtPosition({x:15,y:30});
        var hinge2 = archetype.addHingeAtPosition({x:0,y:40});
        var hinge3 = archetype.addHingeAtPosition({x:-10,y:0});
        var hinge4 = archetype.addHingeAtPosition({x:14,y:2}).setStatic(true);
        var hinge5 = archetype.addHingeAtPosition({x:-20,y:-2});

        archetype.link(hinge1, hinge3);//add an optional third param to set to a specific length
        archetype.link(hinge4, hinge1);
        archetype.link(hinge2, hinge1);
        archetype.link(hinge2, hinge3);

        var link35 = archetype.link(hinge3, hinge5);
        archetype.addDriveCrank(hinge5, hinge3, link35.getLength());
    }

    firstGeneration.push(archetype.clone());

    var mutationRate = globals.appState.get("mutationRate");
    if (globals.appState.get("isHillClimbing")){
        firstGeneration.push(archetype.forceMutate(mutationRate));
        archetype.destroy();
        return firstGeneration;
    }

    //init a proper population
    for (var i=1;i<globals.appState.get("populationSize");i++){
        firstGeneration.push(archetype.forceMutate(mutationRate));
    }
    archetype.destroy();
    return firstGeneration;
};

Population.prototype._setLinkages = function(linkages){
    this._waitTimePassed = false;//wait for transient motion from new linkage lengths to pass before collecting position info
    this._allHingePositionsStored = false;
    this._theta = 0;
    this._calcLinkageRederingOffsets(linkages);
    this._linkages = linkages;
    this._renderIndex = 0;
    this._calculateTrajectory();
    this._buildTargetPathVisualization(linkages);
    if (linkages.length > 0 && (globals.appState.get("shouldRenderThreeJS") || !globals.appState.get("isRunning"))){
        this.getBestLinkage(linkages).setColor("0xffff00");
    }
};




//Run

Population.prototype.run = function(){
    if (globals.appState.get("isRunning")){
        globals.population.step();
        setTimeout(globals.population.run, 0);
    }
};

Population.prototype.step = function(){
    if (!this.readyToCalcNextGen()) {
        console.warn("paths not finished computing yet");
        return;
    }
    var nextGen = this.calcNextGen(this._linkages);
    globals.runStatistics.push(this.getCurrentStatistics(this._linkages));
    this.clearAll();
    this._setLinkages(nextGen);
};

Population.prototype.readyToCalcNextGen = function(){
    return this._allHingePositionsStored;
};

Population.prototype._calculateTrajectory = function(){
    globals.physics.update();
    var angle = this._getCurrentDriveCrankAngle();
    if (this.readyToCalcNextGen()) return;
    _.each(this._linkages, function(linkage){
        linkage.render(angle, true);
    });
    this._calculateTrajectory();
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
        var parent = this.getBestLinkage(linkages);
        nextGenLinkages.push(parent.clone());
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





//Stats

Population.prototype.getBestLinkage = function(linkages){
    return this.getCurrentStatistics(linkages, true);
};

Population.prototype.getCurrentStatistics = function(linkages, returnLinkageObject){
    if (linkages === undefined) linkages = this._linkages;
    var minFitness = 1000000;
    var maxFitness = 0;
    var bestLinkage = linkages[0];
    var fitnessSum = 0;
    _.each(linkages, function(linkage){
        var fitness = linkage.getFitness();
        if (fitness < minFitness) minFitness = fitness;
        if (fitness > maxFitness) {
            maxFitness = fitness;
            bestLinkage = linkage;
        }
        fitnessSum += fitness;
    });
    if (returnLinkageObject) return bestLinkage;
    return {minFitness:minFitness, maxFitness:maxFitness, avgFitness:fitnessSum/linkages.length, bestLinkage:bestLinkage.toJSON()}
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
    if ( (globals.appState.get("shouldRenderPhaseChange") || globals.appState.get("isAnimating") || globals.appState.get("isRunning")) && this.readyToCalcNextGen()){
        var self = this;
        _.each(this._linkages, function(linkage){
            linkage.render(self._renderIndex, false);
        });
        globals.appState.set("shouldRenderPhaseChange", false, {silent:true});
        if (globals.appState.get("isAnimating")) this._renderIndex++;
        if (this._renderIndex >= globals.appState.get("numPositionSteps")) this._renderIndex = 0;
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

Population.prototype._buildTargetPathVisualization = function(linkages){
    var path = globals.targetCurve;
    var visibility = globals.appState.get("showTargetPath");
    _.each(linkages, function(linkage){
        linkage.drawTargetPath(path, linkage.getTranslationalOffset(), visibility);
    });
};


Population.prototype._getCurrentDriveCrankAngle = function(){
    this._theta += Math.PI*2/globals.appState.get("numPositionSteps");
    if (this._theta > Math.PI*2) {
        if (!this._waitTimePassed) this._waitTimePassed = true;//wait for one rotation of crank to start storing hinge pos data
        else if (!this._allHingePositionsStored) {
            this._allHingePositionsStored = true;
            var visibility = globals.appState.get("showHingePaths");
            var outputIndex = globals.appState.get("outputHingeIndex");
            _.each(this._linkages, function(linkage){
                linkage.drawTrajectories(visibility);
                linkage.relaxHingePositions();
                linkage.checkContinuity(outputIndex);
            });
            this.setOutputPathVisibility(globals.appState.get("showOutputPath"));
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

Population.prototype.setHingePathVisibility = function(visibility){
    _.each(this._linkages, function(linkage){
        linkage.setHingePathVisibility(visibility);
    });
};

Population.prototype.setOutputPathVisibility = function(visibility){
    var outputIndex = globals.appState.get("outputHingeIndex");
    _.each(this._linkages, function(linkage){
        linkage.setHingePathVisibility(visibility, outputIndex);
    });
};

Population.prototype.setTargetPathVisibility = function(visibility){
    _.each(this._linkages, function(linkage){
        linkage.setTargetPathVisibility(visibility);
    });
};

Population.prototype.setPhase = function(phase){
    this._renderIndex = phase;
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

Population.prototype.reset = function(archetype){
    globals.runStatistics = [];
    var firstGeneration = this._initFirstGeneration(archetype);
    this.clearAll();
    this._setLinkages(firstGeneration);
};

Population.prototype.saveBestOutputPath = function(){
    var bestLinkage = this.getBestLinkage(this._linkages);
    globals.saveFile(JSON.stringify({
        path: bestLinkage.getTrajectory(globals.appState.get("outputHingeIndex"))
    }), "outputPath", ".json");
};

Population.prototype.newTargetPathLoaded = function(){
    var newTargetPath = globals.targetCurve;
    var visibility = globals.appState.get("showTargetPath");
    _.each(this._linkages, function(linkage){
        linkage.drawTargetPath(newTargetPath, linkage.getTranslationalOffset(), visibility);
    });
};