//
// Project 2: make a scene
//
// scene.js
//
// CSCI 385: Computer Graphics, Reed College, Fall 2024
//
// This is a sample `opengl.js`-based program that displays a scene of
// a house, a recursively drawn Sierpinski carpet, an empty room, and
// an animation.
//
// The OpenGL drawing part of the code occurs in `draw` and that
// function relies on several helper functions to do its work.  There
// is a `drawHouse`, a `drawSquareSierpinski`, a `drawStillLife`, and
// a `drawWavingArm` function to draw each figure or scene.
//
// Your assignment is to change the four scenes to the following:
//
// - Scene: draw a 2D scene different than the house.
// - Recursive: draw a different fractal,
// - Still life: add a table to the room with objects that sit on it.
// - Animation: show movement of some other articulated figure.
//
// For each of these, you'll write functions that describe their
// components in 2-space and 3-space. These are `make...` functions
// like `makeCube` that rely on `glBegin` and `glEnd` to describe the
// geometry of a component. And then in their `draw...` functions
// you'll use `glTranslatef`, `glRotatef`, and `glScalef` calls to
// place, orient, and scale each component that's drawn.
//
// Your drawings will be hierarchical and rely on a transformation
// stack to layout a component and its subcomponents. You'll use
// calls to `glPushMatrix` and `glPopMatrix` to control the stack,
// saving and restoring where you are working in the scene or with
// the figure.
//
// This is all described in the web document
//
//   http://jimfix.github.io/csci385/assignments/project2/scene.html
//

// ***** GLOBALS *****
//
// Globals for mouse handling.
//
let gOrientation = quatClass.for_rotation(0.0, new Vector3d(1.0,0.0,0.0));
let gMouseStart  = {x: 0.0, y: 0.0};
let gMouseDrag   = false;

// Global indicating which of the four scenes is shown.
//
var gScene = "scene";

// Globals for the app size.
//
var gLastw = 800;
var gLasth = 640;

// Global for turning any animation on/off.
//
let gAnimate = true;

// Global for perspective vs. orthographic viewing of the still life.
//
let gPerspective = true;

//
// Globals for several scenes' controls.
//

// For the 2-D scene...
var gAngle1 = -30;     
var gAngle2 = -30;
var gLocation = {x: -1.5, y: 1.0};

// For the recursive figure...
var gRecursiveLevels = 3;

// For the swinging light in the still life scene...
let gLightTime = 0.0;
let gLightRate = Math.PI/80.0;
let gLightDepth = -0.25;
let gLightRadius = 1.5;
let gLightHalfArc = Math.PI * 45.0 / 180.0;

// For the waving arm...
let gShoulder = 0.0;
let gElbow = 0.0;
let gWrist = 15 / Math.PI;


// ***** HOUSE *****

//
// Functions for making and drawing the house scene.
//

// makeRTRI
//
// Describes an isoceles right triangle whose corner is at the origin
// and whose sides are along the +x and +y axes with unit length.
//
function makeRTRI() {
    glBegin(GL_TRIANGLES,"RTRI");
    glVertex3f(0.0,0.0,0.0);
    glVertex3f(1.0,0.0,0.0);
    glVertex3f(0.0,1.0,0.0);
    glEnd();
}

// makeDISK
//
// Describes a unit disk centered at the origin.
//
function makeDISK() {
    glBegin(GL_TRIANGLES,"DISK");
    const sides = 100;
    const dtheta = 2.0 * Math.PI / sides;
    for (let i = 0; i < 100; i++) {
        const theta = i * dtheta;
        // draw a pie slice on the disk
        glVertex3f(0.0,0.0,0.0);
        glVertex3f(Math.cos(theta),
                   Math.sin(theta),
                   0.0);
        glVertex3f(Math.cos(theta + dtheta),
                   Math.sin(theta + dtheta),
                   0.0);
    }
    glEnd();
}

// RTRI
//
// Draws an isoceles right triangle whose corner is at the origin
// and whose sides are along the +x and +y axes with unit length.
//
function RTRI() {
    glBeginEnd("RTRI");
}


// DISK
//
// Draws a unit disk centered at the origin.
//
function DISK() {
    glBeginEnd("DISK");
}

// BOX
//
// Draws a unit square with lower-left corner at the origin.
//
function BOX() {
    RTRI();
    glPushMatrix();
    glTranslatef(1.0,1.0,0.0);
    glRotatef(180.0,0.0,0.0,1.0)
    RTRI();
    glPopMatrix();
}

