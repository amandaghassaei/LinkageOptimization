import json
import matplotlib.pyplot as plt
import sys

# special matplotlib argument for improved plots
from matplotlib import rcParams

#colorbrewer2 Dark2 qualitative color table
dark2_colors = [(0.10588235294117647, 0.6196078431372549, 0.4666666666666667),
                (0.8509803921568627, 0.37254901960784315, 0.00784313725490196),
                (0.4588235294117647, 0.4392156862745098, 0.7019607843137254),
                (0.9058823529411765, 0.1607843137254902, 0.5411764705882353),
                (0.4, 0.6509803921568628, 0.11764705882352941),
                (0.9019607843137255, 0.6705882352941176, 0.00784313725490196),
                (0.6509803921568628, 0.4627450980392157, 0.11372549019607843)]

rcParams['figure.figsize'] = (10, 6)
rcParams['figure.dpi'] = 150
rcParams['axes.color_cycle'] = dark2_colors
rcParams['lines.linewidth'] = 2
rcParams['axes.facecolor'] = 'white'
rcParams['font.size'] = 14
rcParams['patch.edgecolor'] = 'white'
rcParams['patch.facecolor'] = dark2_colors[0]
rcParams['font.family'] = 'StixGeneral'

def remove_border(axes=None, top=False, right=False, left=True, bottom=True):
    """
    Minimize chartjunk by stripping out unnecesary plot borders and axis ticks
    
    The top/right/left/bottom keywords toggle whether the corresponding plot border is drawn
    """
    ax = axes or plt.gca()
    ax.spines['top'].set_visible(top)
    ax.spines['right'].set_visible(right)
    ax.spines['left'].set_visible(left)
    ax.spines['bottom'].set_visible(bottom)
    
    #turn off all ticks
    ax.yaxis.set_ticks_position('none')
    ax.xaxis.set_ticks_position('none')
    
    #now re-enable visibles
    if top:
        ax.xaxis.tick_top()
    if bottom:
        ax.xaxis.tick_bottom()
    if left:
        ax.yaxis.tick_left()
    if right:
        ax.yaxis.tick_right()

def graph_fitness(filename):

	with open(filename) as f:
		run_stats = json.load(f)

	fitnesses = []
	for run in run_stats['data']:
		fitnesses.append(run['allFitness'])

	plt.boxplot(fitnesses)
	remove_border()

	plt.xlabel("Run")
	plt.ylabel("Fitness")
	plt.title("Mutation Rate: " + str(run_stats['mutationRatePercent']) + " Hillclimbing: " + str(run_stats['isHillClimbing']) + " Population Size: " + str(run_stats['populationSize']))

	plt.show()

# if __name__ == '__main__':

# 	if len(sys.argv) == 2:
# 		infile = sys.argv[1]
# 	else:
# 		print 'usage ./graph_fitness.py infile'
# 		sys.exit()

# 	graph_fitness(infile)
# 	sys.exit()

# graph_fitness("runStatistics.json")
graph_fitness("hillclimbingstats_0427.json")

