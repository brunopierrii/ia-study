import readline from "readline";
import { Ollama } from "ollama";

const ollama = new Ollama();

const colors = {
    reset: '\x1b[0m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    bold: '\x1b[1m'
  };
  

const showBanner = () => {
  console.log(`
    ${colors.blue}${colors.bold}
    ${colors.cyan}Bem-vindo! Faça uma pergunta para começar a conversa.
    Digite ${colors.yellow}'ajuda'${colors.cyan} para ver os comandos disponíveis.
    Digite ${colors.yellow}'sair'${colors.cyan} para encerrar o programa.${colors.reset}
`);
};

const readlineConsole = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function showLoading() {
  const loadingChars = ['|', '/', '-', '\\'];
  let i = 0;
  
  return setInterval(() => {
    process.stdout.write(`\r${colors.yellow}Processando ${loadingChars[i++ % loadingChars.length]} ${colors.reset}`);
  }, 100);
}

function stopLoading(loadingInterval) {
  clearInterval(loadingInterval);
  process.stdout.write('\r                      \r');
}

async function getAI(prompt) {
  const response = await ollama.chat({
    model: 'qwen2.5:1.5b',
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  })

  return response;
}

function getFallbackResponse(prompt) {
  const responses = [
    'Desculpe, estou com dificuldades para me conectar com o modelo LLM neste momento.',
    'Olá! Sou uma resposta simulada pois estamos com problemas na conexão com a API.',
    'A API está indisponível no momento. Por favor, tente novamente mais tarde.',
    `Recebi sua mensagem: "${prompt}", mas a modelo LLM está fora do ar agora.`,
    'Estou funcionando no modo offline. Minhas respostas são limitadas.',
    'Por favor, verifique sua conexão com a internet e tente novamente.'
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}


function processCommand(command) {
  switch(command.toLowerCase()) {
    case 'ajuda':
      console.log(`
        ${colors.green}Comandos disponíveis:${colors.reset}
        ${colors.yellow}ajuda${colors.reset} - Exibe esta mensagem de ajuda
        ${colors.yellow}limpar${colors.reset} - Limpa a tela do terminal
        ${colors.yellow}sobre${colors.reset} - Exibe informações sobre este programa
        ${colors.yellow}modelos${colors.reset} - Exibe informações sobre os modelos de IA disponíveis
        ${colors.yellow}sair${colors.reset} - Encerra o programa
      `);
      return true;
    
    case 'limpar':
      console.clear();
      showBanner();
      return true;
      
    case 'sobre':
      console.log(`
        ${colors.green}Breezy AI Connect - v1.0${colors.reset}
        Uma interface simplificada para consultar modelos de IA diretamente do terminal.
        Esta aplicação utiliza APIs abertas e gratuitas para gerar respostas.

        ${colors.yellow}Desenvolvido com Lovable.dev${colors.reset}
      `);
      return true;
    
    case 'modelos':
      console.log(`
        ${colors.green}Modelos de IA Disponíveis:${colors.reset}
        Atualmente estamos utilizando o modelo ${colors.yellow}qwen2.5:1.5b${colors.reset}, 
        que é um modelo de linguagem de código aberto com 350 milhões de parâmetros.

        Se este modelo não estiver respondendo corretamente, o programa entrará em modo de fallback.

        Para usar outros modelos, você pode editar o código-fonte e alterar o URL da API.
      `);
      return true;
      
    case 'sair':
      console.log(`${colors.blue}Obrigado por usar nossa AI. Até breve!${colors.reset}`);
      readlineConsole.close();
      process.exit(0);
      
    default:
      return false;
  }
}

function startConversation() {
  showBanner();
  
  let consecutiveFailures = 0;
  let fallbackMode = false;
  
  function askQuestion() {
    readlineConsole.question(`${colors.bold}${colors.green}Você: ${colors.reset}`, async (input) => {

      if (processCommand(input)) {
        askQuestion();
        return;
      }
      
      if (input.trim() === '') {
        console.log(`${colors.yellow}Por favor, digite uma pergunta ou comando.${colors.reset}`);
        askQuestion();
        return;
      }
      
      const loadingInterval = showLoading();
      
      if (fallbackMode) {
        setTimeout(() => {
          stopLoading(loadingInterval);
          const response = getFallbackResponse(input);
          console.log(`${colors.bold}${colors.blue}IA (Modo Offline): ${colors.reset}${response}`);
          askQuestion();
        }, 1000);
        return;
      }
      
      try {
        const response = await getAI(input);
        stopLoading(loadingInterval);

        console.log(`${colors.bold}${colors.blue}IA thug life: ${colors.reset}${response.message.content}`);
        
        consecutiveFailures = 0;
      } catch (error) {
        stopLoading(loadingInterval);
        console.log(`${colors.red}Erro: ${error}${colors.reset}`);
        
        consecutiveFailures++;

        if (consecutiveFailures >= 3) {
          fallbackMode = true;
          console.log(`${colors.yellow}Entrando em modo offline após múltiplas falhas de conexão.${colors.reset}`);
          console.log(`${colors.yellow}Use o comando 'ajuda' para ver as opções disponíveis.${colors.reset}`);
        }
      }
      
      askQuestion();
    });
  }
  
  askQuestion();
}

// Inicia o programa
startConversation();