// RECT
//
// Draws a 1x2 rectangle (1 wide, 2 high) with lower-left corner at the
// origin.
//
function RECT() {
    BOX()
    glPushMatrix()
    glTranslatef(0.0,1.0,0.0)
    BOX()
    glPopMatrix()

}

// WINDOW, DOOR, HOUSE, TREE
//
// Below are a series of procedures that draw the elements of a
// scene containing a house, a tree, and the sun.
//
function WINDOW() {
    glColor3f(1.0,1.0,1.0)
    glPushMatrix()
    glScalef(0.2,0.2,0.2)
    BOX()
    glPopMatrix()
}
//
function DOOR() {
    glColor3f(0.6,0.6,0.8)
    glPushMatrix()
    glScalef(0.2,0.2,0.2)
    RECT()
    glPopMatrix()
}
//
function HOUSE() {
    glColor3f(0.5,0.125,0.125)

    BOX()

    glPushMatrix()
    glTranslatef(0.2,0.2,0.0)
    WINDOW()
    glPopMatrix()

    glPushMatrix()
    glTranslatef(0.2,0.6,0.0)
    WINDOW()
    glPopMatrix()

    glPushMatrix()
    glTranslatef(0.6,0.6,0.0)
    WINDOW()
    glPopMatrix()

    glPushMatrix()
    glTranslatef(0.6,0.0,0.0)
    DOOR()
    glPopMatrix()

    glColor3f(0.25,0.25,0.25)
    glPushMatrix()
    glTranslatef(0.5,1.5,0.0)
    glScalef(1.1,0.8,1.1)
    glRotatef(-135,0.0,0.0,1.0)
    RTRI()
    glPopMatrix()
}
//
function TREE() {
    glColor3f(0.5,0.5,0.25);

    glPushMatrix();

    // Trunk.
    glTranslatef(-0.5,0.0,0.0);
    BOX();
    glTranslatef(0.0,1.0,0.0);
    BOX();
    glTranslatef(0.0,1.0,0.0);
    BOX();
    glTranslatef(0.0,1.0,0.0);
    
    // Branch 1.
    glPushMatrix()
    glRotatef(gAngle1,0.0,0.0,1.0);
    glScalef(0.3,0.6,0.3);
    RTRI(); 
    glPopMatrix();
    
    // Branch 2.
    glPushMatrix()
    glTranslatef(1.0,0.0,0.0);
    glRotatef(-90.0,0.0,0.0,1.0);
    glRotatef(gAngle2,0.0,0.0,1.0);
    glScalef(0.3,0.6,0.3);
    RTRI();
    glPopMatrix();
    
    glPopMatrix();

    glColor4f(0.1,0.5,0.2,0.7);
    glPushMatrix()
    glTranslatef(0.0,3.0,0.01)
    glScalef(1.75,1.75,1.75)
    DISK()
    glPopMatrix()
}
//   
function SUN() {
    glPushMatrix();
    glTranslatef(gLocation.x, gLocation.y,-2.0);
    
    glPushMatrix();
    glScalef(0.15,0.15,0.15);
    glColor3f(1.0,0.8,0.3);
    DISK()
    glPopMatrix();
    
    glPopMatrix();
}

//
// drawHouse
//
// Draws a scene depicting a house, a yard, a tree, the sun.
//
function drawHouse() {
    SUN();

    glPushMatrix();
    
    glTranslatef(0.0,-1.5,0.0);

    // Draw the yard.
    glColor3f(0.1,0.3,0.1);
    glPushMatrix();
    glTranslatef(5.0,0.0,0.0);
    glRotatef(180,0.0,0.0,1.0);
    glScalef(10.0,10.0,10.0);
    BOX();
    glPopMatrix();

    // Draw the house.
    HOUSE();

    // Plant a happy little tree.
    glPushMatrix();
    glTranslatef(-1.0,0.0,0.0);
    glScalef(0.25,0.25,0.25);
    TREE()
    glPopMatrix();

    glPopMatrix();
}


// ***** RECURSIVE *****

//
// Functions for making and drawing the Sierpinski square,
//

// makeSquare
//
// Makes a unit square centered at the origin.
//
function makeSquare() {
    glBegin(GL_TRIANGLES, "Square");
    glVertex3f(-0.5, 0.5, 0.0);
    glVertex3f(-0.5,-0.5, 0.0);
    glVertex3f( 0.5,-0.5, 0.0);
    glVertex3f(-0.5, 0.5, 0.0);
    glVertex3f( 0.5,-0.5, 0.0);
    glVertex3f( 0.5, 0.5, 0.0);
    glEnd();
}

