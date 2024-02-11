document.addEventListener("DOMContentLoaded", function(event){

        //default wave type
        var waveType="sine";
        //detect change for wave type
        var waveForm = document.getElementById('wave_selection');
        // Add event listener to the form
        waveForm.addEventListener('change', function (event) {
            if (event.target.type === 'radio') {
                // set the new wave type
                waveType = event.target.value; 
            }
        });

       

        const audioCtx = new(window.AudioContext || window.webkitAudioContext());

        //map from keys to frequencies
        const keyboardFrequencyMap = {
            '90': 261.625565300598634,  //Z - C
            '83': 277.182630976872096, //S - C#
            '88': 293.664767917407560,  //X - D
            '68': 311.126983722080910, //D - D#
            '67': 329.627556912869929,  //C - E
            '86': 349.228231433003884,  //V - F
            '71': 369.994422711634398, //G - F#
            '66': 391.995435981749294,  //B - G
            '72': 415.304697579945138, //H - G#
            '78': 440.000000000000000,  //N - A
            '74': 466.163761518089916, //J - A#
            '77': 493.883301256124111,  //M - B
            '81': 523.251130601197269,  //Q - C
            '50': 554.365261953744192, //2 - C#
            '87': 587.329535834815120,  //W - D
            '51': 622.253967444161821, //3 - D#
            '69': 659.255113825739859,  //E - E
            '82': 698.456462866007768,  //R - F
            '53': 739.988845423268797, //5 - F#
            '84': 783.990871963498588,  //T - G
            '54': 830.609395159890277, //6 - G#
            '89': 880.000000000000000,  //Y - A
            '55': 932.327523036179832, //7 - A#
            '85': 987.766602512248223,  //U - B
        }

        //add listeners to the keys, these will add & remove activeOscillators(repeating waveforms)
        window.addEventListener('keydown',keyDown,false);
        window.addEventListener('keyup',keyUp, false);

        activeOscillators = {}
        //will need a new gain node for each node to control the adsr of that note
        gainNodes = {}

         //default additive synthesis
         var synthesisType="0";
         //detect change for synthesis type
         document.getElementById('synthesis-type').addEventListener('change',changeSynthesis);
        function changeSynthesis(){
            //update the synthesis type
            synthesisType = document.getElementById('synthesis-type').value;
            
        }

        function keyDown(event){
            const key = (event.detail || event.which).toString();
            //if key is mapped & there isn't a current active oscillator for the key
            if(keyboardFrequencyMap[key] && !activeOscillators[key]){
                playNote(key);
            }
        }

        function keyUp(event){
            const key = (event.detail || event.which).toString();
            //if key is mapped && is active
            if(keyboardFrequencyMap[key]&& activeOscillators[key]){
                //release
            
                if(synthesisType==0){
                    gainNodes[key].gain.cancelScheduledValues(audioCtx.currentTime);
                    gainNodes[key].gain.setTargetAtTime(0,audioCtx.currentTime,0.01);
                }
                else if(synthesisType==1){
                     for(let node of gainNodes[key]){
                    node.gain.cancelScheduledValues(audioCtx.currentTime);
                    node.gain.setTargetAtTime(0,audioCtx.currentTime,0.01)
                }
                    
                }
                

                // wait 20 milliseconds, then delete oscillator and gainNode
                setTimeout(() => { 
                    for (let osc of activeOscillators[key]) {
                        osc.stop(audioCtx.currentTime + 0.02);
                    }
                    
                    delete activeOscillators[key];
                    delete gainNodes[key];
                }, 70);
               
                
            }
        }

        //start the sound, start an oscillator, set the desired properties, connect the new oscillator
        function playNote(key){
            //Additive Synthesis
            if (synthesisType==0){
                //create main osc
                var osc_main = audioCtx.createOscillator();
                osc_main.frequency.setValueAtTime(keyboardFrequencyMap[key],audioCtx.currentTime);
                osc_main.type = waveType;
                activeOscillators[key] = [osc_main];

                //create gain node(controls volume, ADSR envelop)
                var gainNode = audioCtx.createGain();
                gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
                //add gainNode to dictionary
                gainNodes[key] = gainNode;

                //create 3 partials
                for(var i=0;i<3;i++)
                {
                    let osc = audioCtx.createOscillator();
                    osc.frequency.value = i * keyboardFrequencyMap[key] + (Math.random() - 0.5) * 30;
                    osc.type = waveType;
                    osc.connect(gainNode)
                    activeOscillators[key].push(osc);
                }

                //connect to output
                osc_main.connect(gainNode)
                gainNode.connect(audioCtx.destination);

                //start the oscillators
                for (let osc of activeOscillators[key]) {
                    osc.start();
                }
                //normalize the gain to ensure it doesn't exceed our threshold
                 //attack, polyphonic mode
                var numActiveOscillators = Object.keys(activeOscillators).length * 4;
                Object.keys(gainNodes).forEach(function(key){
                    gainNodes[key].gain.setTargetAtTime(0.25/numActiveOscillators, audioCtx.currentTime, 0.2);
                });
    
                //decay + sustain
                 gainNode.gain.setTargetAtTime(0.15/numActiveOscillators, audioCtx.currentTime+0.2, 0.2);

            }


            //AM Synthesis
            else if(synthesisType==1){
                //create carrier and modulatror oscillators
                var carrier = audioCtx.createOscillator();
                var modulatorFreq = audioCtx.createOscillator();
                carrier.type = waveType;
                modulatorFreq.type = waveType;
                modulatorFreq.frequency.value = 100;
                carrier.frequency.value = keyboardFrequencyMap[key];

                //create gain nodes
                var modulated = audioCtx.createGain();
                var depth = audioCtx.createGain();

                //add them to their respectice dictionaries
                gainNodes[key] = [modulated,depth]
                activeOscillators[key] = [carrier,modulatorFreq]
            
               
                var numActiveOscillators = Object.keys(activeOscillators).length * 2;
                depth.gain.value = 0.2/numActiveOscillators 
                modulated.gain.value = 0.5/numActiveOscillators - depth.gain.value; 
            
                modulatorFreq.connect(depth).connect(modulated.gain); //.connect is additive, so with [-0.5,0.5] and 0.5, the modulated signal now has output gain at [0,1]
                carrier.connect(modulated)
                modulated.connect(audioCtx.destination);
                
                carrier.start();
                modulatorFreq.start();
                

            }
          
        

        }

})