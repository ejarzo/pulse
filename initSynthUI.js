const initSynthUI = (voices) => {
  const initialOscs = voices[0].getOscs();
  const noiseSynthController = voices[0].getNoiseSynthController();

  const SYNTH_DROPDOWNS = [
    {
      label: "Type",
      options: ["sine", "triangle", "square", "sawtooth"],
      getVal: (oscIndex) => initialOscs[oscIndex].omniOsc.get("type").type,
      onChange: (oscIndex, val) => {
        voices.forEach((synth) => {
          synth.setOscType(oscIndex, val);
        });
      },
    },
    {
      label: "Loop",
      options: ["off", "8n", "8t", "16n", "16t"],
      getVal: (oscIndex) => "off",
      onChange: (oscIndex, val) => {
        voices.forEach((synth) => {
          synth.setLoop(oscIndex, val);
        });
      },
    },
  ];

  const SYNTH_SLIDERS = [
    {
      label: "Base",
      min: 0,
      max: 10,
      getVal: (oscIndex) => initialOscs[oscIndex].harmonic,
      onChange: (oscIndex, val) => {
        voices.forEach((synth) => {
          synth.setHarmonic(oscIndex, val);
        });
      },
    },
    {
      label: "Volume",
      min: -24,
      max: 0,
      getVal: (oscIndex) => {
        const vol = initialOscs[oscIndex].omniOsc.volume.value;
        return vol === -Infinity ? -24 : vol;
      },
      onChange: (oscIndex, val) => {
        voices.forEach((synth) => {
          synth.setVolume(oscIndex, val);
        });
      },
    },
    {
      label: "Detune",
      min: -20,
      max: 20,
      getVal: (oscIndex) => initialOscs[oscIndex].omniOsc.detune.value,
      onChange: (oscIndex, val) => {
        voices.forEach((synth) => {
          synth.setDetune(oscIndex, val);
        });
      },
    },
    {
      label: "A",
      min: 1,
      max: 200,
      getVal: (oscIndex) => initialOscs[oscIndex].env.attack * 100,
      onChange: (oscIndex, val) => {
        voices.forEach((synth) => {
          synth.setEnvValue(oscIndex, "attack", val / 100);
        });
      },
    },
    {
      label: "D",
      min: 1,
      max: 200,
      getVal: (oscIndex) => initialOscs[oscIndex].env.decay * 100,
      onChange: (oscIndex, val) => {
        voices.forEach((synth) => {
          synth.setEnvValue(oscIndex, "decay", val / 100);
        });
      },
    },
    {
      label: "S",
      min: 1,
      max: 100,
      getVal: (oscIndex) => initialOscs[oscIndex].env.sustain * 100,
      onChange: (oscIndex, val) => {
        voices.forEach((synth) => {
          synth.setEnvValue(oscIndex, "sustain", val / 100);
        });
      },
    },
    {
      label: "R",
      min: 0,
      max: 200,
      getVal: (oscIndex) => initialOscs[oscIndex].env.release * 100,
      onChange: (oscIndex, val) => {
        voices.forEach((synth) => {
          synth.setEnvValue(oscIndex, "release", val / 100);
        });
      },
    },
  ];

  const NOISE_SLIDERS = [
    {
      label: "Volume",
      min: -24,
      max: 0,
      getVal: () => {
        const vol = noiseSynthController.noiseSynth.volume.value;
        return vol === -Infinity ? -24 : vol;
      },
      onChange: (val) => {
        voices.forEach((synth) => {
          synth.setNoiseVolume(val === -24 ? -Infinity : val);
        });
      },
    },
    {
      label: "A",
      min: 1,
      max: 200,
      getVal: () =>
        noiseSynthController.noiseSynth.envelope.get("attack").attack / 100,
      onChange: (val) => {
        voices.forEach((synth) => {
          synth.setNoiseEnvValue("attack", val / 100);
        });
      },
    },
    {
      label: "D",
      min: 1,
      max: 200,
      getVal: () =>
        noiseSynthController.noiseSynth.envelope.get("decay").decay / 100,
      onChange: (val) => {
        voices.forEach((synth) => {
          synth.setNoiseEnvValue("decay", val / 100);
        });
      },
    },
    {
      label: "S",
      min: 1,
      max: 100,
      getVal: () =>
        noiseSynthController.noiseSynth.envelope.get("sustain").sustain / 100,
      onChange: (val) => {
        voices.forEach((synth) => {
          synth.setNoiseEnvValue("sustain", val / 100);
        });
      },
    },
    {
      label: "R",
      min: 0,
      max: 200,
      getVal: () =>
        noiseSynthController.noiseSynth.envelope.get("release").release / 100,
      onChange: (val) => {
        voices.forEach((synth) => {
          synth.setNoiseEnvValue("release", val / 100);
        });
      },
    },
  ];

  const NOISE_DROPDOWNS = [
    {
      label: "Type",
      options: ["white", "pink", "brown"],
      getVal: () => noiseSynthController.noiseSynth.noise.type,
      onChange: (val) => {
        noiseSynthController.noiseSynth.noise.set({ type: val });
      },
    },
    {
      label: "Loop",
      options: ["off", "16n", "16t", "32n"],
      getVal: () => noiseSynthController.loop.get("interval") || "off",
      onChange: (val) => {
        if (val === "off") {
          noiseSynthController.isLooping = false;
        } else {
          noiseSynthController.loop.set({ interval: val });
          noiseSynthController.isLooping = true;
        }
      },
    },
  ];

  const EFFECT_SLIDERS = [
    {
      label: "Color",
      min: 0,
      max: 100,
      getVal: () => cheby.wet.value * 100,
      onChange: (val) => (cheby.wet.value = val / 100),
    },
    {
      label: "LP Cutoff",
      min: 32,
      max: 128,
      getVal: () => lpFilter.frequency.value,
      onChange: (val) => (lpFilter.frequency.value = Math.pow(2, val / 8)),
    },
    {
      label: "HP Cutoff",
      min: 32,
      max: 128,
      getVal: () => hpFilter.frequency.value,
      onChange: (val) => (hpFilter.frequency.value = Math.pow(2, val / 8)),
    },
    {
      label: "Volume",
      min: 0,
      max: 30,
      getVal: () => destinationGain * 100,
      onChange: (val) => {
        DESTINATION_OUTPUT.gain.value = val / 100;
      },
    },
  ];

  /* ================= DOM helpers ================= */

  const getSlider = ({ min, max, getVal, label, onChange }) => {
    const wrapper = $(`<div class="slider-wrapper" />`);
    const slider = $(
      `<input type="range" min=${min} max=${max} value="${getVal()}"/>`
    );
    slider.on("input", () => onChange(parseInt(slider.val())));
    wrapper.append(slider);
    wrapper.append(`<label>${label}</label>`);
    return wrapper;
  };

  const getDropdown = ({ label, options, getVal, onChange }) => {
    const wrapper = $(`<div class="select-wrapper" />`);
    wrapper.append(`<label>${label}</label>`);

    const select = $(`<select />`);
    select.on("change", () => onChange(select.val()));
    options.forEach((option) =>
      select.append(
        `<option ${
          getVal() === option ? "selected" : undefined
        }>${option}</option>`
      )
    );
    wrapper.append(select);
    return wrapper;
  };

  const initSynthSliders = () => {
    for (let i = 0; i < NUM_OSCS; i++) {
      const oscDiv = $(`<div class="osc osc--${i}" />`);
      oscDiv.append(`<div><h3>Osc ${i + 1}</h3></div>`);
      oscDiv.css({
        backgroundColor: `hsl(${(i / NUM_OSCS) * 60 - 20}, 50%, 50%)`,
      });

      SYNTH_DROPDOWNS.forEach(({ label, options, getVal, onChange }) => {
        const select = getDropdown({
          label,
          options,
          getVal: () => getVal(i),
          onChange: (val) => onChange(i, val),
        });
        oscDiv.append(select);
      });

      SYNTH_SLIDERS.forEach(({ label, min, max, getVal, onChange }) => {
        const slider = getSlider({
          label,
          min,
          max,
          getVal: () => getVal(i),
          onChange: (val) => onChange(i, val),
        });
        oscDiv.append(slider);
      });

      $(".synth-controls").append(oscDiv);
    }
  };

  const initNoiseController = () => {
    const noiseDiv = $(`<div class="osc noise" />`);
    noiseDiv.append(`<div><h3>Noise</h3></div>`);
    noiseDiv.css({ backgroundColor: `hsl(200, 50%, 50%)` });

    NOISE_DROPDOWNS.forEach((options) => {
      noiseDiv.append(getDropdown(options));
    });

    NOISE_SLIDERS.forEach((options) => {
      noiseDiv.append(getSlider(options));
    });
    $(".synth-controls").append(noiseDiv);
  };

  const initOuptutController = () => {
    const effectsDiv = $(`<div class="osc fx" />`);
    effectsDiv.append(`<div><h3>Output</h3></div>`);

    EFFECT_SLIDERS.forEach(({ label, min, max, getVal, onChange }) => {
      const slider = getSlider({ label, min, max, getVal, onChange });
      effectsDiv.append(slider);
    });
    $(".synth-controls").append(effectsDiv);
  };

  initSynthSliders();
  initNoiseController();
  initOuptutController();
};
