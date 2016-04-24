import d3 from 'd3';

const width = 400,
  height = 400,
  radius = width / 2;

d3.select('.app-container')
  .style('width', width + 'px');

d3.select('.svg-container')
  .style('width', width + 'px')
  .style('height', height + 'px');

d3.select('#seconds-left')
  .style('top', (width / 2) + 'px');

const π = Math.PI;

const arc = d3.svg.arc();
arc.startAngle(0);
arc.endAngle(2*π);
arc.outerRadius(radius);
arc.innerRadius(radius - 20);

const svg = d3.select('.svg-container')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

const arcGroup = svg
  .append('g')
  .attr('transform', `translate(${width / 2}, ${height / 2})`)

// pink circle that gets revealed as timer counts down
arcGroup
  .append('path')
  .attr('d', arc)
  .attr('fill', '#faa');

// white circle/arc that disappears as timer counts down
const arcPath = arcGroup
  .append('path')
  .attr('d', arc)
  .attr('fill', '#eee');

// either counting down or paused
let timerInUse = false;
// toggled to true if reset occurs while timerInUse is true
// ends the cycling
let isBeingReset = false;
// if paused
let isPaused = false;
let startTimestamp;
let endTimestamp;
let pauseStartTimestamp;
let pauseEndTimestamp;

function startTimer(){
  if (!(getNumberOfSecondsFromDOM() > 0)) return;

  d3.select('#input-seconds').attr('disabled', true);
  d3.select('#start-pause-btn').html('Pause');

  timerInUse = true;
  startTimestamp = Date.now();
  endTimestamp = startTimestamp + (getNumberOfSecondsFromDOM() * 1000);

  function nextCycle(){
    setTimeout(_ => {
      if (isBeingReset) {
        isBeingReset = false;
        return;
      }

      if (!isPaused) {
        let currentTimestamp = Date.now();
        if (currentTimestamp >= endTimestamp) {
          arc.startAngle(2 * π);
          arcPath.attr('d', arc);
          d3.select('#seconds-left').text(0 + ' s');
          timerInUse = false;
          disableStartPauseBtn();
          return;
        } else {
          let proportionCompleted = (currentTimestamp - startTimestamp) / (endTimestamp - startTimestamp);
          arc.startAngle(proportionCompleted * 2 * π);
          arcPath.attr('d', arc);
          d3.select('#seconds-left').text(Math.ceil((endTimestamp - currentTimestamp) / 1000) + ' s');
        }
      }

      nextCycle();

    }, 10);
  };

  nextCycle();
}

function disableStartPauseBtn(){
  d3.select('#start-pause-btn').attr('disabled', true);
}

function resetTimer(){
  timerInUse = false;
  isPaused = false;

  arc.startAngle(0);
  arcPath.attr('d', arc);

  d3.select('#seconds-left').text('');
  d3.select('#start-pause-btn').html('Start');
  d3.select('#input-seconds').attr('disabled', null);
  d3.select('#start-pause-btn').attr('disabled', null);
  d3.select('#input-seconds').property('value', '')[0][0].focus();
}

function pauseTimer(){
  d3.select('#start-pause-btn').html('Start');
  pauseStartTimestamp = Date.now();
  isPaused = true;
}

function unPauseTimer(){
  d3.select('#start-pause-btn').html('Pause');
  pauseEndTimestamp = Date.now();
  const pauseDuration = pauseEndTimestamp - pauseStartTimestamp;
  startTimestamp += pauseDuration;
  endTimestamp += pauseDuration;
  isPaused = false;
}

function isEnter(event){
  return event.which === 13;
}

function isSpaceBar(event){
  return event.which === 32;
}

function getNumberOfSecondsFromDOM(){
  return Number(d3.select('#input-seconds').property('value'));
}

// event binding

document.getElementById('input-seconds')
  .addEventListener('keydown', e => {
    if (isEnter(e)) startTimer();
  });

document.getElementById('start-pause-btn')
  .addEventListener('click', _ => {
    if (!timerInUse) return startTimer();
    if (!isPaused) return pauseTimer();
    if (isPaused) return unPauseTimer();
  });

document.getElementById('reset-btn')
  .addEventListener('click', _ => {
    if (timerInUse) isBeingReset = true;
    resetTimer();
  });

document.body
  .addEventListener('keydown', e => {
    if (isSpaceBar(e) && timerInUse) isPaused ? unPauseTimer() : pauseTimer();
  });

// start with focus on input for # of seconds
document.getElementById('input-seconds').focus();
