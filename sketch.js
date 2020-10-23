// Tone.context.latencyHint = "playback";

let DRUM_CENTER;
let TWO_PI;
const SCALE = teoria.note("a").scale("major");

let distortionAmount = 0;
let chordIndex = 0;
let chordNoteIndex = 0;
let voiceIndex = 0;
let octaveMultiplier = 0.5;
let isMouseHeld = false;

const notes = SCALE.notes();
let pressCircleRadius = 50;

let destinationGain = 0.2;
const DESTINATION_OUTPUT = new Tone.Gain(destinationGain).receive(
  "SYNTH_OUTPUT"
);

const VOICES = [0, 1, 2].map((_) => new Synth());

const isMouseInRange = () => mouseY > 150 && mouseY < height - 150;

const kit = new Tone.Players({
  lo: "samples/mt800_tomlo.wav",
  md: "samples/mt800_tommd.wav",
  hi: "samples/mt800_tomhi.wav",
  bd: "samples/mt800_bd.wav",
  hhc: "samples/mt800_hhc.wav",
  sd: "samples/mt800_sd.wav",
});

// Set up master effects
const compressor = new Tone.Compressor({});
const distortion = new Tone.Distortion({ distortion: 0 });
const reverb = new Tone.Freeverb({ wet: 0 });
const gain = new Tone.Gain({ gain: 1 });
const split = new Tone.MultibandSplit();

const synthDistortion = new Tone.Distortion({ distortion: 0.5, wet: 0 });
const synthReverb = new Tone.JCReverb({ wet: 0 });
const synthDelay = new Tone.FeedbackDelay({ wet: 0, feedback: 0.9 });
const synthLpFilter = new Tone.Filter(20000, "lowpass");

const finalOutput = new Tone.Gain(0.4);
finalOutput.chain(new Tone.Limiter(-2), Tone.Master);

// Make low frequencies mono to make reverb effect bearable in headphones
split.low.chain(new Tone.Mono(), finalOutput);
split.mid.chain(finalOutput);
split.high.chain(finalOutput);

kit.chain(distortion, reverb, gain, compressor, split);

DESTINATION_OUTPUT.chain(
  synthDistortion,
  synthDelay,
  synthReverb,
  synthLpFilter,
  new Tone.Compressor(),
  new Tone.Limiter(-30),
  finalOutput
);

const toggleTransport = () => {
  Tone.context.resume();
  Tone.Transport.toggle();
  if (Tone.Transport.state === "stopped") {
    VOICES.forEach((voice) => {
      voice.triggerRelease();
    });
  }
  $("#toggle-play").toggleClass("is-playing");
};

$("#toggle-play").on("click", () => {
  toggleTransport();
});

const DRUM_KIT = [
  { label: "Hat", sample: "hhc", color: [234, 190, 14], hue: 45 },
  { label: "Snare", sample: "sd", color: [224, 10, 100], hue: 349 },
  { label: "Kick", sample: "bd", color: [224, 132, 13], hue: 243 },
  { label: "Tom hi", sample: "hi", color: [42, 234, 157], hue: 145 },
  { label: "Tom md", sample: "md", color: [59, 128, 247], hue: 204 },
  { label: "Tom lo", sample: "lo", color: [190, 23, 237], hue: 250 },
];

drumTracks = DRUM_KIT.map((track) => ({
  ...track,
  loop: null,
  loopInterval: 1,
  divisions: 1,
  isMuted: false,
  waveform: new Tone.Waveform(SAMPLE_RATE),
}));

const getChord = (i) => [
  SCALE.get(i).fq(),
  SCALE.get(i + 2).fq(),
  SCALE.get(i + 4).fq(),
  SCALE.get(i + 6).fq(),
];

const playVoice = (note, time) => {
  if (Tone.Transport.state === "stopped") return;
  // const voices = [synth, synth1, synth2];
  // const prevIndex = voiceIndex;
  // VOICES[voiceIndex].triggerRelease(note);
  voiceIndex++;
  voiceIndex = voiceIndex % VOICES.length;
  VOICES[voiceIndex].triggerAttack(note);
};

