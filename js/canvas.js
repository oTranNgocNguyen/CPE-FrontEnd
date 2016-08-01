// Define a variable to control status of rectange for the field on canvas.
// 0: User have not defined the field.
// 1: User have never drawn rectange for the field on canvas.
// 2: User have drawn rectange for the field on canvas.
var drawStatus = 0;

// Detect only one rectange can manipulate on time. 
var currentRect = {};

// List of rectange.
var lstRect = [];

// Rectange which is editting.
var edittingRect = false;

// Detect rectange can draw/re-draw or not.
var isDraw = false;

// Detect 8 corner that allow resize.
var currentHandle = false;

// Area for corner.
var handlesSize = 8;

// Inside rectange.
var isInside = false;

// Old mouse position.
var prevMousePos;

var canvas = document.getElementById('canvas'),
ctx = canvas.getContext('2d');

// Init currentRect
function initRect() {
	currentRect = {x: 0, y: 0, w: 0, h: 0};
}

// Init
function initCanvas() {
	canvas.addEventListener('mousedown', mouseDown, false);
	canvas.addEventListener('mouseup', mouseUp, false);
	canvas.addEventListener('mousemove', mouseMove, false);
}

// Create point object
function point(x, y) {
	return {
		x: x,
		y: y
	};
}

// Get current position of mouse
function getMousePosition(mouse, canvas)
{
	var rect = canvas.getBoundingClientRect();
	return point(mouse.pageX - rect.left - $(window).scrollLeft(), mouse.pageY - rect.top - $(window).scrollTop());
}

// Check and re-build currentRect after user draw rectange
function buildRectForFirstDraw(mousePos) {
	var w = mousePos.x - currentRect.x;
	var h = mousePos.y - currentRect.y;
	var orientation;
	if (w < 0 && h < 0) {
		orientation = "topleft";
	} else if (w < 0 && h >= 0) {
		orientation = "bottomleft";
	} else if (w >= 0 && h < 0) {
		orientation = "topright";
	} else {
		orientation = "bottomright";
	}

	switch (orientation) {
		case "topleft":
			currentRect.x = mousePos.x;
			currentRect.y = mousePos.y;
			currentRect.w = -w;
			currentRect.h = -h;
			break;
		case "bottomleft":
			currentRect.x = mousePos.x;
			currentRect.y = currentRect.y;
			currentRect.w = -w;
			currentRect.h = h;
			break;
		case "topright":
			currentRect.x = currentRect.x;
			currentRect.y = mousePos.y;
			currentRect.w = w;
			currentRect.h = -h;
			break;
		case "bottomright":
			currentRect.w = w;
			currentRect.h = h;
			break;
	}
}

function dist(p1, p2) {
	return Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y));
}

// Detect mouse is moved to 8 corner that allow resize
function getHandle(mouse) {
	if (dist(mouse, point(currentRect.x, currentRect.y)) <= handlesSize) return 'topleft';
	if (dist(mouse, point(currentRect.x + currentRect.w, currentRect.y)) <= handlesSize) return 'topright';
	if (dist(mouse, point(currentRect.x, currentRect.y + currentRect.h)) <= handlesSize) return 'bottomleft';
	if (dist(mouse, point(currentRect.x + currentRect.w, currentRect.y + currentRect.h)) <= handlesSize) return 'bottomright';
	if (dist(mouse, point(currentRect.x + currentRect.w / 2, currentRect.y)) <= handlesSize) return 'top';
	if (dist(mouse, point(currentRect.x, currentRect.y + currentRect.h / 2)) <= handlesSize) return 'left';
	if (dist(mouse, point(currentRect.x + currentRect.w / 2, currentRect.y + currentRect.h)) <= handlesSize) return 'bottom';
	if (dist(mouse, point(currentRect.x + currentRect.w, currentRect.y + currentRect.h / 2)) <= handlesSize) return 'right';
	return false;
}