// drawSquareSierpinski
//
// Draws the recursive figure of a Sierpinski square.  The integer
// parameter `levels` indicates how many recursive levels should be
// shown. 0 indicates that only a solid square gets drawn.
//
function drawSquareSierpinski(levels) {
    if (levels == 0) {  
        glBeginEnd("Square");
    } else {
        glPushMatrix();
        glScalef(1/3, 1/3, 1/3);
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <=1; j++) {
                if ((i != 0) || (j != 0)) {
                    glPushMatrix();
                    glTranslatef(i,j,0);
                    drawSquareSierpinski(levels-1);
                    glPopMatrix();
                }
            }
        }
        glPopMatrix();
    }         
}


// ***** STILL LIFE *****
//
// Functions for making and drawing the still life.
//

//
// makeLight
//
// Makes a coarsely-faceted spherical object 
// It is centered at the origin and has a radius of 1.0.
//
// Name of the object is "Light"
//
function makeLight() {

    const NUM_SIDES = 8;
    
    glBegin(GL_TRIANGLES, "Light", false, false);

    let angle = 2.0*Math.PI/NUM_SIDES;
    let radius = Math.sin(angle);

    // Make the bottom polar cap for its sphere.
    for (let i=0; i<NUM_SIDES; i++) {
        glNormal3f(radius*Math.cos(i*angle),
                   Math.cos(angle),
                   radius*Math.sin(i*angle));
        glVertex3f(radius*Math.cos(i*angle),
                   Math.cos(angle),
                   radius*Math.sin(i*angle));
        glNormal3f(radius*Math.cos((i+1)*angle),
                   Math.cos(angle),
                   radius*Math.sin((i+1)*angle));
        glVertex3f(radius*Math.cos((i+1)*angle),
                   Math.cos(angle),
                   radius*Math.sin((i+1)*angle));
        glNormal3f(0,0,-1.0);
        glVertex3f(0,0,-1.0);
    }

    // Make the rest of the sphere.
    for (let i=1; i<NUM_SIDES; i++) {
        radius0 = Math.sin(i*angle);
        radius1 = Math.sin((i+1)*angle);
        height0 = Math.cos(i*angle);
        height1 = Math.cos((i+1)*angle);

        // Wrap a band at a certain latitude. Each iteration
        // makes a hinge of two triangles, advancing the band
        // for one longitude.
        for (let j=0; j<NUM_SIDES; j++) {

            // One of the triangles.
            glNormal3f(radius0*Math.cos(j*angle),
                       height0,
                       radius0*Math.sin(j*angle));
            glVertex3f(radius0*Math.cos(j*angle),
                       height0,
                       radius0*Math.sin(j*angle));
            glNormal3f(radius0*Math.cos((j+1)*angle),
                       height0,
                       radius0*Math.sin((j+1)*angle));
            glVertex3f(radius0*Math.cos((j+1)*angle),
                       height0,
                       radius0*Math.sin((j+1)*angle));
            glNormal3f(radius1*Math.cos(j*angle),
                       height1,
                       radius1*Math.sin(j*angle));
            glVertex3f(radius1*Math.cos(j*angle),
                       height1,
                       radius1*Math.sin(j*angle));

            // The other triangle.
            glNormal3f(radius0*Math.cos((j+1)*angle),
                       height0,
                       radius0*Math.sin((j+1)*angle));
            glVertex3f(radius0*Math.cos((j+1)*angle),
                       height0,
                       radius0*Math.sin((j+1)*angle));
            glNormal3f(radius1*Math.cos((j+1)*angle),
                       height1,
                       radius1*Math.sin((j+1)*angle));
            glVertex3f(radius1*Math.cos((j+1)*angle),
                       height1,
                       radius1*Math.sin((j+1)*angle));
            glNormal3f(radius1*Math.cos(j*angle),
                       height1,
                       radius1*Math.sin(j*angle));
            glVertex3f(radius1*Math.cos(j*angle),
                       height1,
                       radius1*Math.sin(j*angle));
        }
    }
    glEnd();
}

