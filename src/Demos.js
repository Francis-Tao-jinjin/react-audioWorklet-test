export const Bypasser = (App) => {
  const actx = App.actx;
  const bypasserNode = new AudioWorkletNode(actx, 'bypass-processor');
  const osc = actx.createOscillator();
  osc.connect(bypasserNode).connect(actx.destination);
  osc.start();
  return bypasserNode;
}

export const noiseGenerator = (App) => {
  const actx = App.actx;
  const modulator = actx.createOscillator();
  const modGain = actx.createGain();
  const noiseGeneratorNode = new AudioWorkletNode(actx, 'noise-generator');
  const paramAmp = noiseGeneratorNode.parameters.get('amplitude');
  noiseGeneratorNode.connect(actx.destination);
  modulator.connect(modGain).connect(paramAmp);
  modulator.frequency.value = 10;
  modGain.gain.value = 0.75;
  modulator.start();
  return noiseGeneratorNode;
}