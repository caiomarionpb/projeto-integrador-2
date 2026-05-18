/* Autor: Noemi Kayama */


/* =================================================== Redirecionamento caso o docente não esteja logado =================================================== */
// Obtenção do token armazenado no localStorage do navegador
const token = localStorage.getItem("token");
// Verificação se o token existe
if(!token){
    // Aviso de acesso inválido
    alert("Você precisa estar logado para acessar essa página.");
    // Redirecionamento para a página de login (caso o professor não esteja logado)
    window.location.href = "../pages/index.html";
}
/* ======================================================================================================================================================= */

// Importando a porta que será utilizada nas rotas
import {port} from './formAssets.js';

/* =================================================== Redirecionamento caso a turma não seja do docente =================================================== */

// Obtendo a string de consulta da URL, que contém os parâmtros passaados (id da classe)
const queryString = window.location.search; // Retorna "?nome=Maria&idade=25"

// Instanciando a URLSearchParams para obter os parâmetros da URL
const params = new URLSearchParams(queryString);

// Se os parâmetros estiverem definidos, não forem numéricos ou estiverem vazios
if(params && params != '' && !isNaN(Number(params.get('subject'))) && !isNaN(Number(params.get('class')))){
  // Obtendo o valor específico aramzenado no parâmetro "subject"
  var subjectId = Number(params.get('subject'));
  
  // Obtendo o valor específico aramzenado no parâmetro "class"
  var classId = Number(params.get('class'));
}
// Se os parâmetros não estiverem definidos
else{
  alert('Um ou mais parâmetros essenciais não foram informados ou foram informados incorretamente.\nTe redirecionando para a página inicial...');
  window.location.href = '../pages/home.html';
}

document.addEventListener('DOMContentLoaded', verifyOwnership);

async function verifyOwnership(){
    try{
        // Faz a requisição para a rota que acessa o banco e retorna se esse é ou não o primeiro acesso
        const response = await fetch(`http://localhost:${port}/professor-owns-class/${classId}`, {
            method: 'GET',
            headers:{
                // Passa o token de segurança como parâmetro
                'Authorization': `Bearer ${token}`
            }
        });
        
        // Se não houver nenhum erro no servidor...
        if(response.status !== 500){
            // Verifica se a resposta está na faixa 200 (sucesso)
            if(response.ok){
                // Obtém a resposta em formato json para a análise do resultado
                const responseData = await response.json();
                // Se o professor não for o dono da turma...
                if(responseData.owns === false){
                    // Aviso de acesso inválido
                    alert("Você não tem autorização para acessar essa página.");
                    // Redirecionamento para a página inicial
                    window.location.href = "../pages/home.html";
                }
            }
            // Caso o status da resposta não esteja na faixa 200 ou 500, emite uma mensagem de erro
            else{
                alert("Erro ao buscar os dados do usuário.");
                // Redirecionamento para a página inicial
                window.location.href = "../pages/home.html";
            }
        }
        // Se houver erro interno no servidor (faixa 500)
        else{
            alert("Erro ao se conectar com o servidor! Tente novamente mais tarde.");
            // Redirecionamento para a página inicial
            window.location.href = "../pages/home.html";
        }
    }
    // Captura qualquer erro que ocorra durante a requisição
    catch (error) {
        console.error("Erro na requisição:", error);
        alert("Erro ao se conectar com o servidor! Tente novamente mais tarde.");
    }
}

/* ======================================================================================================================================================= */

/* ======================================================= Fetch para a importação de alunos ============================================================= */

// Evento disparado quando o conteúdo do DOM é carregado
document.addEventListener("DOMContentLoaded", () => {
  // Variável que referencia o input de arquivo CSV
  const inputCsv = document.getElementById("csvFile");
  // Variável que referencia o botão de envio do CSV
  const btnEnviarCsv = document.getElementById("enviarCsv");
  // Variável que referencia o elemento de status
  const statusCsv = document.getElementById("statusCsv");
  // Verificação se os elementos do DOM foram encontrados
  if (!inputCsv || !btnEnviarCsv || !statusCsv) {
    // Log de erro no console
    console.error("Erro: Um ou mais elementos do DOM não foram encontrados.");
    return;
  }

  // Evento disparado ao clicar no botão de envio do CSV
  btnEnviarCsv.onclick = async () => {
    // Limpa o status anterior
    statusCsv.textContent = "";
    // Obtém o arquivo selecionado no input
    const file = inputCsv.files && inputCsv.files[0];
    // Verifica se um arquivo foi selecionado
    if (!file) {
      // Atualiza o status com uma mensagem de erro
      statusCsv.textContent = "Selecione um arquivo .csv.";
      statusCsv.className = "err";
      return;
    }
    // Cria um objeto FormData para enviar o arquivo
    const form = new FormData();
    form.append("file", file);
    // Tenta enviar o arquivo para o servidor
    try {
      // Atualiza o status para indicar que o upload está em andamento
      statusCsv.textContent = "Enviando e processando...";
      statusCsv.className = "";
      // Faz a requisição POST para o endpoint de importação CSV
      const resp = await fetch(`http://localhost:${port}/csvimport/${classId}`, {
        // Método da requisição POST
        method: "POST",
        // Corpo da requisição com o arquivo CSV
        body: form,
        headers:{
          // Passa o token de segurança como parâmetro
          'Authorization': `Bearer ${token}`
        }
      });
      // Aguarda a resposta em formato JSON
      const data = await resp.json();
      // Verifica se a resposta não foi bem-sucedida
      if (!resp.ok) {
        // Verifica se o status da resposta é 400 (Bad Request)
        if(resp.status === 400) {
          // Mostra um alerta específico para RAs duplicados
          alert("Não é possível importar alunos com o mesmo RA");
        }
        // Lança um erro com a mensagem da resposta ou uma mensagem padrão
        throw new Error(data?.message || "Falha no upload");
      }
      // Atualiza o status com a quantidade de alunos inseridos
      statusCsv.textContent = `Importação concluída: ${data.totalInseridos} alunos inseridos.`;
      statusCsv.className = "ok";
      // Redireciona para a página de alunos
      window.location.href = `../pages/students.html?class=${classId}`
      // Limpa o input de arquivo
      inputCsv.value = ""; 
    // Captura qualquer erro ocorrido durante o processo
    } catch (err) {
      // Log de erro no console
      console.error("Erro capturado no frontend:", err);
      // Atualiza o status com a mensagem de erro
      statusCsv.textContent = `Erro ao importar: ${err.message}`; 
      statusCsv.className = "err";
    }
  };
});

/* ================================================================================================================================================================ */
