//
// segment-intersect.js
//
// Author: Jim Fix
// CSCI 385: Computer Graphics, Reed College, Fall 2024
//
// Editor that allows user to place two 2D line segments and computes
// their intersection.
//

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

   SOME CONFIGURATION GLOBALS

*/

//
// Width/height of the canvas in pixels.
//
const gHeight = 600;
const gWidth  = 600;  
//
const ENDPOINT_COLOR  = {r:0.800, g:0.830, b:0.860}; // Near white.
const INTERSECT_COLOR = {r:0.950, g:0.900, b:0.500}; // Yellow.
const SEGMENT1_COLOR  = {r:0.325, g:0.575, b:0.675}; // Chalk blue.
const SEGMENT2_COLOR  = {r:0.825, g:0.475, b:0.175}; // Chalk orange.
//
const LIGHT_POSITION = new Vector3d(-1.5, 0.875, 10.0);
//
let gStart1 = new Point3d(-0.5,0.5,0.0);
let gEnd1   = new Point3d(0.5,-0.75,0.0);
let gStart2 = new Point3d(0.75,0.9,0.0);
let gEnd2   = new Point3d(-0.65,-0.6,0.0);


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   
   OBJECT LIBRARY
   
*/
  
let gObjectsLibrary = new Map();

function makeObjectsLibrary(objectTexts) {
    
    /*
     * Processes the Wavefront .OBJ file information stored in the
     * name->(text,bool) `objectTexts`. It builds a `CGObject`
     * instance for each one, putting each in `objects`. It then
     * creates two `glBeginEnd` renderings for each:
     *
     *  "object": is the triangular facets of the object,
     *            using one surface material.
     *
     *  "object-wireframe": description of all the edges of the faceted
     *               object.
     *
     */

    for (const [name, [text,flip]] of objectTexts.entries()) {
        //
        // name: the root name of the .OBJ file.
        // text: the text contents of the .OBJ file.
        // flip: true/false for reorienting the axes. See CGOobject.read.
        //
        
        console.log("Compiling " + name + ".obj info...");
        
        //
        // Build a cloneable object from the .obj text.
        const object = new CGObject();
        object.buildFromOBJ(text,flip);
        console.log("...",object.vertices.length,"vertices.")
        gObjectsLibrary.set(name, object);

        //
        // Make faceted object.
        glBegin(GL_TRIANGLES, name);
        object.compileSurface() // a series of trios of glVertex3f
        glEnd();
        
        //
        // Make wireframe.
        glBegin(GL_LINES, name+"-wireframe");
        object.compileMesh() // a series of pairs of glVertex3f
        glEnd();
    }
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   
   SUPPORT FOR MOVING ENDPOINTS

*/

const NONE_SELECTED   = 0;
const START1_SELECTED = 1;
const END1_SELECTED   = 2;
const START2_SELECTED = 3;
const END2_SELECTED   = 4;

const SELECT_DISTANCE = 0.1;

let gPlacing    = NONE_SELECTED;

function selectEndpoint(mouseXY) {
    /*
     * Chooses which placement the user wants to edit, given a
     * location of the mouse pointer.
     */
    
    let click = new Point3d(mouseXY.x, mouseXY.y,0.0);

    //
    // See if we clicked near some item.
    min_distance = click.dist(gStart1);
    gPlacing = START1_SELECTED;
    distance = click.dist(gEnd1);
    if (distance < min_distance) {
        min_distance = distance;
        gPlacing = END1_SELECTED;
    }
    distance = click.dist(gStart2);
    if (distance < min_distance) {
        min_distance = distance;
        gPlacing = START2_SELECTED;
    }
    distance = click.dist(gEnd2);
    if (distance < min_distance) {
        min_distance = distance;
        gPlacing = END2_SELECTED;
    }
    if (min_distance > SELECT_DISTANCE) {
        gPlacing = NONE_SELECTED;
    }
}

function maybeMoveEndpoint(mouseLocation) {
    if (gPlacing == START1_SELECTED) {
        gStart1 = mouseLocation;
    } else if (gPlacing == END1_SELECTED) {
        gEnd1 = mouseLocation;
    } else if (gPlacing == START2_SELECTED) {
        gStart2 = mouseLocation;
    } else if (gPlacing == END2_SELECTED) {
        gEnd2 = mouseLocation;
    }
    glutPostRedisplay();
}
    
function handlePlacement(mouseXY, down, drag) {
    /*
     * Handles a mouse click with the button pressed down or
     * released, and also a mouse drag with the button pressed or
     * not, and whenever the mouse movement should be interpreted
     * for placing cloned objects within the scene.
     *
     * When the mouse is first clicked, the closest endpoint nearby,
     * if close enough to the click, gets selected. This puts the GUI
     * in SELECTED mode.
     *
     */
    
    const mouseLocation = new Point3d(mouseXY.x, mouseXY.y, 0.0);

    if (down && !drag) { 

        //
        // Just clicked the mouse button...
        //
        selectEndpoint(mouseLocation);
        maybeMoveEndpoint(mouseLocation);
        
    } else if (!down && !drag) {
        
        //
        // Just released the mouse button...
        //
        maybeMoveEndpoint(mouseLocation);
        gPlacing = NONE_SELECTED;
        
    } else if (down && drag) {
        
        //
        // Dragging the mouse (with mouse button pressed)...
        //
        maybeMoveEndpoint(mouseLocation);
    }
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   
   MOUSE HANDLERS

*/

function mouseToSceneCoords(mousex, mousey) {
    /*
     * Convert mouse screen coordinates to scene coordinates.
     */
    
    //
    // A hack to adjust for the corner of the canvas.  There is a
    // javascript way of handling this probably.
    //
    mousex -= 10;
    mousey -= 10;
    
    //
    // Use the inverse of the GL_PROJECTION matrix to map from screen
    // coordinates to our scene coordinates.
    //
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
    //
    return {x:location[0], y:location[1]};
}    

function handleMouseClick(button, state, x, y) {
    
    /*
     * Records the location of a mouse click in object world coordinates.
     */

    const mouseXY = mouseToSceneCoords(x,y);

    if (state == GLUT_DOWN && button == GLUT_LEFT_BUTTON) {
        handlePlacement(mouseXY, true, false);
    } else if (state == GLUT_UP) {
        handlePlacement(mouseXY, false, false);
    }
}

function handleMouseDrag(x, y) {
    /*
     * Handle the mouse movement resulting from a drag.
     */
    const mouseXY = mouseToSceneCoords(x,y);
    handlePlacement(mouseXY, true, true);
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   
   DRAWING ROUTINES

*/

function drawEndpoint(location,color) {
    glPushMatrix();
    glTranslatef(location.x, location.y, 0.0);
    glScalef(0.1, 0.1, 0.1);
    glColor3f(color.r, color.g, color.b);
    glBeginEnd("soccer")
    glPopMatrix();
}

function drawIntersection() {
    const p1 = new Point2d(gStart1.x,gStart1.y);
    const p2 = new Point2d(gEnd1.x,gEnd1.y);
    const q1 = new Point2d(gStart2.x,gStart2.y);
    const q2 = new Point2d(gEnd2.x,gEnd2.y);
    const meet = segmentsIntersect(p1,p2,q1,q2);
    if (meet !== null) {
        const r = p1.combo(meet,p2);
        drawEndpoint(new Point3d(r.x,r.y,0.0), INTERSECT_COLOR);
    }
}

function drawSegment(start,end,color) {
    const heading = end.minus(start).unit();
    const length = end.dist(start);
    const angle = Math.atan2(heading.dy, heading.dx) * 180.0 / Math.PI;

    // Draw the line.
    //
    // Perform the transformations.
    glPushMatrix();
    glTranslatef(start.x, start.y, 0.0);
    glRotatef(angle, 0.0, 0.0, 1.0);
    glRotatef(90,0.0,1.0,0.0);
    //
    // Scale a brick wireframe to be the length of the path step.
    glScalef(0.05, 0.05, length);
    glColor3f(color.r, color.g, color.b);
    glBeginEnd("SEGMENT")
    glPopMatrix();

    drawEndpoint(start,ENDPOINT_COLOR);
    drawEndpoint(end,ENDPOINT_COLOR);
}
        
function drawSegments() {

    /*
     * Renders the line segments and their intersection.
     *
     * Uses Phong shading (set by GL_LIGHTING) illuminated by a single
     * light, GL_LIGHT0.
     *
     */

    //
    // Turn on lighting.
    glEnable(GL_LIGHTING);
    glEnable(GL_LIGHT0);
    glLightfv(GL_LIGHT0, GL_POSITION, LIGHT_POSITION.components());

    drawSegment(gStart1, gEnd1, SEGMENT1_COLOR);
    drawSegment(gStart2, gEnd2, SEGMENT2_COLOR);
    drawIntersection();

    glDisable(GL_LIGHT0);
    glDisable(GL_LIGHTING);
}

function draw() {
    /*
     * Issue GL calls to draw the scene.
     */

    //
    // Clear the rendering information.
    glClearColor(0.2,0.2,0.3);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    glEnable(GL_DEPTH_TEST);
    //
    // Set up the scene coordinates.
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    glViewport(0, 0, gWidth, gHeight);
    glOrtho(-1.0, 1.0, -1.0, 1.0, -10.0, 10.0);
    //
    // Clear the transformation stack.
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
    //
    // Draw all the objects in the scene.
    drawSegments();
    
    glFlush();
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   GUI OBJECT DEFINTIONS FOR OPENGL
*/
function makeSegment() {
    const numSides = 24;
    const dangle = 2.0 * Math.PI / numSides;
    glBegin(GL_LINES, "SEGMENT");
    let angle = 0.0;
    for (let i=0; i<numSides; i++) {
        //
        glVertex3f(Math.cos(angle), Math.sin(angle), 0.0);
        glVertex3f(Math.cos(angle), Math.sin(angle), 1.0);
        //
        glVertex3f(Math.cos(angle), Math.sin(angle), 0.0);
        glVertex3f(Math.cos(angle+dangle), Math.sin(angle+dangle), 0.0);
        //
        glVertex3f(Math.cos(angle), Math.sin(angle), 1.0);
        glVertex3f(Math.cos(angle+dangle), Math.sin(angle+dangle), 1.0);
        //
        angle += dangle;
    }
    glEnd();
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   THE MAIN PROGRAM 
*/
function editor(objectTexts) {
    /*
     * The main procedure, sets up OPENGL and loads the object library.
     */

    // set up GL/UT, its canvas, and other components.
    glutInitDisplayMode(GLUT_SINGLE | GLUT_RGB | GLUT_DEPTH);
    glutInitWindowPosition(0, 0);
    glutInitWindowSize(gWidth, gHeight);
    glutCreateWindow('segment intersection tester')
    
    // Build the renderable objects.
    makeObjectsLibrary(objectTexts);
    
    // Editor objects.
    makeSegment();

    // Register interaction callbacks.
    glutDisplayFunc(draw);
    glutMouseFunc(handleMouseClick)
    glutMotionFunc(handleMouseDrag)
    
    // Go!
    glutMainLoop();

    return 0;
}

//
// Read all the .obj files specified, embedded in the HTML.
//
let objectTextLibrary = new Map();
for (let object of editorLibrary) {
    const objectName = object[0];
    const objectFlip = object[1];
    const objectFileName = objectName + ".obj";
    const objectFileText = document.getElementById(objectFileName).text;
    objectTextLibrary.set(objectName,[objectFileText,objectFlip]);
}  

glRun(() => { editor(objectTextLibrary); }, true);

