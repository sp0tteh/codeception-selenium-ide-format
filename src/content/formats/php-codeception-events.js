var down = false;
var up = false;

Recorder.addEventHandler('mouseDowns', 'mousedown', function (event) {
    var down = true;

    if (typeof event.target.draggable === 'function') {
        alert('ok');
    }
    /*if ($(event.target).data('draggable')) {
        alert('down');
    }*/

    if (event.button == 0) {
        this.record("mouseDown", this.findLocators(event.target), '');
    }
    if (event.button == 2) {
        this.record("mouseDownRight", this.findLocators(event.target), '');
    }
}, {
    capture : true
});
Recorder.addEventHandler('mouseUps', 'mouseup', function (event) {
    if (event.button == 0) {
        this.record("mouseUp", this.findLocators(event.target), '');
    }
    if (event.button == 2) {
        this.record("mouseUpRight", this.findLocators(event.target), '');
    }
}, {
    capture : true
});