//
// makeCube
//
// Makes a cube object centered at the origin and with width of 2.0.
// Name of the object is "Cube".
//
function makeCube() {
    /*
     * This describes the facets of a cube.
     *
     * The cube is centered at the origin and the coordinates
     * of all its corner points have value +/-1.0
     */
    
    glBegin(GL_TRIANGLES,"Cube", false, false);
    
    // front
    glNormal3f( 0.0, 0.0, 1.0);
    glVertex3f(-1.0,-1.0, 1.0);
    glVertex3f( 1.0,-1.0, 1.0);
    glVertex3f( 1.0, 1.0, 1.0);
    
    glVertex3f( 1.0, 1.0, 1.0);
    glVertex3f(-1.0, 1.0, 1.0);
    glVertex3f(-1.0,-1.0, 1.0);
    
    // back
    glNormal3f( 0.0, 0.0,-1.0);
    glVertex3f(-1.0,-1.0,-1.0);
    glVertex3f( 1.0,-1.0,-1.0);
    glVertex3f( 1.0, 1.0,-1.0);
    
    glVertex3f( 1.0, 1.0,-1.0);
    glVertex3f(-1.0, 1.0,-1.0);
    glVertex3f(-1.0,-1.0,-1.0);

    // left
    glNormal3f(-1.0, 0.0, 0.0);
    glVertex3f(-1.0,-1.0,-1.0);
    glVertex3f(-1.0, 1.0,-1.0);
    glVertex3f(-1.0, 1.0, 1.0);
    
    glVertex3f(-1.0, 1.0, 1.0);
    glVertex3f(-1.0,-1.0, 1.0);
    glVertex3f(-1.0,-1.0,-1.0);
    
    // right
    glNormal3f( 1.0, 0.0, 0.0);
    glVertex3f( 1.0,-1.0,-1.0);
    glVertex3f( 1.0, 1.0,-1.0);
    glVertex3f( 1.0, 1.0, 1.0);
    
    glVertex3f( 1.0, 1.0, 1.0);
    glVertex3f( 1.0,-1.0, 1.0);
    glVertex3f( 1.0,-1.0,-1.0);
    
    // top
    glNormal3f( 0.0, 1.0, 0.0);
    glVertex3f(-1.0, 1.0,-1.0);
    glVertex3f( 1.0, 1.0,-1.0);
    glVertex3f( 1.0, 1.0, 1.0);
    
    glVertex3f( 1.0, 1.0, 1.0);
    glVertex3f(-1.0, 1.0,-1.0);
    glVertex3f(-1.0, 1.0, 1.0);

    // bottom
    glNormal3f( 0.0,-1.0, 0.0);
    glVertex3f(-1.0,-1.0,-1.0);
    glVertex3f( 1.0,-1.0, 1.0);
    glVertex3f( 1.0,-1.0,-1.0);

    glVertex3f( 1.0,-1.0, 1.0);
    glVertex3f(-1.0,-1.0, 1.0);
    glVertex3f(-1.0,-1.0,-1.0);

    //
    glEnd();
}

//
// makeWall
//
// Makes a 2x2 square centered in x-y, and sitting back at z=-1.0.
//
// The name of the object (for glBeginEnd) is "Wall".
//
function makeWall() {
    
    glBegin(GL_TRIANGLES, "Wall", false, true);
    
    // glNormal3f(0.0,0.0,1.0);
    glVertex3f(-1.0, -1.0, -1.0);
    glVertex3f( 1.0, -1.0, -1.0);
    glVertex3f( 1.0,  1.0, -1.0);

    // glNormal3f(0.0,0.0,1.0);
    glVertex3f(-1.0, -1.0, -1.0);
    glVertex3f( 1.0,  1.0, -1.0);
    glVertex3f(-1.0,  1.0, -1.0);
    glEnd();
}

//
// drawTableLeg
//
// Draw a square-sectioned table leg, sitting on the x-z plane with
// the given `width`, and centered at and rising up the y-axis at the
// specified `height`.
//
function drawTableLeg(width,height) {
      
    glPushMatrix();
    glTranslatef(0.0,height/2,0.0);  
    glScalef(width/2.0,height/2.0,width/2.0);
    glBeginEnd("Cube");
    glPopMatrix();
}

//
// drawTable
//
// Lays out a square table with the given `width`/depth, at the given
// `height`, whose legs and surface are the given `thickness`. The
// table legs stand on the x-z plane.
//
function drawTable(width,height,thickness) {

    let cornerDistance = width/2.0 - thickness/2.0
    glPushMatrix();
    glTranslatef(-cornerDistance, 0.0,-cornerDistance);
    drawTableLeg(thickness,height-thickness);
    glPopMatrix();
    
    glPushMatrix();
    glTranslatef(-cornerDistance, 0.0,cornerDistance);
    drawTableLeg(thickness,height-thickness);
    glPopMatrix();
    
    glPushMatrix();
    glTranslatef(cornerDistance, 0.0,cornerDistance);
    drawTableLeg(thickness,height-thickness);
    glPopMatrix();
    
    glPushMatrix();
    glTranslatef(cornerDistance, 0.0,-cornerDistance);
    drawTableLeg(thickness,height-thickness);
    glPopMatrix();
    
    glPushMatrix();
    glTranslatef(0.0,height-thickness/2.0,0.0);
    glScalef(width/2.0,thickness/2.0,width/2.0);
    glBeginEnd("Cube");
    glPopMatrix();
}

