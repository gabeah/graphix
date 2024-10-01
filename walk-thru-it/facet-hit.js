//
// facet-hit.js
//
// Author: Jim Fix
// CSCI 385: Computer Graphics, Reed College, Fall 2024
//
// Editor that allows user to place a 3D facet and shoot a ray through
// it.
//

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * SOME CONFIGURATION GLOBALS
 *
*/

//
// Width/height of the canvas in pixels.
//
const gHeight = 600;
const gWidth  = 600;  
//
const SELECTED_COLOR  = {r:0.800, g:0.830, b:0.860}; // Near white.
const ENDPOINT_COLOR  = {r:0.500, g:0.530, b:0.860}; // Blue-y
const INTERSECT_COLOR = {r:0.950, g:0.900, b:0.500}; // Yellow.
const SEGMENT_COLOR   = {r:0.325, g:0.575, b:0.675}; // Chalk blue.
const FACET_COLOR     = {r:0.825, g:0.475, b:0.175}; // Chalk orange.
const RAY_COLOR       = {r:0.125, g:0.875, b:0.275}; // Chalk green.
//
const LIGHT_POSITION = new Vector3d(-1.5, 0.875, 10.0);
//
const ARROWHEAD_LENGTH = 0.1;
const CONTROL_POINT_RADIUS = 0.05;

//

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 *  Globals and constants for control point placement.
 *
 */ 
let gPoint1 = new Point3d(-0.5,0.5,0.1);
let gPoint2 = new Point3d(0.5,-0.75,-0.1);
let gPoint3 = new Point3d(0.75,0.6,0.2);
let gSource = new Point3d(0.0,0.0,0.5);
let gTarget = new Point3d(0.2,0.2,-0.5);
//
const NONE_SELECTED   = 0;
const POINT1_SELECTED = 1;
const POINT2_SELECTED = 2;
const POINT3_SELECTED = 3;
const SOURCE_SELECTED = 4;
const TARGET_SELECTED = 5;
//
const SELECT_DISTANCE = 0.1;
//
let gSelectedPoint    = NONE_SELECTED;

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 *  Globals for the trackball viewing controls.
 *
 */ 
let gOrientation = quatClass.for_rotation(0.0, new Vector3d(1.0,0.0,0.0));
let gMouseStart  = {x: 0.0, y: 0.0};
let gReorienting = false;

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
   
   SUPPORT FOR MOVING CONTROL POINTS

*/

function mouseToRay(mousex, mousey) {
    /*
     * Convert mouse screen coordinates to the coordinates of a ray
     * shooting into the scene according to that mouse location.
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
    glGetFloatv(GL_MODELVIEW_MATRIX,pj);
    const pj_inv = mat4.create();
    mat4.invert(pj_inv,pj);
    //
    const vp = [0,0,0,0];
    glGetIntegerv(GL_VIEWPORT,vp);
    const x = 2.0*mousex/vp[2]-1.0 ;
    const y = 1.0-2.0*mousey/vp[3]
    //
    const aboveCoords = vec4.fromValues(x,y,-1.0,1.0);
    let above = vec4.create();
    vec4.transformMat4(above,aboveCoords,pj_inv);
    //
    const belowCoords = vec4.fromValues(x,y,1.0,1.0);
    let below = vec4.create();
    vec4.transformMat4(below,belowCoords,pj_inv);
    //
    return {above:new Point3d(above[0],above[1],above[2]),
            below:new Point3d(below[0],below[1],below[2])};
}    

function placeOnMouseRay(mousex, mousey, somePoint) {
    /*
     * Finds the point on a ray, defined by the mouse click, that's
     * closest to the provided edit point.
     */
    const ray = mouseToRay(mousex, mousey);
    const mouse1 = ray.above;
    const mouse2 = ray.below;
    let v12 = mouse2.minus(mouse1);
    let u12 = v12.unit();
    let l12 = v12.norm();
    return mouse1.plus(u12.times(somePoint.minus(mouse1).dot(u12)));
}
    
