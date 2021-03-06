var bugManager = {
    BUG_WIDTH: 30,
    BUG_HEIGHT: 30,
    KILL_DISTANCE: 30,

    BUG_TYPE: [
        {
            color: 'black',
            score: 5,
            speed: {
                1: 150,
                2: 200,
            }
        },
        {
            color: 'red',
            score: 3,
            speed: {
                1: 75,
                2: 100,
            }
        },
        {
            color: 'orange',
            score: 1,
            speed: {
                1: 60,
                2: 80,
            }
        },
    ],

    bugs: [],
    selectedLevel: 1,
    bugCreationPID: 0,

    _randomBugType: function () {
        var randomNumber = myLib.getRandomNumber(1, 10);
        if (1 <= randomNumber && randomNumber <= 3) {
            return 0;
        } else if (3 < randomNumber && randomNumber <= 6) {
            return 1;
        } else {
            return 2;
        }
    },
    /* Function to create bugs
    */
    _createBug: function () {
        console.log("Bug created");
        bugManager.bugCreationPID = -1;
        var bugType = bugManager._randomBugType(),
            newBug = {
                width: bugManager.BUG_WIDTH,
                height: bugManager.BUG_HEIGHT,
                x: myLib.getRandomNumber(10, 380),
                y: -bugManager.BUG_HEIGHT,
                opacity: 1,
                alive: true,
                format: 'rectangle',
                bugType: bugType,
                moveAway: false,
                time: 0,
                moveAwayDirection: 0
            };
        if (gameEngine.gamePaused) return;
        bugManager.bugs.push(newBug);
        bugManager.resumeBugCreation();
    },
    /* Pauses bug creation when game is over or paused.
    */
    pauseBugCreation: function () {
        clearTimeout(bugManager.bugCreationPID);
        bugManager.bugCreationPID = -1;
    },
    
    /* Resumes bug creation when game is restarted.
    */
    resumeBugCreation: function () {
        if(bugManager.bugCreationPID == -1) {
            bugManager.bugCreationPID = setTimeout(
                bugManager._createBug,
                myLib.getRandomNumber(1000, 3000));
        }
    },
    /* Initliazes the bug manager class for the selected level.
    */
    initBugManager: function (selectedLevel) {
        bugManager.bugCreationPID = -1;
        bugManager.bugs = [];
        bugManager.selectedLevel = selectedLevel;
        bugManager.resumeBugCreation();
    },
    /* Draws out the bug from canvas.
    */
    drawBug: function (gameContext) {
        var i = 0;
        for (i = bugManager.bugs.length - 1; i > -1; i--) {
            var bug = bugManager.bugs[i];
            if (!bug.alive) {
                bug.opacity -= (1 / (gameEngine.GAME_FPS * 2));
                if (bug.opacity <= 0) {
                    myLib.removeAt(bugManager.bugs, i);
                    continue;
                }
            }
            var xCoord = 15;
            var yCoord = 15;

            gameContext.globalAlpha = bug.opacity;
            // draw the body 
            //gameContext.rect(bug.x, bug.y, bug.width, bug.height);
            //gameContext.stroke();
            gameContext.beginPath();
            gameContext.arc(bug.x + bug.width / 2, bug.y + bug.height / 2, bug.width / 2, 0, 2 * Math.PI);
            //add legs to bug
            gameContext.moveTo(bug.x, bug.y + bug.height / 2);
            gameContext.lineTo(bug.x - xCoord, bug.y + bug.height / 2);
            gameContext.moveTo(bug.x + bug.width, bug.y + bug.height / 2);
            gameContext.lineTo(bug.x + bug.width + xCoord, bug.y + bug.height / 2);

            gameContext.moveTo(bug.x, bug.y + bug.height / 2 + 10);
            gameContext.lineTo(bug.x - xCoord, bug.y + (bug.height / 2) + yCoord);
            gameContext.moveTo(bug.x + bug.width, bug.y + (bug.height / 2) + 10);
            gameContext.lineTo(bug.x + bug.width + xCoord, bug.y + (bug.height / 2) + yCoord);

            gameContext.moveTo(bug.x, bug.y + (bug.height / 2) - 10);
            gameContext.lineTo(bug.x - xCoord, bug.y + (bug.height / 2) - yCoord);
            gameContext.moveTo(bug.x + bug.width, bug.y + (bug.height / 2) - 10);
            gameContext.lineTo(bug.x + bug.width + xCoord, bug.y + (bug.height / 2) - yCoord);
            gameContext.stroke();
            // Add colour
            gameContext.fillStyle = bugManager.BUG_TYPE[bug.bugType].color;
            gameContext.fill();

            gameContext.globalAlpha = 1.0;

        }
    },

    /*
    *  Return the nearest food based on x and y position
    */
    _getNearestFoodFromBug: function (bug, allFood) {
        if (allFood.length == 0) return null;
        var nearestFood = null;
        var nearestDistance = Number.MAX_VALUE;
        allFood.forEach(function (food) {
            if (!food.available) return;
            var distance = myPhysicLib.distanceBetween(bug, food);
            if (distance < nearestDistance && food.available === true) {
                nearestFood = food;
                nearestDistance = distance;
            }
        });
        return nearestFood;
    },
    
    /* Updates the bugs' locations and moves them towards nearest food.
    */

    updateBugLocation: function (allFood) {
        var i = 0;
        for (i = 0; i < bugManager.bugs.length; i++) {
            var bug = bugManager.bugs[i];
            if (!bug.alive) continue;
            var nearestFood = bugManager._getNearestFoodFromBug(bug, allFood);
            if (nearestFood == null) return;
            var centerBug = myPhysicLib.getCenterObject(bug),
                centerFood = myPhysicLib.getCenterObject(nearestFood),
                moveVector = {
                    x: centerFood.x - centerBug.x,
                    y: centerFood.y - centerBug.y
                },
                moveVectorLen = Math.sqrt(
                    Math.pow(moveVector.x, 2)
                    + Math.pow(moveVector.y, 2),
                    2),
                unitMoveVector = {
                    x: moveVector.x / moveVectorLen,
                    y: moveVector.y / moveVectorLen
                },
                bugSpeed = bugManager.BUG_TYPE[bug.bugType].speed[bugManager.selectedLevel] / gameEngine.GAME_FPS;

            if (bug.moveAway) {
                if (bug.time > 0) {
                    bug.time--;
                    unitMoveVector = {
                        x: bug.moveAwayDirection,
                        y: 0
                    };
                    bugSpeed = bugSpeed * 2;
                } else {
                    bug.moveAway = false;
                }
            }

            var finalMoveVectorLen = {
                x: unitMoveVector.x * bugSpeed,
                y: unitMoveVector.y * bugSpeed
            };

            bug.x += finalMoveVectorLen.x;
            bug.y += finalMoveVectorLen.y;
        }
    },
    /* Function that kills the bugs on screen.
    */
    killBug: function (e) {
        // if game paused don't do anything
        if (gameEngine.gamePaused == true) {
            return;
        }
        //if game is not paused
        else {
            var n = 0,
                mouseClick = {
                    x: e.offsetX,
                    y: e.offsetY,
                    width: 0,
                    height: 0
                },
                killDistance = bugManager.BUG_WIDTH / 2 + bugManager.KILL_DISTANCE;

            for (n = 0; n < bugManager.bugs.length; n++) {
                var currBug = bugManager.bugs[n],
                    dist = myPhysicLib.distanceBetween(mouseClick, currBug);
                if (dist <= killDistance) {
                    // adds score
                    gameEngine.addScore(bugManager.BUG_TYPE[currBug.bugType].score);
                    currBug.alive = false;
                }
            }

        }
    },
    /* Makes the slower bug let the faster bug move through. If bugs are of the same speed,
    makes the bug on the right, move through.
   */
    slowDownBug: function () {
        var i = 0;
        var j = 0;
        for (i = 0; i < bugManager.bugs.length; i++) {
            var currentBug = bugManager.bugs[i];
            if (!currentBug.alive) continue;
            for (j = i; j < bugManager.bugs.length; j++) {
                // checking that it is not the same bug
                if (i == j) continue;
                var otherBug = bugManager.bugs[j];
                if (!otherBug.alive) continue;
                if (myPhysicLib.distanceBetween(currentBug, otherBug) > 60) continue;
                //get distance between bugs.
                var lowerPriorityBug = bugManager.lessPriorityBug(currentBug, otherBug);
                var higherPriorityBug = bugManager.highPriorityBug(currentBug, otherBug);
                // if lower priority bug is on the left
                //if(lowerPriorityBug.moveAway) continue;
                lowerPriorityBug.moveAway = true;
                if (lowerPriorityBug.x < higherPriorityBug.x) {
                    //lowerPriorityBug.x = lowerPriorityBug.x - 10;
                    lowerPriorityBug.time = 10;
                    lowerPriorityBug.moveAwayDirection = -1;

                }
                else if (lowerPriorityBug.x > higherPriorityBug.x) {
                    //lowerPriorityBug.x = lowerPriorityBug.x + 10;
                    lowerPriorityBug.time = 10;
                    lowerPriorityBug.moveAwayDirection = 1;
                }
            }
        }
    },
    /* Returns the bug with the lower priority.
     */
    lessPriorityBug: function (firstBug, otherBug) {
        //different speed
        var firstBugScore = bugManager.BUG_TYPE[firstBug.bugType].score,
            otherBugScore = bugManager.BUG_TYPE[otherBug.bugType].score;
        if (otherBugScore > firstBugScore) {
            return firstBug;
        }
        else if (otherBugScore < firstBugScore) {
            return otherBug;
        }
        //same speed 
        else if (otherBugScore == firstBugScore) {
            //if firstbug is on the right
            if (firstBug.x > otherBug.x) {
                return otherBug;
            }
            //if otherbug is on the right
            if (otherBug.x > firstBug.x) {
                return firstBug;
            }
        }
    },
    /* Returns the bug with the higher priority.
     */
    highPriorityBug: function (firstBug, otherBug) {
        //different speed
        var firstBugScore = bugManager.BUG_TYPE[firstBug.bugType].score,
            otherBugScore = bugManager.BUG_TYPE[otherBug.bugType].score;
        if (otherBugScore < firstBugScore) {
            return firstBug;
        }
        else if (otherBugScore > firstBugScore) {
            return otherBug;
        }
        //same speed 
        else if (otherBugScore == firstBugScore) {
            //if firstbug is on the right
            if (firstBug.x > otherBug.x) {
                return firstBug;
            }
            //if otherbug is on the right
            if (otherBug.x > firstBug.x) {
                return otherBug;
            }
        }
    },
}
