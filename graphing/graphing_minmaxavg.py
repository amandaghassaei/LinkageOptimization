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

def graph_fitness(filenames):

    avg_fits = []
    max_fits = []
    min_fits = []

    for filename in filenames:

        with open(filename) as f:
            run_stats = json.load(f)

        # fitnesses = []

        avg_fit = []
        max_fit = []
        min_fit = []

        for run in run_stats['data']:
            # fitnesses.append(run['allFitness'])

            avg_fit.append(run['avgFitness'])
            max_fit.append(run['maxFitness'])

            if not run['minFitness']:
                min_fit.append(0)
            else:
                min_fit.append(run['minFitness'])

        avg_fits.append(avg_fit)
        max_fits.append(max_fit)
        min_fits.append(min_fit)

    # plt.boxplot(fitnesses)
    # for m in max_fit:

    # plt.plot(max_fits[0][:1000], label='1%')
    # plt.plot(max_fits[1][:1000], label='5%')
    # plt.plot(max_fits[2][:1000], label='10%')
    # plt.plot(max_fits[3][:1000], label='20%')
    # plt.plot(max_fits[4][:1000], label='50%')


    plt.plot(max_fits[0][:500], label='5')
    plt.plot(max_fits[1][:500], label='15')
    plt.plot(max_fits[2][:500], label='25')
    plt.plot(max_fits[3][:500], label='50')
    plt.plot(max_fits[4][:500], label='60')
    plt.plot(max_fits[5][:500], label='80')
    plt.plot(max_fits[6][:500], label='100')
    # plt.plot(max_fits[4][:500], label='100')

    # plt.plot(max_fits[0], label='Trial 1')
    # plt.plot(max_fits[1], label='Trial 2')
    # plt.plot(max_fits[2], label='Trial 3')
    # plt.plot(max_fits[0], label='A')
    # plt.plot(max_fits[1], label='B')
    # plt.plot(max_fits[2], label='C')
    # plt.plot(max_fits[3], label='D')

    # plt.plot(avg_fit, label='Avg fitness')
    # plt.plot(min_fit, label='Min fitness')

    # avg_fits[0] = avg_fits[0][:-1]
    # max_fits[0] = max_fits[0][:-1]
    # min_fits[0] = min_fits[0][:-1]

    # fig, ax = plt.subplots()
    # ax.plot(avg_fits[0])
    # ax.fill_between(xrange(len(avg_fits[0])), avg_fits[0], max_fits[0], alpha=0.5)
    # ax.fill_between(xrange(len(avg_fits[0])), min_fits[0], avg_fits[0], alpha=0.5)

    remove_border()
    axes = plt.gca()

    axes.set_ylim([0,100])

    plt.legend(loc=4)

    plt.xlabel("Number of runs")
    plt.ylabel("Fitness") 

    plt.title("Mutation Rate: " + str(run_stats['mutationRatePercent']) + " Optimization Strategy: " + str(run_stats['optimizationStrategy']) + " Population Size: " + str(run_stats['populationSize']))

    plt.show()

# if __name__ == '__main__':

#   if len(sys.argv) == 2:
#       infile = sys.argv[1]
#   else:
#       print 'usage ./graph_fitness.py infile'
#       sys.exit()

#   graph_fitness(infile)
#   sys.exit()

# graph_fitness("runStatistics.json")
# graph_fitness("hillclimbingstats_0427.json")
# topbumpy_graph_hc.png
# topsquiggly_graph_more_hc.png
# hillClimbGraphCombined.png
# 

# topcombined_graph_hc.png
# mutation_rate.png
# mutation_rate_more.png
# topflat_mutation_rate_evenmore_fixed.png
# topflat_pops.png
# topsquig_maxlen_evenmore.png



# graph_fitness('../target_curves/topsquiggly_runstats_more_hc.json')
# graph_fitness(['amanda_hc/hillClimb1Stats.json', 'amanda_hc/hillClimb2Stats.json', 'amanda_hc/hillClimb3Stats.json'])

# graph_fitness(['amanda_hc/finalGAWalkingStats.json'])

# graph_fitness(['../target_curves/topflat_runstats2_hc.json', '../target_curves/topsmall_runstats_hc.json', '../target_curves/toploopy_runstats_hc.json', '../target_curves/topsquiggle_runstats_hc.json'])

# graph_fitness(['../target_curves/topflat_runstats2.json', 'mutation_rate/topflat_5.json', 'mutation_rate/topflat_10.json', 'mutation_rate/topflat_20.json', 'mutation_rate/topflat_50_v2.json'])
# graph_fitness(['../target_curves/topsquiggle_runstats.json', 'mutation_rate/topsquiggle_5.json', 'mutation_rate/topsquiggle_10.json', 'mutation_rate/topsquiggle_15.json'])


# graph_fitness(['mutation_rate/topsquiggle_pop5.json', 'mutation_rate/topsquiggle_pop10.json', '../target_curves/topsquiggle_runstats.json', 'mutation_rate/topsquiggle_pop50.json', 'mutation_rate/topsquiggle_pop100.json'])
# graph_fitness(['mutation_rate/topflat_pop5.json', 'mutation_rate/topflat_pop10.json', '../target_curves/topflat_runstats2.json', 'mutation_rate/topflat_pop50.json', 'mutation_rate/topflat_pop100.json'])
# graph_fitness(['mutation_rate/topsquig_maxlen5.json', '../target_curves/topsquiggle_runstats.json', 'mutation_rate/topsquig_maxlen25.json', 'mutation_rate/topsquig_maxlen50.json'])

graph_fitness(['mutation_rate/topsquig_maxlen5.json', '../target_curves/topsquiggle_runstats.json', 'mutation_rate/topsquig_maxlen25.json', 'mutation_rate/topsquig_maxlen50.json', 'mutation_rate/topsquig_maxlen60.json', 'mutation_rate/topsquig_maxlen80.json', 'mutation_rate/topsquig_maxlen100.json'])
