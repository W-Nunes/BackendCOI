const dicionario = require('./dicionarioSintomas.json');

function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/gi, '');
}

function calcularScoreGravidade(textoProntuario) {
  console.log("\n--- INICIANDO CÁLCULO DE SCORE ---"); // LOG 1
  if (!textoProntuario) {
    console.log("ERRO: Texto do prontuário está vazio.");
    return 0;
  }

  console.log("Texto Original Recebido:", textoProntuario); // LOG 2
  const textoNormalizado = normalizarTexto(textoProntuario);
  console.log("Texto Normalizado para Busca:", textoNormalizado); // LOG 3

  let scoreTotal = 0;
  let sintomasEncontrados = [];

  for (const sintoma in dicionario) {
    const sintomaNormalizado = normalizarTexto(sintoma);
    
    // LOG 4 (Descomente a linha abaixo se quiser ver TODOS os sintomas sendo checados)
    // console.log(`Checando por: '${sintomaNormalizado}'`); 

    if (textoNormalizado.includes(sintomaNormalizado)) {
      scoreTotal += dicionario[sintoma];
      sintomasEncontrados.push(sintoma);
      console.log(`✅ ENCONTRADO: '${sintoma}'. Adicionando score: ${dicionario[sintoma]}.`); // LOG 5
    }
  }

  console.log("Sintomas Encontrados:", sintomasEncontrados.join(', ') || 'Nenhum'); // LOG 6
  console.log("--- CÁLCULO FINALIZADO ---");
  console.log("Score Total:", scoreTotal); // LOG 7
  return scoreTotal;
}

module.exports = { calcularScoreGravidade };