function distanceFromMouseRay(mousex, mousey, editablePoint) {
    /*
     * Finds the distance between the point and a ray shot through
     * the scene according to a mouse click.
     */
    const closest = placeOnMouseRay(mousex, mousey, editablePoint)
    return editablePoint.dist(closest);
}

function selectControlPoint(mousex,mousey) {
    /*
     * Chooses a control point that's closest to a ray shot through
     * the scene defined by the mouse click. If none are close
     * enough, then no point is selected.
     */

    gSelectedPoint = NONE_SELECTED;
    min_distance = SELECT_DISTANCE;
    
    let distance = distanceFromMouseRay(mousex,mousey,gPoint1);
    if (distance < min_distance) {
        min_distance = distance;
        gSelectedPoint = POINT1_SELECTED;
    }
    
    distance = distanceFromMouseRay(mousex,mousey,gPoint2);
    if (distance < min_distance) {
        min_distance = distance;
        gSelectedPoint = POINT2_SELECTED;
    }
    
    distance = distanceFromMouseRay(mousex,mousey,gPoint3);
    if (distance < min_distance) {
        min_distance = distance;
        gSelectedPoint = POINT3_SELECTED;
    }
    
    distance = distanceFromMouseRay(mousex,mousey,gSource);
    if (distance < min_distance) {
        min_distance = distance;
        gSelectedPoint = SOURCE_SELECTED;
    }
    
    distance = distanceFromMouseRay(mousex,mousey,gTarget);
    if (distance < min_distance) {
        min_distance = distance;
        gSelectedPoint = TARGET_SELECTED;
    }
}

function moveControlPoint(mousex, mousey) {
    /*
     * Moves the selected control point to the closest
     * location along the ray through the scene defined
     * by the mouse click.
     */
    
    if (gSelectedPoint == POINT1_SELECTED) {
        gPoint1 = placeOnMouseRay(mousex,mousey,gPoint1);
    } else if (gSelectedPoint == POINT2_SELECTED) {
        gPoint2 = placeOnMouseRay(mousex,mousey,gPoint2);
    } else if (gSelectedPoint == POINT3_SELECTED) {
        gPoint3 = placeOnMouseRay(mousex,mousey,gPoint3);
    } else if (gSelectedPoint == SOURCE_SELECTED) {
        gSource = placeOnMouseRay(mousex,mousey,gSource);
    } else if (gSelectedPoint == TARGET_SELECTED) {
        gTarget = placeOnMouseRay(mousex,mousey,gTarget);
    }
    glutPostRedisplay();
}
    
