var Stopwatch = function(elem, options) {

    var timer = createTimer(),
        offset,
        clock,
        interval,
        timermode = "up",
        duration,
        mode,
        scheduledstart;

    // default options
    options = options || {};
    options.delay = options.delay || 1;

    // append elements     
    elem.appendChild(timer);

    // initialize
    reset();

    // private functions
    function createTimer() {
        return document.createElement("span");
    }

    function start() {
        if (!interval) {
            offset   = Date.now();
            interval = setInterval(update, options.delay);
            localStorage.setItem('starttime', offset);
        }
    }

    function restart(starttime) {
        offset = starttime;
        if (!interval) {
            interval = setInterval(update, options.delay);
        }
    }

    function startCountdown(starttime) {
        offset = 0;
        scheduledstart = starttime;
        if (!interval) {
            interval = setInterval(update, options.delay);
        }
        $(".race1 .timer span").addClass("countdown")
    }

    function stop() {
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
        offset = 0;
        localStorage.setItem('starttime', 0);
        scheduledstart = 0;
    }

    function reset() {
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
        clock = 0;
        render();
    }

    function update() {

        clock = Date.now() - offset;
        if (timermode == "down" && offset != 0) {
            clock = duration - clock;
            if (clock < 0) {
                clock = 0;
                stop();
            }
        }
        render();
    }

    function render() {
        var digitmode = 'timer';
        if (offset && offset != 0) { // timer is started
            timer.innerHTML = ('' + clock).toHHMMSS();
        }
        else {
            if (mode && (mode == 'auto' || mode == 'autobeep' || mode == 'launch') && scheduledstart > Date.now()) { // countdown is going 
                digitmode = 'countdown';
                d = new Date(parseInt(scheduledstart));
                n = Date.parse(new Date(d - Date.now()));

                tstr = ('' + n).toHHMMSS();
                timer.innerHTML = tstr;
                if (mode == 'autobeep' || mode == 'launch') {
                    if (tstr == '00:00:10' || tstr == '00:00:20')
                        beep (80);
                    else if (tstr == '00:00:05' || tstr == '00:00:04' || tstr == '00:00:03' || tstr == '00:00:02' || tstr == '00:00:01')
                        beep (100);
                    else if (tstr == '00:00:00')
                        beep (500);
                    else if (tstr == '00:20:00')
                        speakRaceAnnouncement (raceAnnouncement.replace('{minutes}', 20));
                    else if (tstr == '00:11:00')
                        speakRaceAnnouncement ('Tiedotus: Kaikille ajajille pakollinen turvallisuusohjeiden läpikäynti alkaa minuutin kuluttua! Seifti briiffing staats in van minits!');
                    else if (tstr == '00:10:00')
                        speakSafety();
                    else if (tstr == '00:03:00')
                        speakRaceAnnouncement (raceAnnouncement.replace('{minutes}', 5));
                }
            }
            else {
                if (scheduledstart) {
                    offset = scheduledstart;
                    localStorage.setItem('starttime', offset);
                    r1isStarted();
                }
                $(".race1 .timer span").removeClass("countdown")

            }
        }

        if (display) {
            if (display.document)
                if (digitmode == 'timer')
                    display.document.getElementsByTagName("body")[0].innerHTML = '<span class="timer">' + timer.innerHTML + '</span>';
                else
                    display.document.getElementsByTagName("body")[0].innerHTML = '<span class="timer countdown">' + timer.innerHTML + '</span>';
            else
                display = null; // user has closed the window
        }
    }

    function setDuration (ms) {
        duration = ms;
    }

    function setTimermode (mode) {
        timermode = mode;
    }

    function setMode (rmode) {
        mode = rmode;
    }

    function setScheduledStart (racetime) {
        scheduledstart = racetime;
    }

    // public API
    this.start    = start;
    this.restart  = restart;
    this.stop     = stop;
    this.reset    = reset;
    this.setDuration  = setDuration;
    this.setTimermode = setTimermode;
    this.setMode = setMode;
    this.setScheduledStart = setScheduledStart;
    this.startCountdown = startCountdown;

}; // Stopwatch code ends

// HTML5 audio beeper
audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function beep(duration) {
    var oscillator = audioCtx.createOscillator();
    var gainNode = audioCtx.createGain();
    var volume = 1;
    var frequency = 900;
    var type = 'square';

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    gainNode.gain.value = volume;
    oscillator.frequency.value = frequency;
    oscillator.type = type;

    oscillator.start();
  
    setTimeout(
      function(){
        oscillator.stop();
      }, 
      duration
    );  
};

// HTML5 audio beeper ends

// Speak functions
var arr;
var line;

function speakSafety () {
    arr = safetyinstructions.split('#');
    line = 0;
    speakNextLine();
}

function speakRaceAnnouncement (text) {
    responsiveVoice.speak(text, "Finnish Female",  {pitch: 2, rate: 1.5});
}

function speakNextLine () {

    var str = arr[line];
    if (line < arr.length) {
        line++;
        //$('#debug').html(str);
        if (str.length > 0) 
            setTimeout(function(){responsiveVoice.speak(str, "Finnish Female",  {pitch: 2, rate: 1.5, onend: speakNextLine})}, 1000);
        else
            setTimeout(speakNextLine(), 500);
    }
}