//
// drawRoom
//
// Lays out the walls, ceiling, and floor of a 2x2x2 room centered
// at the origin. The left and right walls are red and blue. The other
// three surfaces are white.
//
function drawRoom() {
    glPushMatrix()
    glTranslatef(0.0,1.0,0.0);
    
    glPushMatrix();
    glColor3f(0.8,0.8,0.8);
    glTranslatef(0.0,0.0,0.0);
    glBeginEnd("Wall");
    glPopMatrix();
    
    glPushMatrix();
    glRotatef(90,0.0,1.0,0.0);
    glColor3f(0.8,0.6,0.6);
    glBeginEnd("Wall");
    glPopMatrix();

    glPushMatrix();
    glRotatef(-90,0.0,1.0,0.0);
    glColor3f(0.6,0.6,0.8);
    glBeginEnd("Wall");
    glPopMatrix();
    
    glPushMatrix();
    glRotatef(90,1.0,0.0,0.0);
    glColor3f(0.8,0.8,0.8);
    glBeginEnd("Wall");
    glPopMatrix();
    
    glPushMatrix();
    glRotatef(-90,1.0,0.0,0.0);
    glColor3f(0.8,0.8,0.8);
    glBeginEnd("Wall");
    glPopMatrix();

    glPopMatrix();
}


// drawStillLife
//
// Function that can be used to draw the still life of a table sitting
// in a room with objects sitting on it.
//
function drawStillLife() {

    drawRoom();

}

// ***** ANIMATION *****

//
// Functions for making and drawing the waving arm animation.
//

//
// makeWireCube
//
// Makes a wireframe cube object whose sides are unit-lengthed
// that is centered at the origin.
//
function makeWireCube() {
    glBegin(GL_LINES, "WireCube");

    // front-back
    glVertex3f( 0.5, 0.5, 0.5);
    glVertex3f( 0.5, 0.5,-0.5);
    
    glVertex3f( 0.5,-0.5, 0.5);
    glVertex3f( 0.5,-0.5,-0.5);
    
    glVertex3f(-0.5,-0.5, 0.5);
    glVertex3f(-0.5,-0.5,-0.5);
    
    glVertex3f(-0.5, 0.5, 0.5);
    glVertex3f(-0.5, 0.5,-0.5);


    // side-side
    glVertex3f(-0.5, 0.5, 0.5);
    glVertex3f( 0.5, 0.5, 0.5);
    
    glVertex3f(-0.5, 0.5,-0.5);
    glVertex3f( 0.5, 0.5,-0.5);
    
    glVertex3f(-0.5,-0.5,-0.5);
    glVertex3f( 0.5,-0.5,-0.5);
    
    glVertex3f(-0.5,-0.5, 0.5);
    glVertex3f( 0.5,-0.5, 0.5);


    // down-up
    glVertex3f( 0.5,-0.5, 0.5);
    glVertex3f( 0.5, 0.5, 0.5);
    
    glVertex3f( 0.5,-0.5,-0.5);
    glVertex3f( 0.5, 0.5,-0.5);
    
    glVertex3f(-0.5,-0.5,-0.5);
    glVertex3f(-0.5, 0.5,-0.5);
    
    glVertex3f(-0.5,-0.5, 0.5);
    glVertex3f(-0.5, 0.5, 0.5);
    
    glEnd();
}

