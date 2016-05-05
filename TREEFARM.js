"use strict";

var body = $('body');

var finalTabIndex = 1;

var showBoundBox = false;

var showCone = true;

$('focus2').on('focus', ForwardWrap);

function ForwardWrap() {
    $('input[tabindex=2]').focus();
}

$('focus1').on('focus', backwardsWrap);

function backwardsWrap() {
    $('input[tabindex=' + finalTabIndex + ']').focus();
}

var tabFocus = false;

body.on('focus', 'input', function(e) {
    if (!tabFocus) {
        play(e.currentTarget.tabIndex - 2, e.currentTarget.getBoundingClientRect().left);
    }
    tabFocus = false;
});

function makeBox(e) {
    var box = $("<spool><input maxlength=8>");
    $('canvas').after(box);
    var y = e.pageY;
    var x = e.pageX;
    var w = box.width();
    var h = box.height();
    box.offset({
        top: y - h / 2,
        left: x - w / 2
    });
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLines();
    box.focus();
}

function kill(e) {
    e.stopPropagation();
}

window.onfocus = markTabFocused;

function markTabFocused(e) {
    tabFocus = true;
}

body.on('click', makeBox).on('click', 'spool', kill);

function preventFocusSteal(e) {
    e.preventDefault();
}

body.on('mousedown', 'spool', preventFocusSteal);

body.keypress(function(e) {
    if(e.which == 13) {
        $(':focus').blur().focus();
    }
});

function makeCanvas() {
    var canvas = $('canvas')[0];
    canvas.width = body.width();
    canvas.height = body.height();
    var ctx = canvas.getContext("2d");
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";
    ctx.lineJoin = "round";
    return {canvas, ctx};
}

var {canvas,ctx} = makeCanvas();

body.on("mousedown", "spool", drag).on("mouseup", ".draggable", drop);
body.on("mousedown", "input", kill).on("mouseup", ".draggable", kill);

function drag(e) {
    var el = $(e.currentTarget);
    el.attr('unselectable', 'on').addClass('draggable');

    body.on("mousemove", mouseMoveDrag);

    function mouseMoveDrag(e) {
        if ($dragging) {
            var y = e.pageY + offTop;
            var x = e.pageX + offLeft;
            $dragging.offset({
                top: y,
                left: x
            });
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawLines();
        }
    }

    $dragging = el;
    var dOff = $dragging.offset();
    var offTop = dOff.top - e.pageY;
    var offLeft = dOff.left - e.pageX;
    //console.log({offTop:offTop, offLeft:offLeft});

}

var $dragging = null;

function drop(e) {
    var el = $(e.currentTarget);
    $dragging = null;
    el.removeAttr('unselectable').removeClass('draggable');
}


function sortH(a, b) {
    var an = a.getElementsByTagName('input')[0].getBoundingClientRect().top;
    var bn = b.getElementsByTagName('input')[0].getBoundingClientRect().top;

    if (an > bn) {
        return 1;
    }
    if (an < bn) {
        return -1;
    }
    return 0;
}


function drawBoundBox(el, center, radius, i, n) {

    ctx.beginPath();
    var topOfInput = Math.round(center.y - radius) + 0.5;
    ctx.moveTo(0, topOfInput);
    ctx.lineTo(canvas.width, topOfInput);
    ctx.strokeStyle = "hsl(" + (360*i/n) + ",80%,86%)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    var botOfInput = Math.round(center.y + radius) - 0.5;
    ctx.moveTo(0, botOfInput);
    ctx.lineTo(canvas.width, botOfInput);
    ctx.stroke();

    ctx.beginPath();
    var leftOfInput = Math.round(center.x - radius) + 0.5;
    ctx.moveTo(leftOfInput, 0);
    ctx.lineTo(leftOfInput, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    var rightOfInput = Math.round(center.x + radius) - 0.5;
    ctx.moveTo(rightOfInput, 0);
    ctx.lineTo(rightOfInput, canvas.height);
    ctx.stroke();

}

function drawLines() {
    var arr = $('spool').sort(sortH).toArray();
    var canvasRect = canvas.getBoundingClientRect();
    var len = arr.length;

    for (var i = 0; i < len; i++) {

        var n = arr[i].getElementsByTagName('input')[0];
        var el = n.getBoundingClientRect();
        var radius = n.offsetWidth/2;

        var center =
        {
            x: el.left - canvasRect.left + radius,
            y: el.top - canvasRect.top + radius
        };

        n.tabIndex = i + 2;

        if (i > 0) {
            ctx.lineTo(center.x, center.y - radius);
            ctx.stroke();
        }
        if (showBoundBox)
            drawBoundBox(el, center, radius, i, len);

        if (showCone)
            drawCone(center, radius, center.y/canvas.height, 2, 6);

        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.moveTo(center.x, center.y + radius);

    }
    finalTabIndex = arr.length + 1;
    ctx.stroke();
}

function drawCone(center, radius, sweep, holdoff, reach) {
    var ang = sweep*Math.PI;
    var halfPI = Math.PI * 0.5;

    var dy = -Math.sin(-ang - halfPI)*radius;
    var dx = -Math.cos(ang -halfPI)*radius;
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius*holdoff, - ang - halfPI, ang - halfPI);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(center.x+dx*holdoff, center.y-dy*holdoff);
    ctx.lineTo(center.x+dx*reach, center.y-dy*reach);
    ctx.stroke();


    ctx.beginPath();
    ctx.arc(center.x, center.y, radius*reach,   - ang - halfPI, ang - halfPI);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(center.x-dx*holdoff, center.y-dy*holdoff);
    ctx.lineTo(center.x-dx*reach, center.y-dy*reach);
    ctx.stroke();
}

var audio = new webkitAudioContext();


function createOscillator(freq, decay) {
    var attack = 0;
    //var decay = 700;
    var volume = 0.05;
    var gain = audio.createGain();
    var osc = audio.createOscillator();

    gain.connect(audio.destination);
    gain.gain.setValueAtTime(0, audio.currentTime);
    gain.gain.linearRampToValueAtTime(volume, audio.currentTime + attack / 1000);
    gain.gain.exponentialRampToValueAtTime(volume * 0.01, audio.currentTime + decay / 1000);

    osc.frequency.value = freq;
    osc.type = "square";
    osc.connect(gain);
    osc.start(0);

    setTimeout(audioTimeout, decay)
    function audioTimeout() {
        osc.stop(0);
        osc.disconnect(gain);
        gain.disconnect(audio.destination);
    }
}

function int(str, defaultValue) {
    var retValue = defaultValue;
    if(str !== null) {
        if(str.length > 0) {
            if (!isNaN(str)) {
                retValue = parseInt(str);
            }
        }
    }
    return retValue;
}

function play(i , decay) {
    var str = $('input[tabindex=2]').val();
    var scale = int(str, 12);
    var freq = 100 * Math.pow(2, (i - 2) / scale );
    createOscillator(freq, decay);
}