Tone.Transport.scheduleRepeat((time) => {
  if (isMouseInRange() && mouseIsPressed) {
    return;
  }

  const chord = getChord(chordIndex);
  // synth.triggerAttack(chord[chordNoteIndex] * octaveMultiplier, time);
  playVoice(chord[chordNoteIndex] * octaveMultiplier, time);

  // synth1.triggerAttackRelease(
  //   chord[chordNoteIndex] * octaveMultiplier,
  //   0.1,
  //   time
  // );
  // chordNoteIndex++;
  // chordNoteIndex = chordNoteIndex % chord.length;

  // synth2.triggerAttackRelease(
  //   chord[chordNoteIndex] * octaveMultiplier,
  //   0.1,
  //   time
  // );
  chordNoteIndex++;
  chordNoteIndex = chordNoteIndex % chord.length;
}, "8n");

function setup() {
  createCanvas(window.innerWidth, window.innerHeight - 200);
  rectMode(CENTER);

  DRUM_CENTER = { X: width / 2, Y: height / 2 };
  TWO_PI = 2 * PI;

  initDrumUI();
  initSynthUI(VOICES);

  drumTracks.forEach(
    ({ sample, loopInterval: initialInterval, waveform }, i) => {
      const loop = new Tone.Loop((time) => {
        const { divisions, loopInterval } = drumTracks[i];
        const timeUnit = loopInterval / divisions;
        for (let i = 0; i < divisions; i++) {
          kit.get(sample).connect(waveform);
          kit.get(sample).start(time + i * timeUnit);
        }
      }, initialInterval).start();
      drumTracks[i].loop = loop;
    }
  );
}

// Draw circle representing loop
function drawCircle(trackIndex) {
  const { hue, color, loop, divisions, loopInterval } = drumTracks[trackIndex];
  const { progress } = loop;
  const r = (TWO_PI / (1 / loopInterval)) * 40;

  const currTheta = progress * TWO_PI;
  const sliceTheta = TWO_PI / divisions;
  const stepProgress = (currTheta % sliceTheta) / sliceTheta;
  const size = 14 - stepProgress * 8;

  push();
  strokeWeight(6 - stepProgress * 4);
  const c = `hsla(${hue}, 50%, 50%, ${(50 - stepProgress * 50) / 255})`;
  stroke(c);
  circle(DRUM_CENTER.X, DRUM_CENTER.Y, r);
  // translate(DRUM_CENTER.X, DRUM_CENTER.Y);
  // beginShape();
  // let waveform1 = drumTracks[trackIndex].waveform.getValue();

  // let theta = 0;
  // for (let i = 0; i < SAMPLE_RATE; i++) {
  //   let ampl = map(waveform1[i], -1, 1, 0, width);
  //   vertex((cos(theta) * ampl) / 5, (sin(theta) * ampl) / 5);
  //   theta += 360 / SAMPLE_RATE;
  // }
  // endShape();
  // noStroke();
  pop();
}

// Spokes represent loop divisions
function drawSpokes(trackIndex) {
  const { color, loop, divisions, hue } = drumTracks[trackIndex];
  const { progress } = loop;
  const currTheta = progress * TWO_PI;
  const sliceTheta = TWO_PI / divisions;
  const stepProgress = (currTheta % sliceTheta) / sliceTheta;

  for (let i = 0; i < divisions; i++) {
    const startTheta = TWO_PI * (i / divisions);
    const endTheta = TWO_PI * ((i + 1) / divisions);
    const isActive = currTheta >= startTheta && currTheta < endTheta;
    const opacity = isActive ? 220 - stepProgress * 150 : 50;
    const rectWidth = isActive ? 12 - stepProgress * 10 : 2;
    const rectHeight = Math.max(width, height);
    const rectWidthWithDistortion =
      distortionAmount > 1
        ? rectWidth * random(-distortionAmount, distortionAmount)
        : rectWidth;

    push();
    const c = `hsla(${hue}, 50%, 50%, ${opacity / 255})`;
    fill(c);
    translate(DRUM_CENTER.X, DRUM_CENTER.Y);
    rotate(TWO_PI * (i / divisions));
    rect(0, -rectHeight / 2, rectWidthWithDistortion, rectHeight);
    pop();
  }
}

// Dots show progress around the loop
function drawDot(trackIndex) {
  const { color, loop, divisions, loopInterval, hue } = drumTracks[trackIndex];
  const { progress } = loop;
  const r = (TWO_PI / (1 / loopInterval)) * 40;
  const currTheta = progress * TWO_PI;
  const sliceTheta = TWO_PI / divisions;
  const stepProgress = (currTheta % sliceTheta) / sliceTheta;
  const size = 14 - stepProgress * 8;

  push();
  noStroke();
  const c = `hsla(${hue}, 80%, 70%, ${(255 - stepProgress * 230) / 255})`;
  fill(c);
  translate(DRUM_CENTER.X, DRUM_CENTER.Y);
  rotate(progress * TWO_PI);
  ellipse(0, r / -2, size, size);
  pop();
}