// Detect mouse is inside rectange
function detectMouseInsideRect(mouse) {
	if (((currentRect.x < mouse.x) && (mouse.x < (currentRect.x + currentRect.w))) && ((currentRect.y < mouse.y) && (mouse.y < (currentRect.y + currentRect.h)))) {
		return true;
	} else {
		return false;
	}
}

// Build currentRect when user resize rectange
function buildRectForResize(mousePos) {
	switch (currentHandle) {
		case 'topleft':
			currentRect.w += currentRect.x - mousePos.x;
			currentRect.h += currentRect.y - mousePos.y;
			currentRect.x = mousePos.x;
			currentRect.y = mousePos.y;
			break;
		case 'topright':
			currentRect.w = mousePos.x - currentRect.x;
			currentRect.h += currentRect.y - mousePos.y;
			currentRect.y = mousePos.y;
			break;
		case 'bottomleft':
			currentRect.w += currentRect.x - mousePos.x;
			currentRect.x = mousePos.x;
			currentRect.h = mousePos.y - currentRect.y;
			break;
		case 'bottomright':
			currentRect.w = mousePos.x - currentRect.x;
			currentRect.h = mousePos.y - currentRect.y;
			break;

		case 'top':
			currentRect.h += currentRect.y - mousePos.y;
			currentRect.y = mousePos.y;
			break;

		case 'left':
			currentRect.w += currentRect.x - mousePos.x;
			currentRect.x = mousePos.x;
			break;

		case 'bottom':
			currentRect.h = mousePos.y - currentRect.y;
			break;

		case 'right':
			currentRect.w = mousePos.x - currentRect.x;
			break;
	}
}

// Build mouse pointer when user resize rectange
function buildMousePointerForResize() {
	var posHandle = point(0, 0);
	switch (currentHandle) {
		case 'topleft':
			posHandle.x = currentRect.x;
			posHandle.y = currentRect.y;
			break;
		case 'topright':
			posHandle.x = currentRect.x + currentRect.w;
			posHandle.y = currentRect.y;
			break;
		case 'bottomleft':
			posHandle.x = currentRect.x;
			posHandle.y = currentRect.y + currentRect.h;
			break;
		case 'bottomright':
			posHandle.x = currentRect.x + currentRect.w;
			posHandle.y = currentRect.y + currentRect.h;
			break;
		case 'top':
			posHandle.x = currentRect.x + currentRect.w / 2;
			posHandle.y = currentRect.y;
			break;
		case 'left':
			posHandle.x = currentRect.x;
			posHandle.y = currentRect.y + currentRect.h / 2;
			break;
		case 'bottom':
			posHandle.x = currentRect.x + currentRect.w / 2;
			posHandle.y = currentRect.y + currentRect.h;
			break;
		case 'right':
			posHandle.x = currentRect.x + currentRect.w;
			posHandle.y = currentRect.y + currentRect.h / 2;
			break;
	}
	ctx.globalCompositeOperation = 'xor';
	ctx.beginPath();
	ctx.arc(posHandle.x, posHandle.y, handlesSize, 0, 2 * Math.PI);
	ctx.fill();
	ctx.globalCompositeOperation = 'source-over';
}

function buildRectForMove(mousePos) {
	var w = mousePos.x - prevMousePos.x;
	var h = mousePos.y - prevMousePos.y;
	currentRect.x = currentRect.x + w;
	if (currentRect.x < 0) {
		currentRect.x = 0;
	} else if (currentRect.x > canvas.width - currentRect.w) {
		currentRect.x = canvas.width - currentRect.w;
	}
	
	currentRect.y = currentRect.y + h;
	if (currentRect.y < 0) {
		currentRect.y = 0;
	} else if (currentRect.y > canvas.height - currentRect.h) {
		currentRect.y = canvas.height - currentRect.h;
	}
}

// Check and re-build currentRect after user resize rectange
function buildRectAfterResize() {
	if (currentRect.w < 0) {
		currentRect.w = -currentRect.w;
		currentRect.x = currentRect.x - currentRect.w;
	}
	if (currentRect.h < 0) {
		currentRect.h = -currentRect.h;
		currentRect.y = currentRect.y - currentRect.h;
	}
}

