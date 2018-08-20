/* jshint esversion: 6 */
/*jshint browser: true */

/*
          ---------------
      + JBK'S CODE BISCUITS +
    - + | + -PREAMP.JS- + | + -
      + contact@jbkaudio.fr +
          ---------------
*/

'use strict';
class Preamp {
    constructor() {
        let context, fileSource, lineSource, mediumHighCutFilter, mediumHighCutFilter2, mediumLowCutFilter, mediumLowCutFilter2, subHighCutFilter, subHighCutFilter2, lowMediumLowCutFilter, lowMediumLowCutFilter2, higMediumHighCutFilter, higMediumHighCutFilter2, trebleLowCutFilter, trebleLowCutFilter2, subGain, lowMediumGain, highMediumGain, trebleGain, volumeControl, echoSendGain, echoDelay, echoVolume, echoFeedback, echoHighPass, echoLowPass, equalizerFilters = [10], paramEqLow, paramEqHigh, oscillator, oscillatorVolume, oscillatorEchoSend, oscillatorPitch, oscillatorLfoAmplitude, oscillatorLfoType, oscillatorLfoRate, analyser, analyser2, masterVolume, equalizerBandNumber = 10, t = 0.0, trebleMeter, midMeter, bassMeter, subMeter, oscillatorMeter;
        function computeLfo() {
            let temp, baseFreq = 20 + oscillatorPitch * 50, amp = 100 + (oscillatorLfoAmplitude * 4);
            switch (oscillatorLfoType) {
                case "square":
                    temp = Math.round((t < 500 ?
                        amp :
                        -amp) +
                        baseFreq);
                    break;
                case "up":
                    if (t > 250 && t < 500) {
                        t += 500;
                    }
                    if (t > 500 && t < 750) {
                        t -= 500;
                    }
                    temp = Math.round(amp * Math.sin((Math.PI * t) / 500) + baseFreq);
                    break;
                case "down":
                    if (t < 250) {
                        t += 500;
                    }
                    if (t > 750) {
                        t -= 500;
                    }
                    temp = Math.round(amp * Math.sin((Math.PI * t) / 500) + baseFreq);
                    break;
                case "sine":
                    temp = Math.round(amp * Math.sin((Math.PI * t) / 500) + baseFreq);
                    break;
                case "multitone":
                    temp = baseFreq + amp * ((Math.ceil(t / 100) / 5) - 1);
                    break;
                default:
                    temp = baseFreq;
                    break;
            }
            oscillator.frequency.setValueAtTime(temp, context.currentTime);
            if (t > 1000) {
                t -= 1000;
            }
            t += parseInt(oscillatorLfoRate, 10);       
            setTimeout(computeLfo, 10);
        }
        function connectAudioNodes(source) {

            source.disconnect();
            source.connect(analyser);
            source.connect(echoSendGain);
            source.connect(volumeControl);
            volumeControl.connect(paramEqHigh);
            paramEqHigh.connect(paramEqLow);
            paramEqLow.connect(mediumHighCutFilter);
            paramEqLow.connect(mediumLowCutFilter);
            //crossover
            mediumHighCutFilter.connect(mediumHighCutFilter2);
            mediumLowCutFilter.connect(mediumLowCutFilter2);
            mediumHighCutFilter2.connect(subHighCutFilter);
            subHighCutFilter.connect(subHighCutFilter2);
            subHighCutFilter2.connect(subGain);
            subGain.connect(equalizerFilters[0]);
            mediumHighCutFilter2.connect(lowMediumLowCutFilter);
            lowMediumLowCutFilter.connect(lowMediumLowCutFilter2);
            lowMediumLowCutFilter2.connect(lowMediumGain);
            lowMediumGain.connect(equalizerFilters[0]);
            mediumLowCutFilter2.connect(higMediumHighCutFilter);
            higMediumHighCutFilter.connect(higMediumHighCutFilter2);
            higMediumHighCutFilter2.connect(highMediumGain);
            highMediumGain.connect(equalizerFilters[0]);
            mediumLowCutFilter2.connect(trebleLowCutFilter);
            trebleLowCutFilter.connect(trebleLowCutFilter2);
            trebleLowCutFilter2.connect(trebleGain);
            trebleGain.connect(equalizerFilters[0]);
            echoSendGain.connect(echoLowPass);
            echoLowPass.connect(echoHighPass);
            echoHighPass.connect(echoDelay);
            echoDelay.connect(echoVolume);
            echoDelay.connect(echoFeedback);
            echoFeedback.connect(echoLowPass);
            echoVolume.connect(masterVolume);
            equalizerFilters.forEach(function (filter, index) {
                if (index < equalizerBandNumber - 1) {
                    filter.connect(equalizerFilters[index + 1]);
                }
            });
            equalizerFilters[equalizerBandNumber - 1].connect(masterVolume);
            oscillator.connect(oscillatorVolume);
            oscillatorVolume.connect(oscillatorEchoSend);
            oscillatorVolume.connect(oscillatorMeter);
            oscillatorEchoSend.connect(echoLowPass);
            oscillatorVolume.connect(masterVolume);
            masterVolume.connect(context.destination);
            masterVolume.connect(analyser2);

            trebleGain.connect(trebleMeter);
            highMediumGain.connect(midMeter);
            lowMediumGain.connect(bassMeter);
            subGain.connect(subMeter);
        }
        
        this.getTrebleVolume = function () {
            return trebleMeter.volume;
        };
        
        this.getMidVolume = function () {
            return midMeter.volume;
        };
        
        this.getBassVolume = function () {
            return bassMeter.volume;
        };
        
        this.getSubVolume = function () {
            return subMeter.volume;
        };
        
        this.getOscVolume = function () {
            return oscillatorMeter.volume;
        };

        function createCrossoverFilters(filters, frequency) {
            filters.lowpass = context.createBiquadFilter();
            filters.lowpass.type = "lowpass";
            filters.lowpass.frequency.value = frequency;
            filters.lowpass.Q.value = 0.707;
            filters.lowpass2 = context.createBiquadFilter();
            filters.lowpass2.type = "lowpass";
            filters.lowpass2.frequency.value = frequency;
            filters.lowpass2.Q.value = 0.707;
            filters.highpass = context.createBiquadFilter();
            filters.highpass.type = "highpass";
            filters.highpass.frequency.value = frequency;
            filters.highpass.Q.value = 0.707;
            filters.highpass2 = context.createBiquadFilter();
            filters.highpass2.type = "highpass";
            filters.highpass2.frequency.value = frequency;
            filters.highpass2.Q.value = 0.707;
        }
        this.initializePreamp = function () {
            // Check for the various File API support.
            if (!(window.File && window.FileReader && window.FileList && window.Blob && window.AudioContext)) {
                window.alert("The APIs used by the pre are not fully supported in this browser.");
                return;
            }
            if (window.hasOwnProperty('webkitAudioContext') && !window.hasOwnProperty('AudioContext')) {
                window.AudioContext = window.webkitAudioContext;
            }
            context = new window.AudioContext();
            Array.from({ length: equalizerBandNumber }, function (v, k) {
                equalizerFilters[k] = context.createBiquadFilter();
                equalizerFilters[k].type = "peaking";
                equalizerFilters[k].frequency.value = 32 * Math.pow(2, k);
                equalizerFilters[k].Q.value = 1;
                equalizerFilters[k].gain.value = 0;
            });
            let filters = {
                lowpass: "",
                lowpass2: "",
                highpass: "",
                highpass2: ""
            };
            createCrossoverFilters(filters, 250);
            mediumLowCutFilter = filters.highpass;
            mediumLowCutFilter2 = filters.highpass2;
            mediumHighCutFilter = filters.lowpass;
            mediumHighCutFilter2 = filters.lowpass2;
            createCrossoverFilters(filters, 90);
            lowMediumLowCutFilter = filters.highpass;
            lowMediumLowCutFilter2 = filters.highpass2;
            subHighCutFilter = filters.lowpass;
            subHighCutFilter2 = filters.lowpass2;
            createCrossoverFilters(filters, 5000);
            trebleLowCutFilter = filters.highpass;
            trebleLowCutFilter2 = filters.highpass2;
            higMediumHighCutFilter = filters.lowpass;
            higMediumHighCutFilter2 = filters.lowpass2;
            paramEqHigh = context.createBiquadFilter();
            paramEqHigh.type = "peaking";
            paramEqHigh.frequency.value = 5000;
            paramEqHigh.Q.value = 1;
            paramEqHigh.gain.value = 0;
            paramEqLow = context.createBiquadFilter();
            paramEqLow.type = "peaking";
            paramEqLow.frequency.value = 5000;
            paramEqLow.Q.value = 1;
            paramEqLow.gain.value = 0;
            subGain = context.createGain();
            subGain.gain.value = 1;
            lowMediumGain = context.createGain();
            lowMediumGain.gain.value = 1;
            highMediumGain = context.createGain();
            highMediumGain.gain.value = 1;
            trebleGain = context.createGain();
            trebleGain.gain.value = 1;
            volumeControl = context.createGain();
            volumeControl.gain.value = 1;
            echoSendGain = context.createGain();
            echoSendGain.gain.value = 0;
            echoVolume = context.createGain();
            echoVolume.gain.value = 1;
            echoFeedback = context.createGain();
            echoFeedback.gain.value = 0.5;
            echoDelay = context.createDelay();
            echoDelay.delayTime.value = 1;
            echoLowPass = context.createBiquadFilter();
            echoLowPass.type = "lowpass";
            echoLowPass.frequency.value = 5000;
            echoLowPass.Q.value = 1;
            echoHighPass = context.createBiquadFilter();
            echoHighPass.type = "highpass";
            echoHighPass.frequency.value = 300;
            echoHighPass.Q.value = 1;
            analyser = context.createAnalyser();
            analyser.fftSize = 512;
            analyser2 = context.createAnalyser();
            analyser2.fftSize = 512;
            oscillator = context.createOscillator();
            oscillatorVolume = context.createGain();
            masterVolume = context.createGain();
            oscillatorEchoSend = context.createGain();
            oscillator.start();
            fileSource = context.createBufferSource();
            trebleMeter = createAudioMeter(context);
            midMeter = createAudioMeter(context);
            bassMeter = createAudioMeter(context);
            subMeter = createAudioMeter(context);
            oscillatorMeter = createAudioMeter(context);
            connectAudioNodes(fileSource);
            return;
        };

        this.launchLfo = function () {     
            computeLfo();       
            //setInterval(computeLfo, 10);
        };

        //values between 0 and 1
        this.updatePreampCrossover = function (sub, lowMedium, highMedium, treble) {
            subGain.gain.value = sub;
            lowMediumGain.gain.value = lowMedium;
            highMediumGain.gain.value = highMedium;
            trebleGain.gain.value = treble;
        };
        this.updatePreampVolume = function (volume) {
            volumeControl.gain.value = volume;
        };
        this.updatePreampEchoValues = function (sendGain, delay, feedback, volume) {
            echoSendGain.gain.value = sendGain;
            echoDelay.delayTime.value = delay;
            echoFeedback.gain.value = feedback;
            echoVolume.gain.value = volume;
        };
        this.updatePreampEqualizer = function (equalizerValues) {
            equalizerFilters.forEach(function (filter, index) {
                filter.gain.value = equalizerValues[index];
            });
        };
        this.updatePreampOscillator = function (type, gain, echoSend, pitch, lfoAmplitude, lfoType, lfoRate) {
            oscillator.type = type;
            oscillatorVolume.gain.value = gain;
            oscillatorEchoSend.gain.value = echoSend;
            oscillatorPitch = pitch;
            oscillatorLfoAmplitude = lfoAmplitude;
            oscillatorLfoRate = lfoRate;
            oscillatorLfoType = lfoType;
        };
        this.updatePreampParamEqs = function (lowFrequency, lowGain, highFrequency, highGain) {
            paramEqLow.frequency.value = lowFrequency;
            paramEqLow.gain.value = lowGain;
            paramEqHigh.frequency.value = highFrequency;
            paramEqHigh.gain.value = highGain;
        };
        this.getPreampAnalyzerDatas = function (analyserdata, analyserdata2) {
            analyser.getFloatFrequencyData(analyserdata);
            analyser2.getFloatFrequencyData(analyserdata2);
        };
        this.preampLoadFile = function (arrayBuffer, successCallback) {
            context.decodeAudioData(arrayBuffer, successCallback);
        };
        this.preampTuneStartPlaying = function (position, buffer) {
            fileSource = context.createBufferSource();
            fileSource.buffer = buffer;
            connectAudioNodes(fileSource);
            fileSource.start(0, position);
        };
        this.preampTuneStopPlaying = function () {
            if (fileSource && fileSource.buffer) {
                fileSource.stop(0);
            }
        };
        this.setLineInput = function (stream) {
            if (!lineSource) {
                lineSource = context.createMediaStreamSource(stream);
            }
            connectAudioNodes(lineSource);
        };
        this.setFileSourceInput = function () {
            fileSource = context.createBufferSource();
            if (lineSource) {
                lineSource.disconnect();
            }
            connectAudioNodes(fileSource);
        };
    }
}