function handleEdit(mousex, mousey, down, drag) {
    /*
     * Handles mouse edit of control points.
     * When first clicked, the closest endpoint gets selected.
     * The closeness is determined by treating the mouse click
     * as a ray shot into the scene.
     */
    
    if (down && !drag) { 
        // Just clicked the mouse button...
        selectControlPoint(mousex, mousey);
        moveControlPoint(mousex, mousey);
        
    } else if (!down && !drag) {
        // Just released the mouse button...
        moveControlPoint(mousex, mousey);
        gSelectedPoint = NONE_SELECTED;
        
    } else if (down && drag) {
        // Dragging the mouse (with mouse button pressed)...
        moveControlPoint(mousex, mousey);
        
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
    const locCoords = vec4.fromValues(2.0*mousex/vp[2]-1.0,
                                        1.0-2.0*mousey/vp[3],
                                        0.0, 1.0);
    let loc = vec4.create();
    vec4.transformMat4(loc,locCoords,pj_inv);
    //
    return new Point3d(loc[0],loc[1],loc[2]);
}    

function handleReorient(mouseNow) {

    // Update object/light orientation based on movement.
    const dx = mouseNow.x - gMouseStart.x;
    const dy = mouseNow.y - gMouseStart.y;
    axis = (new Vector3d(-dy,dx,0.0)).unit()
    angle = Math.asin(Math.min(Math.sqrt(dx*dx+dy*dy),1.0))
    gOrientation = quatClass.for_rotation(angle,axis).times(gOrientation);

    // Ready state for next mouse move.
    gMouseStart = mouseNow;
    
    // Update window.
    glutPostRedisplay();
}

function handleMouseClick(button, state, x, y) {
    /*
     * Handle a mouse click.
     */
    
    if (state == GLUT_DOWN && button == GLUT_LEFT_BUTTON) {
        handleEdit(x,y,true,false);
    } else if (state == GLUT_UP && button == GLUT_LEFT_BUTTON) {
        handleEdit(x,y,false,false);
    } else if (state == GLUT_DOWN && button == GLUT_MIDDLE_BUTTON) {
        gReorienting = true;
        const mouseXYZ = mouseToSceneCoords(x,y);
        gMouseStart = mouseXYZ;
    } else if (state == GLUT_UP && button == GLUT_MIDDLE_BUTTON) {
        gReorienting = false;
        const mouseXYZ = mouseToSceneCoords(x,y);
        handleReorient(mouseXYZ);
    }

}

function handleMouseDrag(x, y) {
    /*
     * Handle the mouse movement resulting from a drag.
     */
    if (gReorienting) {
        const mouseXYZ = mouseToSceneCoords(x,y);
        handleReorient(mouseXYZ);
    } else {
        handleEdit(x, y, true, true);
    }
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   
   DRAWING ROUTINES

*/

function drawPoint(location,color) {
    glPushMatrix();
    glTranslatef(location.x, location.y, location.z);
    glScalef(CONTROL_POINT_RADIUS,
             CONTROL_POINT_RADIUS,
             CONTROL_POINT_RADIUS);
    glColor3f(color.r, color.g, color.b);
    glTranslatef(0.0,0.0,-1.0); // Center it.
    glBeginEnd("soccer")
    glPopMatrix();
}

function drawControlPoint(location,selected) {
    if (selected) {
        drawPoint(location,SELECTED_COLOR);
    } else {
        drawPoint(location,ENDPOINT_COLOR);
    }        
}

function maybeDrawIntersection() {
    const meet = rayFacetIntersect(gPoint1,
                                   gPoint2,
                                   gPoint3,
                                   gSource,
                                   gTarget);
    if (meet !== null) {
        drawPoint(meet.point, INTERSECT_COLOR);
    }
}

function drawSegment(start,end,color,selected) {
    
    const heading = end.minus(start).unit();
    const length = end.dist(start);
    const up = new Vector3d(0.0,0.0,1.0);
    const axis = up.cross(heading).unit();
    const angle = Math.acos(up.dot(heading)) * 180.0 / Math.PI;
    
    // Draw the line.
    //
    // Perform the transformations.
    glPushMatrix();
    glTranslatef(start.x, start.y, start.z);
    glRotatef(angle, axis.dx, axis.dy, axis.dz);
    glScalef(CONTROL_POINT_RADIUS/2,
             CONTROL_POINT_RADIUS/2,
             length);
    glColor3f(color.r, color.g, color.b);
    glBeginEnd("SEGMENT");
    glPopMatrix();

    drawControlPoint(start,selected);

}

function drawArrow(start,end,color) {
    
    const heading = end.minus(start).unit();
    const length = end.dist(start);
    const up = new Vector3d(0.0,0.0,1.0);
    const axis = up.cross(heading).unit();
    const angle = Math.acos(up.dot(heading)) * 180.0 / Math.PI;

    let arrowLength = Math.max(length-ARROWHEAD_LENGTH-CONTROL_POINT_RADIUS,
                               0.0);
        
    // Draw the line.
    //
    // Perform the transformations.
    glPushMatrix();
    glTranslatef(start.x, start.y, start.z);
    glRotatef(angle, axis.dx, axis.dy, axis.dz);
    glPushMatrix();
    glScalef(CONTROL_POINT_RADIUS/2,
             CONTROL_POINT_RADIUS/2,
             arrowLength);
    glColor3f(color.r, color.g, color.b);
    glBeginEnd("SEGMENT");
    glPopMatrix();
    glTranslatef(0.0, 0.0, arrowLength);
    glScalef(CONTROL_POINT_RADIUS, CONTROL_POINT_RADIUS, ARROWHEAD_LENGTH);
    glColor3f(color.r, color.g, color.b);
    glBeginEnd("CONE");
    glPopMatrix();

    // Draw the arrow's control points.
    drawControlPoint(start, gSelectedPoint == SOURCE_SELECTED);
    drawControlPoint(end, gSelectedPoint == TARGET_SELECTED);
}
        
function drawArrangement() {

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

    const v2 = gPoint2.minus(gPoint1).unit();
    const v3 = gPoint3.minus(gPoint1).unit();
    const cross = v2.cross(v3);
    
    glBegin(GL_TRIANGLES,"triangle");
    glNormal3fv(cross.components());
    glVertex3fv(gPoint1.components());
    glVertex3fv(gPoint2.components());
    glVertex3fv(gPoint3.components());
    glEnd();
    //
    glColor3f(FACET_COLOR.r,FACET_COLOR.g,FACET_COLOR.b);
    glBeginEnd("triangle");
    
    drawSegment(gPoint1, gPoint2,
                SEGMENT_COLOR, gSelectedPoint == POINT1_SELECTED);
    drawSegment(gPoint2, gPoint3,
                SEGMENT_COLOR, gSelectedPoint == POINT2_SELECTED);
    drawSegment(gPoint3, gPoint1,
                SEGMENT_COLOR, gSelectedPoint == POINT3_SELECTED);
    maybeDrawIntersection();
    drawArrow(gSource,gTarget,RAY_COLOR);
        
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
    glOrtho(-1.0, 1.0, -1.0, 1.0, -5.0, 5.0);

    // Trackball reorientation.
    
    //
    // Clear the transformation stack.
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
    gOrientation.glRotatef();
    //
    // Draw all the objects in the scene.
    glPushMatrix();
    drawArrangement();
    glPopMatrix();
    
    glFlush();
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   GUI OBJECT DEFINTIONS FOR OPENGL
*/
function makeSegment() {
    const numSides = 24;
    const dangle = 2.0 * Math.PI / numSides;
    glBegin(GL_TRIANGLES, "SEGMENT");
    let angle = 0.0;
    for (let i=0; i<numSides; i++) {
        //
        glNormal3f(Math.cos(angle+dangle/2.0),
                   Math.sin(angle+dangle/2.0),
                   0.0);
        glVertex3f(Math.cos(angle), Math.sin(angle), 0.0);
        glVertex3f(Math.cos(angle+dangle), Math.sin(angle+dangle), 0.0);
        glVertex3f(Math.cos(angle+dangle), Math.sin(angle+dangle), 1.0);

        //
        glVertex3f(Math.cos(angle), Math.sin(angle), 0.0);
        glVertex3f(Math.cos(angle+dangle), Math.sin(angle+dangle), 1.0);
        glVertex3f(Math.cos(angle), Math.sin(angle), 1.0);
        //
        angle += dangle;
    }
    glEnd();
}

function makeCone() {
    const numSides = 24;
    const dangle = 2.0 * Math.PI / numSides;
    glBegin(GL_TRIANGLES, "CONE");
    let angle = 0.0;
    for (let i=0; i<numSides; i++) {
        glNormal3f(Math.cos(angle+dangle/2.0),
                   Math.sin(angle+dangle/2.0),
                   0.0);
        //
        glVertex3f(Math.cos(angle), Math.sin(angle), 0.0);
        glVertex3f(0.0,0.0,1.0);
        glVertex3f(Math.cos(angle+dangle), Math.sin(angle+dangle), 0.0);
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
    glutCreateWindow('facet intersection tester')
    
    // Build the renderable objects.
    makeObjectsLibrary(objectTexts);
    
    // Editor objects.
    makeSegment();
    makeCone();

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