//
// drawWavingArm
//
// Draws an arm and hand that waves according to the values of the
// globals `gShoulder`, `gElbow`, and `gWrist`. These globals give the
// angle in radians for each of these joints. The three globals are
// updated by a certain change in angle when this function executes,
// though only if `gAnimate` is set to `true`.
//
function drawWavingArm() {
    if (gAnimate) {
        gShoulder += 7.5/180.0 * Math.PI;
        gElbow += 7.5/180.0 * Math.PI;
        gWrist += 15/180.0 * Math.PI;
    }
    
    const length = 0.8;
    const width = 0.25;
    
    const shoulderAngle = 20.0 * Math.cos(gShoulder) + 20;
    const elbowAngle = 40.0 * Math.sin(gElbow) + 40.0;
    const wristAngle = -75.0 * Math.sin(gWrist);

    glColor3f(0.75,0.85,0.5)

    glPushMatrix();
    glScalef(1.5,1.5,1.5);
    glTranslatef(-length * 1.5, -length * 1.25, 0.0);
    glRotatef(shoulderAngle, 0.0, 0.0, 1.0);

    // Upper arm.
    glPushMatrix();
    glTranslatef(length/2, 0.0, 0.0);
    glScalef(length, width, width);
    glBeginEnd("WireCube");
    glPopMatrix();

    glTranslatef(length, 0.0, 0.0);
    glRotatef(elbowAngle, 0.0, 0.0, 1.0);

    // Forearm.
    glPushMatrix();
    glTranslatef(1.5 * length/2, 0.0, 0.0);
    glScalef(1.4 * length, 0.8 * width, 0.8 * width);
    glBeginEnd("WireCube");
    glPopMatrix();

    glTranslatef(1.5 * length, 0.0, 0.0);
    glRotatef(wristAngle, 0.0, 0.0, 1.0);

    // Palm/hand.
    glPushMatrix();
    glTranslatef(width, 0.0, 0.0);
    glPushMatrix();
    glScalef(2*width, width, width/2);
    glBeginEnd("WireCube");
    glPopMatrix();

    // Fingers
    for (let f = 0; f < 4; f++) {
        glPushMatrix();
        glRotatef(f*15.0-15.0, 0.0, 0.0, 1.0);
        glTranslatef(width*2,0.0,0.0);
        glScalef(width*1.5,width/4,width/4);
        glBeginEnd("WireCube");
        glPopMatrix();
    }
    // Thumb
    glPushMatrix();
    glRotatef(90, 0.0, 0.0, 1.0);
    glTranslatef(width,0.0,0.0);
    glScalef(width,width/3,width/3);
    glBeginEnd("WireCube");
    glPopMatrix();
    
    glPopMatrix();
    glPopMatrix();
}

// ***** DRAW *****

//
// Function that displays the user-chosen scene or figure.
//
    