function drawWaveforms(waveform) {
  oscAnalyzers.forEach((analyzer, i) => {
    push();
    if (i === 0) {
      translate(width / 4, height / 4);
    }
    if (i === 1) {
      translate(width / 4, height - height / 4);
    }
    if (i === 2) {
      translate(width - width / 4, height / 4);
    }
    if (i === 3) {
      translate(width - width / 4, height - height / 4);
    }
    strokeWeight(1);
    noFill();
    beginShape();
    const c = `hsl(${((i / 4) * 60 - 20 + 360) % 360}, 50%, 50%)`;
    stroke(c);
    let waveform1 = analyzer.getValue();

    let theta = 0;
    for (let i = 0; i < SAMPLE_RATE; i++) {
      let ampl = map(waveform1[i], -1, 1, 0, width);
      let y = sin(frameCount) * 500 + 100;
      const r = Math.sqrt(ampl);
      vertex((cos(theta) * ampl) / 10, (sin(theta) * ampl) / 10);
      theta += 360 / SAMPLE_RATE;
    }
    endShape();
    pop();
  });
}

function draw() {
  background(33);
  strokeWeight(2);
  fill(100);
  noStroke();
  noFill();
  // Draw spokes first
  for (let i = 0; i < drumTracks.length; i++) {
    if (!drumTracks[i].isMuted) {
      drawSpokes(i);
    }
  }
  // Then circles
  for (let i = 0; i < drumTracks.length; i++) {
    if (!drumTracks[i].isMuted) {
      drawCircle(i);
    }
  }
  // Dots on top
  for (let i = 0; i < drumTracks.length; i++) {
    if (!drumTracks[i].isMuted) {
      drawDot(i);
    }
  }

  // =============== SYNTH ======================
  fill(244);
  const w = width / 2 / notes.length;

  // rect(width - width / 4, height / 2, width / 2, height);
  push();
  // translate(width / 2, 0);
  rectMode(CORNER);
  noStroke();
  for (let i = 0; i < notes.length * 2; i++) {
    // fill(10 * i + 100, 20);
    if (chordIndex === i + 1) {
      fill(200, 40);
      rect(i * w, 0, w + 1, height);
    }
  }
  pop();

  drawWaveforms();

  const circleColor = mouseIsPressed ? 0 : 255;
  fill(circleColor, 100);
  fill(circleColor);
  blendMode(SOFT_LIGHT);
  circle(mouseX, mouseY, pressCircleRadius);
  blendMode(BLEND);

  if (isMouseHeld) {
    pressCircleRadius++;
  } else {
    pressCircleRadius = 50;
  }
}

function mouseMoved() {
  if (isMouseInRange()) {
    const percent = mouseX / width;
    chordIndex = parseInt(percent * notes.length * 2) + 1;
  }
}

function mouseDragged(e) {
  if (isMouseHeld) {
    const yPercent = (height - mouseY) / height;
    const xPercent = mouseX / width;
    const freq = Math.pow(2, yPercent * 5 + 8);

    synthLpFilter.frequency.value = freq;
    synthReverb.set("roomSize", xPercent);
  }
}

function mousePressed() {
  if (isMouseInRange()) {
    isMouseHeld = true;
    synthDelay.wet.rampTo(1, 2);
    synthReverb.wet.rampTo(1, 3);
    synthReverb.set("roomSize", 0);
    synthDistortion.wet.rampTo(1, 2);
  }
}

function mouseReleased() {
  if (isMouseHeld) {
    isMouseHeld = false;
    synthDelay.wet.rampTo(0, 0.5);
    synthDistortion.wet.rampTo(0, 0.5);
    synthLpFilter.frequency.value = 20000;
    synthReverb.wet.rampTo(0, 0.5);
  }
}

function keyPressed() {
  // Change octave
  if (key === "z") {
    octaveMultiplier = Math.max(octaveMultiplier / 2, 0.25);
  }
  if (key === "x") {
    octaveMultiplier = Math.min(octaveMultiplier * 2, 4);
  }

  // play/pause
  if (key === " ") {
    toggleTransport();
  }
}
