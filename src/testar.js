const tf = require('@tensorflow/tfjs-node');
const path = require('path');
const { indicesToText, textToIndices } = require('./tokenizer');

const SEQ_LEN = 40; // Tem de ser igual ao do treino
const dirModelo = path.join(__dirname, '../meu-modelo');

async function preverEmail(mascarado) {
  const model = await tf.loadLayersModel(`file://${dirModelo}/model.json`);
  
  let textoAtual = `${mascarado.toLowerCase().trim()}|`;
  
  // Gera até 35 caracteres para completar o e-mail
  for (let i = 0; i < 35; i++) {
    const indices = textToIndices(textoAtual);
    while (indices.length < SEQ_LEN) indices.unshift(0);
    
    const inputSlice = indices.slice(-SEQ_LEN);
    const inputTensor = tf.tensor2d([inputSlice]);

    const pred = model.predict(inputTensor);
    const argmax = pred.argMax(-1).dataSync()[0];
    
    const proxChar = indicesToText([argmax]);

    inputTensor.dispose();
    pred.dispose();

    if (proxChar === '\n' || proxChar === '') break;
    textoAtual += proxChar;
  }

  const partes = textoAtual.split('|');
  return partes[1] || '';
}

async function executarTeste() {
  const emailMascarado = "salv*******@outlook.com";
  console.log(`Testando para: ${emailMascarado}`);
  
  const resultado = await preverEmail(emailMascarado);
  console.log(`Predição da IA: ${resultado}`);
}

executarTeste();