const fs = require('fs');
const path = require('path');
const { faker } = require('@faker-js/faker');

const caminhoData = path.join(__dirname, '../data');
if (!fs.existsSync(caminhoData)) {
  fs.mkdirSync(caminhoData, { recursive: true });
}

function mascararEmail(email) {
  const [usuario, dominio] = email.split('@');
  const inicio = usuario.slice(0, 4);
  return `${inicio}${'*'.repeat(7)}@${dominio}`;
}

const TOTAL_BLOCOS = 5000;
const EMAILS_POR_BLOCO = 8;

console.log("A gerar o dataset com Faker...");

const dataset = [];

for (let i = 0; i < TOTAL_BLOCOS; i++) {
  const firstName = faker.person.firstName().toLowerCase();
  const lastName = faker.person.lastName().toLowerCase();
  
  const emailBase = `${firstName}${lastName}@${faker.internet.domainName()}`;
  const emailMascaradoBase = mascararEmail(emailBase);

  const listaEmails = [];

  for (let j = 0; j < EMAILS_POR_BLOCO; j++) {
    const provedor = faker.helpers.arrayElement(['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com.br']);
    let emailVariado = '';

    switch (j % 4) {
      case 0:
        emailVariado = `${firstName}${faker.string.numeric(4)}${lastName}@${provedor}`;
        break;
      case 1:
        emailVariado = `${firstName}${lastName}@${provedor}`;
        break;
      case 2:
        emailVariado = `${firstName[0]}.${lastName}@${provedor}`;
        break;
      case 3:
        emailVariado = `${firstName}_${lastName}@${provedor}`;
        break;
    }

    listaEmails.push({ email: emailVariado });
  }

  dataset.push({
    emailMascaradoBase,
    emails: listaEmails
  });
}

const destinoJSON = path.join(caminhoData, 'dataset.json');
fs.writeFileSync(destinoJSON, JSON.stringify(dataset, null, 2), 'utf-8');

console.log(`Dataset gerado com sucesso com ${dataset.length} blocos em: ${destinoJSON}`);