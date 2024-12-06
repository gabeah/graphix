# Project 6
## Gabe Howland

This project is now complete! I had a lot of issues getting my calculations just right. The biggest issue I ran into was creating too many vertices. When I originally submitted the assignment, I was initially iterating over each face in the initial mesh and making 3 vertices. What happened is that any faces with shared vertices produced more clones which caused problems to say the least.

Another issue I ran into was not properly assigning `edge.split`. I forgot to assign splits to the edge and it's twin, and also checking if a split pre-existed and not overwriting it.

There were some pretty major changes between this submission and the earlier submission. I have maintained a copy in `bad_subdivide.js`.