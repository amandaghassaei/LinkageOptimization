/**
 * Created by aghassaei on 4/16/15.
 */


Function.prototype._clone = function(){

};

function ScriptAPI(){

    this.editedFitness = this.defaultFitness;
    this.editedFirstGen = this.defaultFirstGen;
}

ScriptAPI.prototype.defaultFitness = Linkage.prototype._calcFitness;
ScriptAPI.prototype.defaultFirstGen = Population.prototype._initFirstGeneration;
