var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');

//display
var coordinatesDisplay = document.getElementById("coordinates");
var instructions = document.getElementById("instructions");
var pointer = document.getElementById("pointer");

//buttons
var paintButton = document.getElementById("initiateSimulation");
var penButton = document.getElementById("enablePen");
var inspectButton = document.getElementById("inspect");

//event listeners
canvas.addEventListener("click", canvasClicked, true);
canvas.addEventListener("mousemove", trackMouse, true);

clearCanvas();
var mode = 'standby'; //possible values: 'standby', 'penEnabled', 'initiateSimulation', 'inspect'
var charges = [] //stores the position of all charges in the simulation
var ifPenDown = false; //if the user is drawing on the canvas

//colours
const canvasColour = [0, 103, 0] //green
const penColour = [255, 0, 0] //red
const paintColour = [150, 150, 0] //yellowish brown
const chargeColour = [0, 0, 0] //black

/**
 * clears the canvas element
 */
function clearCanvas(){
    ctx.fillStyle = "#006700";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/**
 * colours a small square area around a coordinate on the canvas element
 * @param {object} coordinates an array in the form of [x value, y value]
 * @param {object} colour expressed in RGB in an array of length of 3
 * @param {number} penWidth width of the square area
 */
function draw(coordinates, colour, penWidth){
    var imageObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for(let i = -penWidth/2; i < penWidth/2 + 1; i++){
        var x = coordinates[0] + i
        for(let j = -penWidth/2; j < penWidth/2 + 1; j++){
            var y = coordinates[1] + j
        editPixelColour(x, y, colour, imageObj)
        } 
    }
    ctx.putImageData(imageObj, 0, 0);
}

/**
 * draws a line on the canvas element
 * uses less computer processing power than draw() function
 * @param {number} prev_x x coordinate of where line starts
 * @param {number} prev_y y coordinates of where line starts
 * @param {number} x_val x coordinates of where line ends
 * @param {number} y_val y coordinates of where line ends
 * @param {object} colour expressed in RGB in an array of length of 3
 * @param {number} width width of line
 */
function drawLine(prev_x, prev_y, x_val, y_val, colour, width = 4) {
    // set line colour and width
    rgbFormat = 'rgb(' + colour + ')'
    ctx.strokeStyle = rgbFormat;
    ctx.lineWidth = width;

    ctx.beginPath();
    ctx.moveTo(prev_x, prev_y);
    ctx.lineTo(x_val, y_val);
    ctx.stroke();
}

/**
 * triggered when 'enable pen' button is pressed
 * changes global variable, mode to 'penEnabled'
 * it toggles
 */
function enablePen(){
    if (mode == 'penEnabled'){
        mode = 'standby'
        penButton.innerText = 'enable pen'
    } else{
        mode = 'penEnabled'
        penButton.innerText = 'disable pen'
        instructions.innerText = 'click on canvas below to draw, and click again to stop. move mouse slowly to avoid gaps in the line'
        paintButton.innerText = 'start simulation'
        inspectButton.innerText = 'inspect number of charges'
        pointer.style.top = canvas.offsetTop + canvas.height + "px"
        pointer.style.left = 0
    }
}

/**
 * triggered when 'inspect number of charges' button is pressed
 * changes global variable, mode to 'inspect'
 * it toggles
 */
function inspect(){
    if (mode == 'inspect'){
        mode = 'standby'
        inspectButton.innerText = 'inspect number of charges'
        pointer.style.top = canvas.offsetTop + canvas.height + "px"
        pointer.style.left = 0
    } else{
        mode = 'inspect'
        inspectButton.innerText = 'stop inspecting'
        instructions.innerText = 'hover over area to count number of charges in vicinity'
        penButton.innerText = 'enable pen'
        paintButton.innerText = 'start simulation'
    }
}

/**
 * triggered when 'start simulation' button is pressed
 * changes global variable, mode to 'initiateSimulation'
 * it toggles
 */
function initiateSimulation(){
    if (mode == 'initiateSimulation'){
        mode = 'standby'
        paintButton.innerText = 'start simulation'
    } else{
        mode = 'initiateSimulation'
        paintButton.innerText = 'stop simulation'
        instructions.innerText = 'click on an enclosed area, which represents the conducting sheet'
        penButton.innerText = 'enable pen'
        inspectButton.innerText = 'inspect number of charges'
        pointer.style.top = canvas.offsetTop + canvas.height + "px"
        pointer.style.left = 0
    }
}

/**
 * triggered when canvas is clicked
 * its response depends on the global variable, mode
 * @param {object} event mouse click event
 */
function canvasClicked(event){
    switch(mode){
        case 'standby':
            //does nothing
            break;
        case 'penEnabled':
            if (ifPenDown == false){
                prev_x = null;
                prev_y = null;
                ifPenDown = true
            } else{
                ifPenDown = false
            }
            break;
        case 'initiateSimulation':
            colourArea(event);
            simulateCharges(event);
            break;
        case 'inspect':
            //does nothing
            break;
        default:
            alert('error in canvasClicked() with variable: mode')  
    }
    
}

/**
 * triggered when mouse moves
 * displays location of mouse
 * @param {object} event mouse move event
 */
function trackMouse(event){
    var x_val = event.pageX - canvas.offsetLeft;
    var y_val = event.pageY - canvas.offsetTop;
    
    //display location of mouse
    coordinatesDisplay.innerText = 'coordinates: ' + x_val + ' , ' + y_val;

    if (ifPenDown == true && mode == 'penEnabled'){
        draw([x_val, y_val], penColour, 4)
    }
    
    if (mode == 'inspect'){
        var range = 20
        chargeCount = 0 //counts number of charges in close vicinity of where mouse moved
        for(let i = 0; i < charges.length; i++){
            if (charges[i][0] < x_val + range && charges[i][0] > x_val - range){
                if(charges[i][1] < y_val + range && charges[i][1] > y_val - range){
                    chargeCount ++
                }
            }
        }
        coordinatesDisplay.innerText += 'charge count around mouse: ' + chargeCount

        //pointer is the blue box on screen. When the page is refeshed, it is under the canvas element
        pointer.width = range * 2
        pointer.height = range * 2
        pointer.style.left = event.pageX - range + 'px';
        pointer.style.top = event.pageY - range + 'px';
    }
}

/**
 * colour an area of the canvas element
 * @param {object} event mouse click event
 */
function colourArea(event){
    var imageObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    var x = event.pageX - canvas.offsetLeft;
    var y = event.pageY - canvas.offsetTop;
    
    var frontier_pixel = [[x, y], ]; //list of possible pixels to be coloured

    for (let i = 0; i < canvas.width * canvas.height; i++){
        if (frontier_pixel[0] == undefined){//when frontier_pixel is empty
            break;
        }else{
            var x1 = frontier_pixel[0][0];
            var y1 = frontier_pixel[0][1];
            var neighbours = [[x1 + 1 , y1], [x1 - 1, y1], [x1, y1 + 1], [x1, y1 - 1]]
            for (let i = 0; i < neighbours.length; i++){
                var RGB = readPixelColour(neighbours[i][0], neighbours[i][1], imageObj)

                //the function only colours a CONTINUOUS patch with canvasColour (global variable)
                //other colours marks a border. All pixel outside of this border is not coloured
                if (JSON.stringify(RGB) == JSON.stringify(canvasColour)){
                    frontier_pixel.push( [neighbours[i][0], neighbours[i][1]] )
                    editPixelColour(neighbours[i][0], neighbours[i][1], paintColour, imageObj)
                }
            }
            frontier_pixel.splice(0,1);
        }
    }
    ctx.putImageData(imageObj, 0, 0);
}

/**
 * change pixel colour at canvas coordinate (x, y) to RGBArray's colour
 * @param {number} x an integer
 * @param {number} y an integer
 * @param {object} RGBArray RGB expressed in an array of length 3
 * @param {object} imageObj of the canvas element
 */
function editPixelColour(x, y, RGBArray, imageObj){ 
    for (let i = 0; i < 3; i++){
        //.data stores RGBA (red, green, blue, alpha) for each pixel, so there is '* 4' in the equation below
        //for more information: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
        imageObj.data[((y * (canvas.width * 4)) + (x * 4)) + i] = RGBArray[i];
    }  
}

/**
 * returns the colour at coordinate (x, y) 
 * @param {number} x an integer
 * @param {number} y an integer
 * @param {object} imageObj of the canvas element
 * @returns in RGB form expressed as an array of length 3
 */
function readPixelColour(x, y, imageObj){ 
    if(x < 0 || y < 0 || x > canvas.width || y > canvas.height){
        //if coordinates are outside of canvas
        return canvasColour
    }

    RGBArray = [null, null, null];
    for (let i = 0; i < 3; i++){
        //.data stores RGBA (red, green, blue, alpha) for each pixel, so there is '* 4' in the equation below
        //for more information: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
        RGBArray[i] = imageObj.data[((y * (canvas.width * 4)) + (x * 4)) + i];
    }
    return RGBArray
}

/**
 * returns an array of coordinates of charges
 * @param {object} event mouse click event
 * @returns an array, e.g. createdCharges[5][0] means x coordinates of fifth charge, 
 * createdCharges[5][1] is its y coordinations
 */
function createCharges(event){
    var cx = event.pageX - canvas.offsetLeft;
    var cy = event.pageY - canvas.offsetTop;
    var createdCharges = [];
    const numCharge = 40 **2
    for (let j = 0; j < numCharge **0.5; j++){
        for(let i = 0; i < numCharge **0.5; i++){
            createdCharges.push([cx + i, cy + j],)
        }
    }
    return createdCharges
}

/**
 * the main algorithm for simulating the charge distribution and motion
 * by calling other functions
 * @param {object} event mouse click event
 */
function simulateCharges(event){
    charges = createCharges(event);
    var initialImageObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    const numStep = 75
    const initialStepsize = 80
    timeStep(charges, initialImageObj, numStep, initialStepsize)

    function timeStep(charges, initialImageObj, remainingStep, stepSize) {
        ctx.putImageData(initialImageObj, 0, 0);
        for (let i = 0; i < charges.length; i++){
            var fxSum = 0.;
            var fySum = 0.;

            //adds up forces on charge[i] from other charges
            for (let k = 0; k < charges.length; k++){
                fxSum += coulombsLaw(charges[i], charges[k])[0]
                fySum += coulombsLaw(charges[i], charges[k])[1]
            }
            if (fxSum >= 700){fxSum = 700}
            if (fySum >= 700){fySum = 700}
            if (fxSum <= -700){fxSum = -700}
            if (fySum <= -700){fySum = -700}
            var magnitude = (fxSum**2 + fySum**2)**0.5
            if (magnitude == 0){magnitude = 1}; //preventing division by zero in the next lines
            var xMotion = fxSum / magnitude * stepSize
            var yMotion = fySum / magnitude * stepSize
            /*You may notice '/ magnitude * stepSize' causes the magnitude of force on charge[i] to be fixed at a
            constant number.
            This simulation only cares about the direction of the force.
            If the charges move in the right direction, they will eventually reach electrostatic equilibrium, 
            regardless of the magnitude
            */
            temp = [Math.round(charges[i][0] + xMotion), Math.round(charges[i][1] + yMotion)];
            temp = ifWithinBoundary(temp, charges[i], initialImageObj);
            charges[i] = collisionAvoidance(temp, charges, initialImageObj, i, xMotion, yMotion, temp);   
        }

        // draws/displays charges on screen
        for (let i = 0; i < charges.length; i++){
            aCharge = charges[i]
            drawLine(aCharge[0] + 1, aCharge[1], aCharge[0] - 1, aCharge[1], chargeColour)
        }

        remainingStep -= 1
        if (stepSize > 5){
            //Reduce stepSize after each step, so the charges move slower in later steps.
            //So charges quickly move into general position, THEN slowly finetune their positions
            stepSize -= (stepSize + 10) / remainingStep
        }
        
        if (remainingStep > 0){
            const stepDuration = 10
            setTimeout(timeStep, stepDuration, charges, initialImageObj, remainingStep, stepSize)
        } else{
            alert('simulation has completed');
        }
    }
}

/**
 * checks if the proposed position is within edges of the sheet of conductor
 * so there will not be charges outside of the conductor
 * positions expressed in in an arrays: [x, y]
 * if proposed position is good, it becomes the return
 * if not, a corrected position nearby the proposed is returned
 * @param {object} newPos1 initial position of charge
 * @param {object} prevPos1 proposed next position of charge
 * @param {object} initialImageObj of canvas element
 * @returns valid next position
 */
function ifWithinBoundary(newPos1, prevPos1, initialImageObj){
    var newRGB = readPixelColour(newPos1[0], newPos1[1], initialImageObj)
    var prevRGB = readPixelColour(prevPos1[0], prevPos1[1], initialImageObj)
    if (JSON.stringify(newRGB) == JSON.stringify(paintColour)){
        //if ends within the conductor
        return newPos1
    } else{
        if(JSON.stringify(prevRGB) == JSON.stringify(penColour)){
            //if starts on the edge of conductor
           var dx = newPos1[0] - prevPos1[0]
           var dy = newPos1[1] - prevPos1[1]
           var stepSize = Math.round((dx **2 + dy **2) **0.5)

           var firstDir = null //records the preferred direction of motion, which matches direction of force
           var secDir = null
           if (dx > 0){
               var firstDir = 'right'
           } else{var firstDir = 'left'}
           
           if (dy > 0){
                var secDir = 'up'
            } else{var secDir = 'down'}
           
            if (dy**2 > dx**2){ //checks if change in y is more significant than change in x
                temp2 = firstDir
                firstDir = secDir
                secDir = temp2
            }

            for(let i = 0; i < stepSize; i++){
                prevPos1 = moveAlongBoundary(prevPos1, firstDir, secDir, initialImageObj);
            }
            
            return prevPos1;

        } else{// if lands outside of conductor
            var backtracked = linearBacktracking(prevPos1, newPos1, initialImageObj)
            if (backtracked != null){
                return backtracked
            } else{
                backtracked = linearBacktracking(prevPos1, newPos1, initialImageObj, true)
                /*backtracking twice, since if change in x is very small and change in y very large,
                linearBacktracking() will miss the intersection between tragectory and edge of conductor.
                If confused, see linearBacktracking() function.
                The true argument in the parameter, flips x and y, so the function treats x like y and
                vice versa
                */
                return [backtracked[1], backtracked[0]]
            }
            
        }
    }
}

/**
 * triggered when proposed position is outside of the conductor
 * it moves the charges from proposed towards inital position in a linear tragectory
 * until it reaches/intersects the edge of conductor
 * returns this intersection point on edge
 * positions expressed in in an arrays: [x, y]
 * 
 * @param {object} prevPos1 initial position of a charge
 * @param {object} newPos1 proposed next position
 * @param {object} initialImageObj of canvas element
 * @param {boolean} switched if y and x values are switched around
 * @returns valid next position
 */
function linearBacktracking(prevPos1, newPos1, initialImageObj, switched = false){
    if (switched == true){
        newPos1 = [newPos1[1], newPos1[0]]
        prevPos1 = [prevPos1[1], prevPos1[0]]
    }

    var start
    var end
    if (prevPos1[0] < newPos1[0]){
        start = prevPos1[0]
        end = newPos1[0]
    } else{
        end = prevPos1[0]
        start = newPos1[0]
    }

    for(let x = start; x < end + 1; x++){
        y1 = (newPos1[1] - prevPos1[1]) / (newPos1[0] - prevPos1[0]) * (x - prevPos1[0]) + prevPos1[1]
        y = Math.round(y1)

        if (switched == false){
            var RGB = readPixelColour(x, y, initialImageObj)
        } else{
            var RGB = readPixelColour(y, x, initialImageObj)
        }
        
        if(JSON.stringify(RGB) == JSON.stringify(penColour)){ //edge of conductor is marked by penColour
            if (x == undefined || y == undefined){alert('error with linearBacktracking()')}
            return [x, y]
        }  
    }
    return null
}

/**
 * triggered when starting position of a charge is on the edge of conductor
 * edge of conductor is marked by the colour, penColour (global variable)
 * moves charge to an adjacent pixel of the canvas that is apart of the edge
 * the preferences prejudices the charge to move in the direction of electrostatic force
 * @param {object} pos1 position of a charge
 * @param {string} firstDir first preference
 * @param {string} secDir second preference
 * @param {object} imageObj of the canvas element
 * @returns next position of the charge
 */
function moveAlongBoundary(pos1, firstDir, secDir, imageObj){
    const directions = {
        'left' : [-1, 0],
        'right' : [1, 0],
        'up' : [0, 1],
        'down' : [0, -1]
    };

    //terms list first below are checked first and thus preferred
    var neighbours = [ [pos1[0] + directions[firstDir][0], pos1[1] + directions[firstDir][1]],
    [pos1[0] + directions[secDir][0], pos1[1] + directions[secDir][1]],
    [pos1[0] - directions[secDir][0], pos1[1] - directions[secDir][1]],
    [pos1[0] - directions[firstDir][0], pos1[1] - directions[firstDir][1]]
    ];

    for (let i = 0; i < neighbours.length; i++){
        var RGB = readPixelColour(neighbours[i][0], neighbours[i][1], imageObj)

        if (JSON.stringify(RGB) == JSON.stringify(penColour)){ //edge of conductor is marked by penColour
            return neighbours[i]
        }
    } 
}

/**
 * checks if pos1 match/collides the coordinates of another charge
 * if not, return pos1
 * if yes, return a correct position near pos1
 * all position expressed as an array: [x, y]
 * @param {object} pos1 position of charge
 * @param {object} charges an array of all charges' positions
 * @param {object} imageObj of the canvas element
 * @param {number} iteration counts how many time the function calls itself, since this is a nested function
 * @returns a valid next position
 */
function collisionAvoidance(pos1, charges, imageObj, iteration = 0){
    if (collisionDetect(pos1, charges) == 0){
        return pos1
    } else{
        var x1 = pos1[0];
        var y1 = pos1[1];
        var neighbours = [[x1 + 1 , y1], [x1, y1 + 1], [x1 - 1, y1], [x1, y1 - 1]] //right, up, left, down
        var validNeighbours = []
        for (let i = 0; i < neighbours.length; i++){
            var RGB = readPixelColour(neighbours[i][0], neighbours[i][1], imageObj)
            if(JSON.stringify(RGB) != JSON.stringify(canvasColour)){//if position is within conductor
                validNeighbours.push(neighbours[i])
                 if(collisionDetect(neighbours[i], charges) == 0){
                    return neighbours[i]
                 }
            }  
        }

        if (iteration > 8){
            //caps the number nested function call below, preventing 'Maximum call stack size exceeded error'
            return pos1
        }else{
            iteration ++
        }
        return collisionAvoidance(validNeighbours[0], charges, imageObj, iteration);
    }
}

/**
 * called by collisionAvoidance()
 * @param {object} pos1 position of charge
 * @param {object} charges an array of all charges' positions
 * @returns how many other charges the charge collides with
 */
function collisionDetect(pos1, charges){
    var match = 0
    for (let i = 0; i < charges.length; i++){
        if (pos1[0] == charges[i][0]){
            if(pos1[1] == charges[i][1]){
                match += 1
            }
        }
    }
    return match        
}

/**
 * calculates force of charge at pos2 exerted on one at pos1
 * using coulomb's law
 * returns the force as a vector
 * @param {object} pos1 position of a charge
 * @param {object} pos2 position of another charge
 * @returns an array
 */
function coulombsLaw(pos1, pos2){
    if (pos2 == undefined){alert('undefined pos2 in coulombsLaw(); pos1 = ' + pos1)}
    dx = pos1[0] - pos2[0]
    dy = pos1[1] - pos2[1]
    distance = (dx **2 + dy **2) **0.5
    if (distance == 0){ //prevent division by zero in later calculations
        return [0, 0]
    }
    fx = (1 / distance **2.) * dx / distance
    fy = (1 / distance **2.) * dy / distance
    if (fx == Infinity){fx = 500}
    if (fy == Infinity){fy = 500}
    return [fx, fy]
}

