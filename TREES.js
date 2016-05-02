/**
 * Created by wm on 5/1/16.
 */
$('focus2').on('focus', function() {
    // "last" focus guard got focus: set focus to the first field
    $('input[tabindex=2]').focus();

});

var finalTabIndex = 1;

$('focus1').on('focus', function() {
    console.log("try to focus on " + finalTabIndex);
    // "first" focus guard got focus: set focus to the last field
    $('input[tabindex=' + finalTabIndex + ']').focus();
});

$('body').on('focus', 'input', function() {
    play(this.tabIndex - 2);
});

function makebox(e) {

    var box = $("<div><input maxlength=8>");

    $('canvas').after(box);

    var y = e.pageY;

    var x = e.pageX;

    var w = box.width();

    var h = box.height();

    box.offset({
        top: y - h / 2,
        left: x - w / 2
    });


    ctx.clearRect(0, 0, c.width, c.height);

    drawLines();

    box.focus();
}

function kill(e) {

    e.stopPropagation();

}


var body = $('body');

body.on('click', makebox);

body.on('click', 'input', kill);

var c = $('canvas')[0];
c.width = $('body').width();
c.height = $('body').height();
var ctx = c.getContext("2d");
ctx.lineWidth = 0.6;
// ctx.lineCap = "round";
// ctx.strokeStyle = "#524E73";
ctx.strokestyle = "black";
ctx.lineJoin = "round";
//ctx.setLineDash([10, 15]);



function drag2(e) {
    $(this).attr('unselectable', 'on').addClass('draggable');
    var cleared = false;
    var el_w = $('.draggable').outerWidth(),
        el_h = $('.draggable').outerHeight();
    $('body').on("mousemove", function(e) {

        if ($dragging) {
            if (!cleared) {
                ctx.clearRect(0, 0, c.width, c.height);
                cleared = true;
            }
            var y = e.pageY - el_h / 2;
            var x = e.pageX - el_w / 2;
            $dragging.offset({
                top: y,
                left: x
            });

        }
    });
    $dragging = $(e.target);
}

function sortH(a, b) {
    var an = a.getBoundingClientRect().top;
    var bn = b.getBoundingClientRect().top;

    if (an > bn) {
        return 1;
    }
    if (an < bn) {
        return -1;
    }
    return 0;
}

function drawLines() {
    var arr = $('input').sort(sortH).toArray();
    var canvasRect = c.getBoundingClientRect();
    var canLeft = canvasRect.left;
    var canTop = canvasRect.top;
    var halfW = arr[0].offsetWidth / 2;
    var H = arr[0].offsetHeight;

    var a = arr[0].getBoundingClientRect();
    arr[0].tabIndex = 2;
    ctx.beginPath();
    ctx.moveTo(a.left - canLeft + halfW, a.top - canTop + H - 1);
    for (var i = 1; i < arr.length; i++) {

        arr[i].tabIndex = i + 2;
        a = arr[i].getBoundingClientRect();

        ctx.lineTo(a.left - canLeft + halfW, a.top - canTop + 1);
        ctx.moveTo(a.left - canLeft + halfW, a.top - canTop + H - 1);

    }
    finalTabIndex = arr.length + 1;
    ctx.stroke();
}

function drop2(e) {
    $dragging = null;
    $(this).removeAttr('unselectable').removeClass('draggable');
    drawLines();
}




var $dragging = null;

$('body').on("mousedown", "input", drag2).on("mouseup", ".draggable", drop2);




var audio = new window.AudioContext();

//setInterval(play, 1000 / 4);

function createOscillator(freq) {
    var attack = 0;
    var decay = 200;
    var gain = audio.createGain();
    var osc = audio.createOscillator();

    gain.connect(audio.destination);
    gain.gain.setValueAtTime(0, audio.currentTime);
    gain.gain.linearRampToValueAtTime(1, audio.currentTime + attack / 1000);
    gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + decay / 1000);

    osc.frequency.value = freq;
    osc.type = "square";
    osc.connect(gain);
    osc.start(0);

    setTimeout(function() {
        osc.stop(0);
        osc.disconnect(gain);
        gain.disconnect(audio.destination);
    }, decay)
}

function TryParseInt(str,defaultValue) {
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

function play(i) {
    var str = $('input[tabindex=2]').val();
    var scale = TryParseInt(str, 12);
    createOscillator(100 * Math.pow(2, (i - 2) / scale ));
}