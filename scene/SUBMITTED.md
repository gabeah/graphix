# Project 2 - Make a Scene

I will specify the line range for each section of the project. Some of the pre-existing code has been deleted to keep my contributions all in one place. Line ranges are approximate.

Note, there is an assertion error that is appearing in the console with no clarification on what the assertion is. It doesn't affect the functionality of my code.

## 2D Scene
### Lines 201 - 350
I decided to make waves (literally) in the scene. You can click and drag the waves around. An attempt to make a periscope exists in the code (and is commented out). I ran out of time/patience to make it work.

## Recursive Snowflake
### Lines 351 - 398
I created a Sierpinski Hexagon. In all honesty, I'm suprised it worked almost first try. There is currently a bug where for when the slider is set to zero. The fix is having the slider start at 1. Also, the slider needs to be updated in order for the recursion to be set.

## Still Life
### Lines 698 - 1004 (I cut out the table/wall/light making cause I did not actively write that code)
This is relatively straightforward. It looks like there was a `createTable()` function hiding in the code. I'm not sure if that was intentional, but I am using it to create the table in the project.

The objects are sitting comfortably on it, I'm not sure if they are interfacing with the lighting correctly, but I think it is also due to the wild color scheme I have set.

## Animation
### Lines 1005 - 1207
This animation is (supposed to) be a leg juggling a ball. The ball moves independently of the leg. The leg was constructed from the ankle, to the thigh (in the reverse order legs should be constructed). I feel it leads to an interesting movement pattern that looks like the thigh is pulling the leg into shape.