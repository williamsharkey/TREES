"use strict";

const body = $('body');

let finalTabIndex = 1;

$('focus2').on('focus', () => {
    $('input[tabindex=2]').focus();
});

$('focus1').on('focus', () => {
    $('input[tabindex=${'+finalTabIndex+'}]').focus();
});

body.on('focus', 'input', function(e) {
    play(e.currentTarget.tabIndex - 2);
});

function makebox(e) {
    const box = $("<spool><input maxlength=8>");
    $('canvas').after(box);
    const y = e.pageY;
    const x = e.pageX;
    const w = box.width();
    const h = box.height();
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


body.on('click', makebox).on('click', 'spool', kill);

function makeCanvas() {
    const canvas = $('canvas')[0];
    canvas.width = body.width();
    canvas.height = body.height();
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 0.6;
    ctx.strokestyle = "black";
    ctx.lineJoin = "round";
    return {canvas, ctx};
}

const {canvas,ctx} = makeCanvas();

body.on("mousedown", "spool", drag).on("mouseup", ".draggable", drop);
body.on("mousedown", "input", kill).on("mouseup", ".draggable", kill);

function drag(e) {
    var el = $(e.currentTarget);
    el.attr('unselectable', 'on').addClass('draggable');
    let cleared = false;
    const el_w = $('.draggable').outerWidth(), el_h = $('.draggable').outerHeight();
    body.on("mousemove", e => {
        if ($dragging) {
            if (!cleared) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                cleared = true;
            }
            const y = e.pageY - el_h / 2;
            const x = e.pageX - el_w / 2;
            $dragging.offset({
                top: y,
                left: x
            });
        }
    });
    $dragging = $(e.target);
}

var $dragging = null;

function drop(e) {
    var el = $(e.currentTarget);
    $dragging = null;
    el.removeAttr('unselectable').removeClass('draggable');
    drawLines();
}


function sortH(a, b) {
    const an = a.getBoundingClientRect().top;
    const bn = b.getBoundingClientRect().top;

    if (an > bn) {
        return 1;
    }
    if (an < bn) {
        return -1;
    }
    return 0;
}


function drawLines() {
    const arr = $('spool').sort(sortH).toArray();
    const canvasRect = canvas.getBoundingClientRect();
    const canLeft = canvasRect.left;
    const canTop = canvasRect.top;
    const halfW = arr[0].offsetWidth / 2;
    const H = arr[0].offsetHeight;

    let a = arr[0].getBoundingClientRect();
    arr[0].firstChild.tabIndex = 2;
    ctx.beginPath();
    ctx.moveTo(a.left - canLeft + halfW, a.top - canTop + H - 1);
    for (let i = 1; i < arr.length; i++) {

        arr[i].firstChild.tabIndex = i + 2;
        a = arr[i].getBoundingClientRect();

        ctx.lineTo(a.left - canLeft + halfW, a.top - canTop + 1);
        ctx.moveTo(a.left - canLeft + halfW, a.top - canTop + H - 1);

    }
    finalTabIndex = arr.length + 1;
    ctx.stroke();
}



const audio = new window.AudioContext();


function createOscillator(freq) {
    const attack = 0;
    const decay = 200;
    const gain = audio.createGain();
    const osc = audio.createOscillator();

    gain.connect(audio.destination);
    gain.gain.setValueAtTime(0, audio.currentTime);
    gain.gain.linearRampToValueAtTime(1, audio.currentTime + attack / 1000);
    gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + decay / 1000);

    osc.frequency.value = freq;
    osc.type = "square";
    osc.connect(gain);
    osc.start(0);

    setTimeout(() => {
        osc.stop(0);
        osc.disconnect(gain);
        gain.disconnect(audio.destination);
    }, decay)
}

function int(str, defaultValue) {
    let retValue = defaultValue;
    if(str !== null) {
        if(str.length > 0) {
            if (!isNaN(str)) {
                retValue = parseInt(str);
            }
        }
    }
    return retValue;
}

function play(i) {
    const str = $('input[tabindex=2]').val();
    const scale = int(str, 12);
    const freq = 100 * Math.pow(2, (i - 2) / scale );
    createOscillator(freq);
}