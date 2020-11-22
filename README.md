Silicon Relaxation Visualisation
================================

As part of my undergraduate DFT course, we performed `relaxation` computations using quantum espresso (QX).
We created a 2 x 2 x 2 silicon supercell, then removed the atom at the origin.
This p5 visualisation shows the locations of the silicon atoms before (blue) and after (red) relaxation.
Coloured lines show the atoms' displacements: redder means bigger.
The white translucent spheres are the locations of the vacancies.

There are some nuances with the visualisation.
Firstly, there are in fact seven 2 x 2 x 2 supercells visualised, rather than the single supercell defined by the QX input.
This is in order to make the movement of the atoms towards vacancies more apparent;
it was easier to do it this way than to determine what lies on a periodic boundary (and therefore should be visible).
The green unit cell is the _actual_ unit cell of silicon, not a supercell.
Secondly, the displacements are exaggerated by 10 times in order to make the atoms' trajectories more apparent.

The visualisation is most useful when zoomed in on the central point, from which the light is emitted.
From this viewport, the movement of the surrounding atoms towards the vacancy is apparent.
