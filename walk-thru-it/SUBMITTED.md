# Walk-Thru-It Gabe Howland

## Written section:
As evidenced by the submitted written assignments. I struggled with conceptualizing the problems (and following it up with correct answers). I'm glad that the goal for the written assignment was to begin thinking about the problems, because the walk-throughs later was quite helpful.

I still had some trouble with part 4 (even after the explanation).

## Programming Section:
Before I go further into this writeup, I want to mention that I did work with Zeke Dawson and Duncan Stewardson. We talked through all the problems at length, and they both provided some help when debugging.

### The Bad
There were a couple of sections in which I struggled quite a lot, and it feels like it largely due to still being rusty on linear algebra (but I am working on that). The biggest challenge came from the `breakpoints` section. I dealt with numerous bugs in my `segmentsIntersect()` function and in my `breakpoints()` function. It turns out that a large part of my errors stemmed from floating-point problems, and parallel lines. At a certain point, the default scene would only render the rabbit.

This was one of the major areas Zeke and Duncan helped out, there are some snippets of code (which I have marked in comments) where they aided.

The other major problem I had with this assignment was the face-detection. I had previously struggled with understanding the solution to part 4, so when I was tasked with finding whether a ray intersected with a face, I felt pretty lost.

This is the other major area where Zeke and Duncan helped out again. We walked through the solution as a group to make sure we all understood what was being asked, and what the process is. Duncan also told me about an important check, making sure the ray is intersecting the face itself (instead of the plane defined by Q1, Q2, Q3).

### The Good
Although I struggled with this. I really enjoyed this project. It was complex, and really tested my knowledge on dot and cross products, but overall taught me a lot about projection. And although I hit a few roadbumps, I'm happy with the final result (and I now know the `Vector` and `Point` classes much better). I will endless gripe about JavaScript's lack of care for errors and `NaN` values, but thats besides the point.

I hope to continue to collaborate with Duncan and Zeke on further projects, they were great as extra sets of eyes, and also as peers to bounce ideas off of.

Also, this project did cement my knowledge of how projection, intersection, and the like all operate (however inefficient).