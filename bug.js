var bugManager = {
    BUG_WIDTH: 30,
    BUG_HEIGHT: 30,

    BUG_TYPE: [
        {
            color: 'black',
            score: 5,
            speed: {
                1: 1,
                2: 2,
            }
        },
        {
            color: 'red',
            score: 3,
            speed: {
                1: 1,
                2: 2,
            }
        },
        {
            color: 'orange',
            score: 1,
            speed: {
                1: 1,
                2: 2,
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

    _createBug: function () {
        console.log("Bug created");
        var bugType = bugManager._randomBugType(),
            newBug = {
                width: bugManager.BUG_WIDTH,
                height: bugManager.BUG_HEIGHT,
                x: myLib.getRandomNumber(10, 380),
                y: -bugManager.BUG_HEIGHT,
                opacity: 1,
                alive: true,
                format: 'rectangle',
                bugType: bugType
            };
        bugManager.bugs.push(newBug);
        bugManager.resumeBugCreation();
    },

    pauseBugCreation: function () {
        clearInterval(bugManager.bugCreationPID);
    },

    resumeBugCreation: function () {
        bugManager.bugCreationPID = setTimeout(
            bugManager._createBug,
            myLib.getRandomNumber(1000, 3000));
    },

    initBugManager: function (selectedLevel) {
        var i;
        bugManager.bugs = [];
        bugManager.selectedLevel = selectedLevel;
        bugManager.resumeBugCreation();
    },

    drawBug: function (gameContext) {
        var i = 0;
        for (i = bugManager.bugs.length - 1; i > -1; i--) {
            var bug = bugManager.bugs[i];
            if (!bug.alive) {
                bug.opacity -= 2;
                if (bug.opacity == 0) {
                    myLib.removeAt(bugManager.bugs, i);
                    continue;
                }
            }
            var xCoord = 15;
            var yCoord = 15;
            
            gameContext.globalAlpha = bug.opacity;
            // draw the body 
            gameContext.rect(bug.x,bug.y,bug.width,bug.height);
            gameContext.stroke();
            gameContext.beginPath();
            gameContext.arc(bug.x+bug.width/2,bug.y+bug.height/2,bug.width/2,0,2*Math.PI);
            //add legs to bug
            gameContext.moveTo(bug.x,bug.y+bug.height/2);
            gameContext.lineTo(bug.x-xCoord,bug.y+bug.height/2);
            gameContext.moveTo(bug.x+bug.width,bug.y+bug.height/2);
            gameContext.lineTo(bug.x+bug.width+xCoord,bug.y+bug.height/2);
            
            gameContext.moveTo(bug.x,bug.y+bug.height/2+10);
            gameContext.lineTo(bug.x-xCoord,bug.y+(bug.height/2)+yCoord);
            gameContext.moveTo(bug.x+bug.width,bug.y+(bug.height/2)+10);
            gameContext.lineTo(bug.x+bug.width+xCoord,bug.y+(bug.height/2)+yCoord);
            
            gameContext.moveTo(bug.x,bug.y+(bug.height/2)-10);
            gameContext.lineTo(bug.x-xCoord,bug.y+(bug.height/2)-yCoord);
            gameContext.moveTo(bug.x+bug.width,bug.y+(bug.height/2)-10);
            gameContext.lineTo(bug.x+bug.width+xCoord,bug.y+(bug.height/2)-yCoord);
            gameContext.stroke();
            gameContext.globalAlpha = 1.0;
            // fill in color according to type of bug
            if (bug.bugType == 0){
                gameContext.fillStyle = 'black';
                gameContext.fill();
        
            }
            else if (bug.bugType == 1){
                gameContext.fillStyle = 'red';
                gameContext.fill();
            }
            else if (bug.bugType == 2){
                gameContext.fillStyle = 'orange';
                gameContext.fill();
            }
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

    updateBugLocation: function (allFood) {
        var i = 0;
        for (i = 0; i < bugManager.bugs.length; i++) {
            var bug = bugManager.bugs[i];
            if (!bug.alive) continue;
            var nearestFood = bugManager._getNearestFoodFromBug(bug, allFood);
            if (nearestFood == null) return;
            if (nearestFood.x - bug.x > 0) {
                bug.x += 1;
            } else if (nearestFood.x - bug.x < 0) {
                bug.x -= 1;
            }

            if (nearestFood.y - bug.y > 0) {
                bug.y += 1;
            } else if (nearestFood.y - bug.y < 0) {
                bug.y -= 1;
            }
        }
    },
    //function to kill bug
/*
    killBug: function (e){

               if (GAME_PAUSED === true){
                return;
            }
            else{ 
                //var n = 0;
                //for (n = 0; i < bugs.length; n++) {
                    //var currBug= bugManager.bugs[0];
                    //dist = myPhysicLib.distanceBetween({ x: e.clientX, y: e.clientY}, currBug);
                    //if(dist<=200){
                        //alert("hello");
                        //gameScore = gameScore + currBug.score;
                        //currBug.alive = false;
                    //}
                //}
            //}
    },
    //function to make sure that slower bug stops for faster bug
   slowDownBug: function (bugManager.bugs) {
       // check distance between bug and surronding bugs
       // if faster bug's x coordinate > slower bug's x coordinate,
       // move to the left 
       // or else move to the right
       // also need to check which direction the nearest food is to decide if move left
       //or right
        var i = 0;
        var j = 0;
        for (i = 0; i < bugManager.bugs.length; i++) {
            var currentBug = bugManager.bugs[i];
            for (j = 0; j < bugManager.bugs.length; j++) {
                var otherBug = bugManager.bugs[j];
                // checking that it is not the same bug
                if(i != j){
                    if (currentBug.bugType.score < otherBug.bugType.score){
                        if (currentBug.x <= otherBug.x){
                            currentBug.x = currentBug.x - 5;
                            currentBug.y = currentBug.y + 5;
                        }
                        else if (currentBug.x >= otherBug.x){
                            currentBug.x = currentBug.x + 5;
                            currentBug.y = currentBug.y - 5;
                        }

                    }
                }
            }
        }
   }
   */
}