function setupok () {
    localStorage.setItem('race1title',     $("#race1title").val());
    localStorage.setItem('race1scheduled', $("#race1scheduled").val());
    localStorage.setItem('race1duration-h',    $("#race1duration-h").val());
    localStorage.setItem('race1duration-m',    $("#race1duration-m").val());
    localStorage.setItem('race1mode',          $("#race1mode").val());
    localStorage.setItem('race1timermode',     $("#race1timermode").val());

    refreshsetup();
}

function refreshsetup () {
    $(".race1 .racetitle").html(localStorage.getItem('race1title'));
    $(".race1 .title").val(localStorage.getItem('race1title'));
    $("#race1scheduled").val(localStorage.getItem('race1scheduled'));
    $("#race1duration-h").val(localStorage.getItem('race1duration-h'));
    $("#race1duration-m").val(localStorage.getItem('race1duration-m'));
    $("#race1mode").val(localStorage.getItem('race1mode'));
    $("#race1timermode").val(localStorage.getItem('race1timermode'));

    ms = (localStorage.getItem('race1duration-h') * 3600 +
        localStorage.getItem('race1duration-m') * 60) * 1000;

    race1timer.setDuration (ms);
    race1timer.setTimermode (localStorage.getItem('race1timermode'));
    race1timer.setMode(localStorage.getItem('race1mode'));

    if (localStorage.getItem('race1mode') == 'manual') {
        $("#startCountdown1").hide();
    }

    if (localStorage.getItem('race1mode') == 'launch') {
        launchSelected ();
    }

    setup1Mode();
}

function r1isStarted () {
  $("#startRace1").hide();
  $("#startCountdown1").hide();
  $("#stopRace1").show();
  $(".race1 .setupbar").hide();
  $("#setup1").hide();
  $("#speaksafety").hide();
  $(".race1 .timer span").removeClass("countdown")

}

function launchSelected () {
  $("#startRace1").hide();
  $("#startCountdown1").hide();
  $("#stopRace1").show();
  $("#speaksafety").hide();
}

function setup1Mode () {
    var mode = $("#race1mode").val();
    var timermode = $("#race1timermode").val();

    if (mode == 'launch') {
        $('.race1 .row.scheduled').hide();
        $('.race1 .row.duration').hide();
        $('.race1 .row.sequence').hide();
    }
    if (mode == 'autolaunch') {
        $('.race1 .row.scheduled').hide();
        $('.race1 .row.duration').hide();
        $('.race1 .row.sequence').show();
    }
    if (mode == 'auto' || mode == 'autobeep') {
        $('.race1 .row.scheduled').show();
        $('.race1 .row.duration').show();
        $('.race1 .row.sequence').hide();
    }
    if (mode == 'manual') {
        $('.race1 .row.scheduled').hide();
        $('.race1 .row.duration').show();
        $('.race1 .row.sequence').hide();
    }
    if (timermode == 'up') {
        $('.race1 .row.duration').hide();
    }
    if (timermode == 'down') {
        $('.race1 .row.duration').show();
    }
}

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this/1000, 10);
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);
    //var ms = Math.floor((this - (sec_num * 1000) - (hours * 3600) - (minutes * 60))/10);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    //if (ms < 10) {ms = "0"+ms;}
    return hours+':' + minutes + ':' + seconds;
}

// UI event handlers
$("#startRace1").click(function() {
  race1timer.start();
  r1isStarted ();
});

$("#startCountdown1").click(function() {
  d = new Date();
  str = d.toISOString().substring(0, 11) + localStorage.getItem('race1scheduled') + 
        ':00.000';
  starttime = Date.parse(new Date(str));
  race1timer.startCountdown(starttime);
});

$("#startLaunch").click(function() {
  d = new Date();
  t = d.getTime() + (20 * 1000);
  starttime = new Date(t);

  race1timer.startCountdown(t);
  launchSelected();
});

$("#stopRace1").click(function() {
  race1timer.stop();
  refreshsetup();
});

$("#setup1").click(function() {
  $(".race1 .setupbar").toggle(500);
});

$("#race1mode").change(function() {
  setup1Mode();
});

$("#race1timermode").change(function() {
  setup1Mode();
});
    
$("#btnclose").click(function() {
  $(".race1 .setupbar").hide(500);
  refreshsetup();
});

$("#btnsetup1ok").click(function() {
  setupok ();
  $(".race1 .setupbar").hide(500);
});

$("#spawndisplay").click(function() {
    display = window.open('', 'timer', 'toolbar=0');
    display.document.write(`<html><head><title>Secondary display</title>
    <style>
    html {
       background: #000;
    }
    .timer {
        font-family: Century Gothic, sans-serif;
        font-size: 25vw;
        width: 100%;
        line-height: 1;
        text-align: left;
        color: #ff0;
        -webkit-margin-before: 0;
        -webkit-margin-after: 0;
    }

    .timer.countdown {
        color: orangered;
    }
    </style>
    </head>
    <body></body>
    </html>
    `);

    return false;
});

// Initializing logic -----------

var display; // Second window/monitor handle
var elem = document.getElementById("stopwatch1");
var race1timer = new Stopwatch(elem, {delay: 1000});

$(".race1 .setupbar").hide();

var now = new Date();

refreshsetup ();

// Check if already started
var starttime = localStorage.getItem('starttime');
if (starttime && starttime != '0') {
        race1timer.restart (starttime);
        r1isStarted();
        refreshsetup();
}