function draw() {
    /*
     * Issue GL calls to draw the requested graphics.
     */

    // Clear the rendering information.
    if (gScene == "scene") {
        glClearColor(0.8, 0.9, 1.0, 1.0);        
    } else {
        glClearColor(0.2, 0.25, 0.3, 1.0);
    }
    glClearDepth(1.0);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)
    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

    // Set up the projection matrix.
    //
    // We have perspective projection for the still life and for
    // the 3-D animation (though it can be set to orthographic
    // by flipping the global `gPerspective`).
    //
    // We have orthographic perspective for the other two scenes,
    // which are 2-D.
    //
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    let w = gLastw;
    let h = gLasth;
    if (gScene == "still-life" && gPerspective || gScene == "animation") {
        if (w > h) {
            glFrustum(-w/h*2.0, w/h*2.0, -2.0, 2.0, 2.0, 6.0);
        } else {
            glFrustum(-2.0, 2.0, -h/w * 2.0, h/w * 2.0, 2.0, 6.0);
        }
    } else if (gScene == "still-life" && !gPerspective) {
        if (w > h) {
            glOrtho(-w/h*2.0, w/h*2.0, -2.0, 2.0, 2.0, 6.0);
        } else {
            glOrtho(-2.0, 2.0, -h/w * 2.0, h/w * 2.0, 2.0, 6.0);
        }
    } else {
        if (w > h) {
            glOrtho(-w/h*2.0, w/h*2.0, -2.0, 2.0, -2.0, 2.0);
        } else {
            glOrtho(-2.0, 2.0, -h/w * 2.0, h/w * 2.0, -2.0, 2.0);
        }
    }        

    //
    // Clear the transformation stack.
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();


    //
    // Call the appropriate "draw..." function.
    //
    
    if (gScene == "scene") {

        // The coordinate frame for this 2D scene has a lower left corner
        // at (-2.5,-2) and an upper right corner at (2.5,2). The depth
        // values (i.e the z values) range between -2 and 2.
        //
        drawHouse();
        
    } else if (gScene == "recursive") {

        // The coordinate frame for this 2D scene has a lower left corner
        // at (-2.5,-2) and an upper right corner at (2.5,2). The depth
        // values (i.e the z values) range between -2 and 2.
        //
        glPushMatrix();
        glScalef(3.0,3.0,3.0);
        glColor3f(0.6, 0.4, 0.65);
        drawSquareSierpinski(gRecursiveLevels);
        glPopMatrix();
        
    } else if (gScene == "still-life") {

        if (gAnimate) {
            gLightTime += gLightRate;
        }
        // Have the light rock between -2 and -6.
        let arcPosition = Math.sin(gLightTime)
        let arcX = gLightRadius * Math.sin(gLightHalfArc * arcPosition);
        let arcY = 2.0 - gLightRadius * Math.cos(gLightHalfArc * arcPosition);

        if (gAnimate) {

            //
            // If in animation mode, show the swinging light on the
            // end of a cord.
            //

            // Show a black cord swinging from the ceiling.
            glPushMatrix();
            glColor3f(0.0,0.0,0.0);
            glTranslatef(0.0,2.0,-2.0+gLightDepth);
            glRotatef(arcPosition*gLightHalfArc*180.0/Math.PI,0.0,0.0,1.0);
            glScalef(0.01,gLightRadius-0.07,0.01);
            glTranslatef(0.0,-0.5,0.0);
            glBeginEnd("WireCube");
            glPopMatrix();

            // Show where the cord meets the ceiling.
            glPushMatrix();
            glColor3f(0.0,0.0,0.0);
            glTranslatef(0.0,2.0,-2.0+gLightDepth);
            glScalef(0.07,0.002,0.07);
            glBeginEnd("Light");
            glPopMatrix();

            // Show a warm-colored light bulb at the end of the cord.
            glPushMatrix();
            glColor3f(0.9,0.9,0.7);
            glTranslatef(arcX,arcY,-2.0+gLightDepth);
            glScalef(0.07,0.07,0.07);
            glBeginEnd("Light");
            glPopMatrix();
        }

        //
        // Light up the scene with three lights using Phong shading.
        //
        glEnable(GL_LIGHTING);

        // Ambient light along with a diffuse light shining from above
        // the viewer.
        glEnable(GL_LIGHT0);
        glLightfv(GL_LIGHT0, GL_AMBIENT, [0.5,0.5,0.5]);
        glLightfv(GL_LIGHT0, GL_DIFFUSE, [0.5,0.5,0.5]);
        glLightfv(GL_LIGHT0, GL_SPECULAR, [0.0,0.0,0.0]);
        glLightfv(GL_LIGHT0, GL_POSITION, [0.0, 2.0, 1.0]);

        // A light that swings from the ceiling in front of the viewer,
        // with diffuse and specular components.
        //
        glEnable(GL_LIGHT1);
        glLightfv(GL_LIGHT1, GL_AMBIENT, [0.0,0.0,0.0]);
        glLightfv(GL_LIGHT1, GL_DIFFUSE, [0.1,0.1,0.1]);
        glLightfv(GL_LIGHT1, GL_SPECULAR, [0.3,0.3,0.2]);
        glLightfv(GL_LIGHT1, GL_POSITION, [arcX, arcY, -2.0+gLightDepth]);

        // Additional diffuse light that shines from below the viewer. 
        // 
        glEnable(GL_LIGHT2);
        glLightfv(GL_LIGHT2, GL_AMBIENT, [0.0,0.0,0.0]);
        glLightfv(GL_LIGHT2, GL_DIFFUSE, [0.2,0.2,0.2]);
        glLightfv(GL_LIGHT2, GL_SPECULAR, [0.0,0.0,0.0]);
        glLightfv(GL_LIGHT2, GL_POSITION, [0.0,-1.0,0.0]);

        /*
         * Sets the coordinate frame so that the room containing the
         * still life is specified as a 2 x 2 x 2 cube centered at (0,0,0)
         *
         */ 
        glPushMatrix();
        glTranslatef(0.0,-2.0,-4.0);
        glScalef(2.0,2.0,2.0);
        //
        drawStillLife();
        //
        glPopMatrix();

        //
        // We're done drawing so turn off the Phong shading. 
        //
        glDisable(GL_LIGHTING);
        glDisable(GL_LIGHT0);
        glDisable(GL_LIGHT1);
        
    } else if (gScene == "animation") {
        
        glPushMatrix();
        
        // Push the scene back so that the animation's coordinate frame
        // is a 4 x 4 x 4 cube centered at (0,0,0).
        glTranslatef(0.0,0.0,-4.0);
        
        // Reorient according to the "trackball" motion of a mouse drag.
        gOrientation.glRotatef();
        
        drawWavingArm();
        
        glPopMatrix();

    }
    // Render the scene.
    glFlush();
}


// ***** INTERACTION *****

//
// Functions for handling mouse movement and keypresses.
//

//
// Functions for responding to app controls.
//

