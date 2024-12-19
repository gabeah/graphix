# Project7: Sheet to the Wind

I enjoyed following the instructions! The steps were relatively straightforward. I had some issues with my sheet that I assume were caused by the way I construct my springs. As it stands, the assignment works, although rather slowly. It looks like there are still issues with how I construct the springs, as the sheet falls unevenly. I'm not quite sure what the issue is, however.

Everything else felt relatively straightforward, but as it stands submitted, there is this error that exists. Unfortunately the end of the semester hit like a truck and I was not able to implement flap.

Below are some pictures of weird-looking cloths during the process. I also have some videos that are in the `/pics` folder. I recieved some help from Zeke and Sam, who helped me conceptualize how some components were to be crafted, and Sam provided some debugging help in a clutch moment.

![kiki-cloth](./pics/Screenshot_20241219_144836.png)
![kiki-2-cloth](./pics/Screenshot_20241219_145348.png)

For these errors specifically, I reversed the constraints to only happen if both ends of the spring were fixed, which isn't ever the case, and I messed up how I did spring connections, namely not connecting the north east nodes correctly.