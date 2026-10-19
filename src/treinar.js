const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');
const { vocabSize, textToIndices } = require('./tokenizer');

const caminhoData = path.join(__dirname, '../data/dataset.json');
const rawData = JSON.parse(fs.readFileSync(caminhoData, 'utf-8'));

// Otimizado para alta velocidade sem estourar memória
const SEQ_LEN = 40; 
const inputs = [];
const targets = [];

// Limite seguro de blocos para processar na RAM
const amostra = rawData.slice(0, 2000);

amostra.forEach(item => {
  const mascaradoLimpo = item.emailMascaradoBase.toLowerCase().trim();

  item.emails.forEach(objEmail => {
    const linha = `${mascaradoLimpo}|${objEmail.email.toLowerCase()}\n`;
    const indices = textToIndices(linha);
    
    const posBarra = linha.indexOf('|');
    if (posBarra === -1) return;

    for (let j = posBarra; j < indices.length - 1; j++) {
      const entrada = indices.slice(0, j + 1);
      while (entrada.length < SEQ_LEN) entrada.unshift(0);
      
      inputs.push(entrada.slice(-SEQ_LEN));
      targets.push(indices[j + 1]);
    }
  });
});

console.log(`Amostras de treino geradas: ${inputs.length}`);

const xs = tf.tensor2d(inputs);
const ys = tf.tensor2d(targets, [targets.length, 1]);

let model;
const dirModelo = path.join(__dirname, '../meu-modelo');

async function prepararModelo() {
  if (fs.existsSync(path.join(dirModelo, 'model.json'))) {
    console.log("Carregando modelo anterior para continuar o aprendizado...");
    model = await tf.loadLayersModel(`file://${dirModelo}/model.json`);
    
    model.compile({
      optimizer: tf.train.adam(0.003),
      loss: 'sparseCategoricalCrossentropy'
    });
  } else {
    console.log("Criando um modelo novo do zero...");
    model = tf.sequential();
    model.add(tf.layers.embedding({ inputDim: vocabSize, outputDim: 32 }));
    model.add(tf.layers.lstm({ units: 128, returnSequences: false }));
    model.add(tf.layers.dense({ units: vocabSize, activation: 'softmax' }));
    
    model.compile({
      optimizer: tf.train.adam(0.003),
      loss: 'sparseCategoricalCrossentropy'
    });
  }
}

async function treinar() {
  console.log("Iniciando treinamento...");

  await model.fit(xs, ys, {
    epochs: 30,
    batchSize: 1024, // Batch maior para acelerar o treino na CPU
    callbacks: {
      onEpochEnd: async (epoch, logs) => {
        console.log(`Época ${epoch + 1}/30 - Loss: ${logs.loss.toFixed(4)}`);
        // Salva o progresso ao final de cada época para não perder nada
        await model.save(`file://${dirModelo}`);
      }
    }
  });

  console.log("Modelo treinado e salvo com sucesso!");

  xs.dispose();
  ys.dispose();
}

async function executar() {
  await prepararModelo(); 
  await treinar();        
}

executar();