function setLevel(level) {
    gRecursiveLevels = level;
    glutPostRedisplay();
}

function setAngle1(angle) {
    gAngle1 = angle;
    glutPostRedisplay();
}

function setAngle2(angle) {
    gAngle2 = angle;
    glutPostRedisplay();
}

function handleKey(key, x, y) {
    /* 
     * Handle a keypress.
     */

    // Handle the s key.
    if (key == 's') {
        gScene = "scene";
        // Redraw.
        glutPostRedisplay();
    }
    
    // Handle the r key.
    if (key == 'r') {
        gScene = "recursive";
        // Redraw.
        glutPostRedisplay();
    }
    
    // Handle the l key.
    if (key == 'l') {
        if (gScene == "still-life") {
            gAnimate = !gAnimate;
        } else {
            gScene = "still-life";
            gAnimate = false;
        }
        // Redraw.
        glutPostRedisplay();
    }

    // Handle the v key.
    if (key == 'v') {
        if (gScene == "still-life") {
            gPerspective = !gPerspective;
        }
        // Redraw.
        glutPostRedisplay();
    }
    
    // Handle the a key.
    if (key == 'a') {
        if (gScene == "animation") {
            gAnimate = !gAnimate;
        } else {
            gScene = "animation";
            gAnimate = true;
        }

        // Redraw.
        glutPostRedisplay();
    }
    
}

function worldCoords(mousex, mousey) {
    /*
     * Compute the world/scene coordinates associated with
     * where the mouse was clicked.
     */

    const pj = mat4.create();
    glGetFloatv(GL_PROJECTION_MATRIX,pj);
    const pj_inv = mat4.create();
    mat4.invert(pj_inv,pj);
    const vp = [0,0,0,0];
    glGetIntegerv(GL_VIEWPORT,vp);
    const mousecoords = vec4.fromValues(2.0*mousex/vp[2]-1.0,
                                        1.0-2.0*mousey/vp[3],
                                        0.0, 1.0);
    vec4.transformMat4(location,mousecoords,pj_inv);
    return {x:location[0], y:location[1]};
}    

function handleMouseClick(button, state, x, y) {
    /*
     * Records the location of a mouse click in 
     * world/scene coordinates.
     */

    // Start tracking the mouse for trackball motion.
    gMouseStart  = worldCoords(x,y);
    if (state == GLUT_DOWN) {
        gMouseDrag = true;
    } else {
        gMouseDrag = false;
    }

    if (gScene == "scene") {
        gLocation = gMouseStart;
    }
    
    glutPostRedisplay()
}

function handleMouseMotion(x, y) {
    /*
     * Reorients the object based on the movement of a mouse drag.
     *
     * Uses last and current location of mouse to compute a trackball
     * rotation. This gets stored in the quaternion orientation.
     *
     */
    
    // Capture mouse's position.
    mouseNow = worldCoords(x,y)

    // Update object/light orientation based on movement.
    dx = mouseNow.x - gMouseStart.x;
    dy = mouseNow.y - gMouseStart.y;

    // Ready state for next mouse move.
    gMouseStart = mouseNow;

    if (gScene == "animation") {
        axis = (new Vector3d(-dy,dx,0.0)).unit()
        angle = Math.asin(Math.min(Math.sqrt(dx*dx+dy*dy),1.0))
        gOrientation = quatClass.for_rotation(angle,axis).times(gOrientation);
    }
    if (gScene == "scene") {
        gLocation = gMouseStart;
    }
    
    // Update window.
    glutPostRedisplay()
}

// ***** DRIVER *****

//
// Application driver and auxilliary functions.
//

function ortho(w,h) {
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    gLastw = w;
    gLasth = h;
}

function resizeWindow(w, h) {
    /*
     * Register a window resize by changing the viewport.
     */
    glViewport(0, 0, w, h);
    ortho(w,h);
}

function main() {
    glutInitDisplayMode(GLUT_SINGLE | GLUT_RGB | GLUT_DEPTH);
    glutInitWindowPosition(0, 20);
    glutInitWindowSize(800, 640);
    glutCreateWindow('A scene.');

    makeRTRI();
    makeDISK();
    makeSquare();
    makeWireCube();
    makeCube();
    makeLight();
    makeWall();

    ortho(800,640);

    // Register interaction callbacks.
    glutKeyboardFunc(handleKey)
    glutReshapeFunc(resizeWindow)
    glutMouseFunc(handleMouseClick)
    glutMotionFunc(handleMouseMotion)

    glutDisplayFunc(draw);
    glutMainLoop();
}

glRun(main, true);