// Mousedown event
function mouseDown(e) {
	switch (drawStatus) {
		case 1:
			var mousePos = getMousePosition(e, this);
			currentRect.x = mousePos.x;
			currentRect.y = mousePos.y;
			isDraw = true;
			break;
		case 2:
			if (currentHandle) {
				isDraw = true;
			} else {
				if (isInside) {
					prevMousePos = getMousePosition(e, this);
					isDraw = true;
				}
			}
	}
	draw();
}

// Mouseup event
function mouseUp(e) {
	switch (drawStatus) {
		case 1:
			var mousePos = getMousePosition(e, this);
			buildRectForFirstDraw(mousePos);
			drawStatus = 2;
			break;
		case 2:
			if (currentHandle) {
				buildRectAfterResize();
			}
			currentHandle = false;
	}
	isDraw = false;
	draw();
}

// Mousemove event
function mouseMove(e) {
	var mousePos;
	switch (drawStatus) {
		case 1:
			mousePos = getMousePosition(e, this);
			if (isDraw) {
				currentRect.w = mousePos.x - currentRect.x;
				currentRect.h = mousePos.y - currentRect.y;
				draw();
			}
			//console.log("x:" + currentRect.x + ", y:" + currentRect.y + ", w:" + currentRect.w + ", h:" + currentRect.h);
			break;
		case 2:
			mousePos = getMousePosition(e, this);
			var previousHandle = currentHandle;
			if (!isDraw) {
				currentHandle = getHandle(mousePos);
			}
			isInside = detectMouseInsideRect(mousePos);
			if (!currentHandle && isInside) {
				canvas.style.cursor = "all-scroll";
			} else {
				canvas.style.cursor = "default";
			}
			
			if (isDraw) {
				if (currentHandle) {
					buildRectForResize(mousePos);
				} else {
					if (isInside) {
						buildRectForMove(mousePos);
						prevMousePos = mousePos;
					}
				}
			}
			if (isDraw || currentHandle != previousHandle) {
				draw();
			}
	}
}

// Draw
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#FF0000";
    for (var i = 0; i < lstRect.length; i++) {
        ctx.strokeRect(lstRect[i].rect.x, lstRect[i].rect.y, lstRect[i].rect.w, lstRect[i].rect.h);
    }
	ctx.strokeRect(currentRect.x, currentRect.y, currentRect.w, currentRect.h);
	if (drawStatus == 2) {
		if (currentHandle) {
			buildMousePointerForResize();
		}
	}
}

// Check coordination is set or not
function checkCoordinationIsSet(id) {
	var isSet = false;
	for (var i = 0; i < lstRect.length; i++) {
		if (lstRect[i].id == id) {
			isSet = true;
			break;
		}
    }
	return isSet;
};

// Get rectange by id for edit function
function getRectangeForEdit (id) {
	for (var i = 0; i < lstRect.length; i++) {
		if (lstRect[i].id == id) {
			currentRect = lstRect[i].rect;
			edittingRect = {'id': id, 'rect': {x: currentRect.x, y: currentRect.y, w: currentRect.w, h: currentRect.h}};
		}
    }
	removeItemOutOfRectList(id);
	draw();
}

// Remove an item out of rectange lists
function removeItemOutOfRectList (id) {
	lstRect = lstRect.filter(function(item){
		return item.id != id; 
	});
}

// Build rectange lists
function buildRectList (id, isCancel) {
	var rect;
	drawStatus = 0;
	if (isCancel) {
		if (edittingRect) {
			lstRect.push(edittingRect);
		}
		clearCurrentRect();
	} else {
		rect = {'id': id, 'rect': currentRect};
		lstRect.push(rect);
		initRect();
	}
	edittingRect = false;
}

// Clear current rectange and re-draw
function clearCurrentRect() {
	initRect();
	draw();
};

initCanvas();