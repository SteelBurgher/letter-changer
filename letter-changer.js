var letterC = ["                                     ",
               "                                     ",
			   "           ##################        ",
			   "          ###               ##       ",
			   "         ##                   #      ",
			   "        ##                           ",
			   "       ##                            ",
			   "      ##                             ",
			   "       ##                            ",
			   "        ##                           ",
			   "         ##                   #      ",
			   "          ###               ##       ",
			   "           ##################        ",
			   "                                     ",
			   "                                     "];
var letterA = ["                                     ",
               "                                     ",
			   "                  ##                 ",
			   "                 ####                ",
			   "                ##  ##               ",
			   "               ##    ##              ",
			   "              ##      ##             ",
			   "             ##        ##            ",
			   "            ##############           ",
			   "           ##            ##          ",
			   "          ##              ##         ",
			   "         ##                ##        ",
			   "        ##                  ##       ",
			   "                                     ",
			   "                                     "];
// Vector object to represent an x,y position 
function Vector(x, y) {
this.x = x;
this.y = y;
}
Vector.prototype.plus = function(other) {
	return new Vector(this.x + other.x, this.y + other.y);
};

var directions = {
  "n":  new Vector( 0, -1),
  "ne": new Vector( 1, -1),
  "e":  new Vector( 1,  0),
  "se": new Vector( 1,  1),
  "s":  new Vector( 0,  1),
  "sw": new Vector(-1,  1),
  "w":  new Vector(-1,  0),
  "nw": new Vector(-1, -1)
};

// LetterGrid object to represent the letter space as an array of data
function LetterGrid(width, height) {
	this.space = new Array(width * height);
	this.width = width;
	this.height = height;
}

LetterGrid.prototype.isInside = function(vector) {
	return vector.x >= 0 && vector.x < this.width &&
		   vector.y >= 0 && vector.y < this.height;
};
LetterGrid.prototype.get = function(vector) {
	return this.space[vector.x + this.width * vector.y];
};
LetterGrid.prototype.set = function(vector, value) {
	this.space[vector.x + this.width * vector.y] = value;
}

// Returns a random element from the array given as an argument
function randomElement(array) {
	return array[Math.floor(Math.random() * array.length)];
}

var directionNames = "n ne e se s sw w nw".split(" ");

function Mover() {
	this.direction = randomElement(directionNames);
    this.locked = false;
}

Mover.prototype.move = function(view) {
	if (view.look(this.direction) != " ")
		this.direction = view.find(" ") || "s";
  return {direction: this.direction};
};

function elementFromChar(ch) {
	if (ch == " ")
		return null;
	var element = new Mover();
	element.originChar = ch;
	return element;
}
function charFromElement(element) {
	if (element == null)
		return " ";
	else
		return element.originChar;
}
//LetterChanger object 
function LetterChanger(letter, newLetter) {
    var theLetter = new LetterGrid(letter[0].length, letter.length);
	var theNewLetter = new LetterGrid(letter[0].length, letter.length);
    this.letterGrid = theLetter;
	this.newLetterGrid = theNewLetter;
    this.steps = 0;
    this.oldLetterMovers = 0;
    this.newLetterMovers = 0;
	letter.forEach(function(line, y) {
      for (var x = 0; x < line.length; x++) {
		theLetter.set(new Vector(x, y), elementFromChar(line[x]));
        if (theLetter.get(new Vector(x, y)) instanceof Mover)
           this.oldLetterMovers += 1;
      }
    }, this);
    newLetter.forEach(function(line, y) {
      for (var x = 0; x < line.length; x++) {
	     theNewLetter.set(new Vector(x, y), elementFromChar(line[x]));
         if (theNewLetter.get(new Vector(x, y)) instanceof Mover)
           this.newLetterMovers += 1;
      }
	}, this);
    this.difference = this.oldLetterMovers - this.newLetterMovers;
}

LetterChanger.prototype.toString = function() {
	var output = "";
    if (this.steps < 200 && this.oldLetterMovers > 0 && this.oldLetterMovers > this.difference) {
      for (var y = 0; y < this.letterGrid.height; y++) {
        for (var x = 0; x < this.letterGrid.width; x++) {
              var element = this.letterGrid.get(new Vector(x,y));
              output += charFromElement(element);
          }
          output += "\n";
      }
    }
    else 
      output = this.printNew();
	return output;
};
LetterChanger.prototype.printNew = function() {
  var output ="";
  for (var y = 0; y < this.newLetterGrid.height; y++) {
      for (var x = 0; x < this.newLetterGrid.width; x++) {
			var element = this.newLetterGrid.get(new Vector(x,y));
			output += charFromElement(element);
		}
		output += "\n";
	}
	return output;
}

LetterGrid.prototype.forEach = function(f, context) {
  for (var y = 0; y < this.height; y++) {
    for (var x = 0; x < this.width; x++) {
      var value = this.space[x + y * this.width];
      if (value != null)
        f.call(context, value, new Vector(x, y));
    }
  }
};

LetterChanger.prototype.step = function() {
	var moved = [];
	this.letterGrid.forEach(function(mover, vector) {
		if (moved.indexOf(mover) == -1) {
			moved.push(mover);
            if (mover.locked != true)
			this.letAct(mover, vector);
		}
      }, this);
    this.steps += 1;
};

LetterChanger.prototype.letAct = function(mover, vector) {
	var action = mover.move(new View(this, vector));
	if (action) {
		var dest = this.checkDestination(action, vector);
		if (dest && this.letterGrid.get(dest) == null) {
			this.letterGrid.set(vector, null);
			this.letterGrid.set(dest, mover);
          if (this.steps > 10 && this.newLetterGrid.get(dest) instanceof Mover) {
            mover.locked = true;
            this.oldLetterMovers -= 1;
          }
		}
	}
};


LetterChanger.prototype.checkDestination = function(action, vector) {
	if (directions.hasOwnProperty(action.direction)) {
		var dest = vector.plus(directions[action.direction]);
		if (this.letterGrid.isInside(dest))
			return dest;
		}
};

function View(letterChanger, vector) {
	this.letterChanger = letterChanger;
	this.vector = vector;
}
View.prototype.look = function(dir) {
	var target = this.vector.plus(directions[dir]);
	if (this.letterChanger.letterGrid.isInside(target))
		return charFromElement(this.letterChanger.letterGrid.get(target));
};
View.prototype.findAll = function(ch) {
	var found = [];
	for (var dir in directions)
		if (this.look(dir) == ch)
			found.push(dir);
	return found;
};
View.prototype.find = function(ch) {
	var found = this.findAll(ch);
	if (found.length == 0) return null;
	return randomElement(found);
};

(function() {

function Animated(letter) {
    this.letter = letter;
    var outer = (window.__sandbox ? window.__sandbox.output.div : document.body), doc = outer.ownerDocument;
    var node = outer.appendChild(doc.createElement("div"));
    node.style.cssText = "position: relative; width: intrinsic; width: fit-content;";
    this.pre = node.appendChild(doc.createElement("pre"));
    this.pre.appendChild(doc.createTextNode(letter.toString()));
    var self = this;
    this.interval = setInterval(function() { self.tick(); }, 200);
  }
Animated.prototype.tick = function() {
    this.letter.step();
    this.pre.removeChild(this.pre.firstChild);
    this.pre.appendChild(this.pre.ownerDocument.createTextNode(this.letter.toString()));
  };
window.animateChange = function(letter) { new Animated(letter); };
})();
                       


	  
var letC = new LetterChanger(letterA, letterC);
animateChange(letC);
