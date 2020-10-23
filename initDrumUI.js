const initDrumUI = () => {
  // Create the colored controller for each track
  drumTracks.forEach(({ color, isMuted, hue, label }, i) => {
    $(".color-controls").append(
      // `<div class="color-control" style="background: rgb(${color[0]},${
      //   color[1]
      // },${color[2]});">
      `<div class="color-control" style="background: hsl(${hue}, 50%, 50%);">
      <span>
        <label class="container">
          <input class="mute-toggle" data-track=${i} type="checkbox" checked=${!isMuted}>
          <span class="checkmark"></span>
        </label>
      </span>
      <span class="drum-track-title">
        ${label}
      </span>
      <div class="slider-wrapper">
        <input class="track-slider" type="range" data-track=${i} value="50" data-target="playbackRate" min="20" max="100"/>
        <label>Radius</label>
      </div>
      <div class="slider-wrapper">
        <input class="track-slider" type="range" data-track=${i} value="1" data-target="divisions" min="1" max="12"/>
        <label>Divisions</label>
      </div>
      
    </div>
    `
    );
  });

  // Create Effect slider
  $(".color-controls-wrapper").append(
    `<div class="effect-knob">
    <div><strong>!</strong></div>
    <input class="effect-range" type="range" data-effect="distortion" value="0" min="0" max="100"/>
    </div>
    `
  );

  $(".mute-toggle").on("change", ({ target }) => {
    const { attributes, value } = target;
    const trackIndex = parseInt(attributes["data-track"].value);
    const isMuted = !drumTracks[trackIndex].isMuted;
    drumTracks[trackIndex].isMuted = isMuted;
    drumTracks[trackIndex].loop.mute = isMuted;
  });

  // handle slider changes
  $(".track-slider").on("input", ({ target }) => {
    const { attributes, value } = target;
    const trackIndex = parseInt(attributes["data-track"].value);
    const dataTarget = attributes["data-target"].value;
    if (dataTarget === "playbackRate") {
      drumTracks[trackIndex].loopInterval = value / 50;
      drumTracks[trackIndex].loop.interval = value / 50;
    }
    if (dataTarget === "divisions") {
      drumTracks[trackIndex].divisions = parseInt(value);
    }
  });

  // reset slider on double click
  $(".track-slider").on("dblclick", ({ target }) => {
    const { attributes } = target;
    const trackIndex = parseInt(attributes["data-track"].value);
    const dataTarget = attributes["data-target"].value;
    if (dataTarget === "playbackRate") {
      target.value = 50;
      drumTracks[trackIndex].loopInterval = 1;
      drumTracks[trackIndex].loop.interval = 1;
    }
    if (dataTarget === "divisions") {
      target.value = 1;
      drumTracks[trackIndex].divisions = 1;
    }
  });

  // Effect/distortion slider on master output
  $(".effect-range").on("input", ({ target }) => {
    const { value } = target;
    const val = value / 100;
    distortion.set("distortion", val);
    reverb.set("wet", val);
    const gainVal = 1 - val / 3;
    distortionAmount = val * 5;
    // lower gain a bit because the effects increase the overall volume
    gain.set("gain", gainVal);
  });
};
