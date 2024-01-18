const fs = require('fs');

class EstadoAplicacao {
    constructor() {
        this.prejuizo = 0;
        this.mediaPonderada = 0;
        this.quantidade = 0;
    }
}

function calcularImposto(operacoes) {
    const resultado = [];
    let estado = new EstadoAplicacao();

    for (const operacao of operacoes) {
        let totalOperacao = operacao['unit-cost'] * operacao.quantity;
        let imposto = 0;

        if (operacao.operation === 'buy') {
            estado.mediaPonderada = (
                (estado.mediaPonderada * estado.quantidade) +
                (operacao['unit-cost'] * operacao.quantity)
            ) / (estado.quantidade + operacao.quantity);

            estado.quantidade += operacao.quantity;
        } else if (operacao.operation === 'sell') {
            let lucroPrejuizo = totalOperacao - (estado.mediaPonderada * operacao.quantity);

            if (lucroPrejuizo > 0) {
                let lucroReal = lucroPrejuizo - estado.prejuizo;

                if (lucroReal > 0 && totalOperacao > 20000) {
                    imposto = 0.2 * lucroReal;
                }

                estado.prejuizo = Math.max(0, estado.prejuizo - lucroPrejuizo);
            } else {
                estado.prejuizo -= lucroPrejuizo;
            }

            estado.quantidade -= operacao.quantity;
        }

        resultado.push({ tax: Number(imposto.toFixed(2)) });
    }

    return resultado;
}


function processarArquivo(nomeArquivo) {
    const conteudoArquivo = fs.readFileSync(nomeArquivo, 'utf-8');
    const operacoes = JSON.parse(conteudoArquivo);
    const resultado = calcularImposto(operacoes);
    console.log(resultado);
}

function main() {
    
    const args = process.argv.slice(2);

    
    if (args.length === 0) {
        console.log('Uso: case1.json caminho-do-arquivo1.json caminho-do-arquivo2.json ...');
        process.exit(1); // Encerra o programa com código de erro
    }

    // Processa cada arquivo na lista de argumentos
    for (const nomeArquivo of args) {
        processarArquivo(nomeArquivo);
    }
}

// Adicione a execução da função main se o arquivo for executado diretamente
if (require.main === module) {
    main();
}
