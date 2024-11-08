# Project 4 - Swerve Thru It - Gabe Howland

I corrected my walk-thru-it code based on your suggestions. Although some of the interpolation may be off, it renders objects correctly.

## The good:

I felt good about this project, or at least the work I was able to do. I had a better grasp on what I was doing, especially for interpolating between positions.

I felt a bit overwhelmed with the calculation of shots, but when talking with Duncan about the project, they gave me an idea to create my own interpolated shot list as opposed to affecting the given shot list. That way, I can manipulate the interpolated shots without messing up the original list.

## The bad:

I had some trouble interpolating between the view-angles. My knowledge on quaternions needs to continue to improve. I found a solution that feels slightly cheap which is an interpolation directly through the angles of each shot. It works pretty convincingly, but I'm dealing with some strange bugs around the way the vector math is done. I would love some feedback on the more correct way to do the process.

Also, I noticed a bug where in some instances, the view direction will not compute properly, and the shot will not exist. Javascript seems relatively unbothered and will just render a blank shot.