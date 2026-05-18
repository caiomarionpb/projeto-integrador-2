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
/* ========================================================================================================================================================= */

/* ==================================================================== Importações ======================================================================== */

// Importando a porta que será utilizada nas rotas
import {port} from './formAssets.js';

// Importando a função de carregamento do menu principal
import {loadHierarchyMenu, logout} from './hierarchyMenu.js';

// A função de carregar a hierarquia de dados atrelada ao docente será chamada quando a página for carregada
document.addEventListener("DOMContentLoaded", loadHierarchyMenu);

// Botão de logout
const logoutButton = document.getElementById("logoutButton");

// Se o botão estiver definido, adiciona a função ao evento de clique
if (logoutButton) {
    logoutButton.addEventListener("click", logout);
}

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
  // Redirecionamento para a página inicial
  window.location.href = '../pages/home.html';
}

// Adicionando o evento de verificação de posse da turma ao carregamento da página
document.addEventListener('DOMContentLoaded', verifyOwnership);

// Função de verificação de posse da turma
async function verifyOwnership(){
    try{
        // Faz a requisição para a rota que acessa o banco e retorna se esse é ou não o primeiro acesso
        const response = await fetch(`http://localhost:${port}/professor-owns-class/${classId}`, {
            // Método da requisição
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

/* ================================================================================================================================================================ */


/* =========================================================== Fetch para a visualização do aluno ================================================================= */

// Executa a função de visualizar os alunos ao carregar a página
document.addEventListener("DOMContentLoaded", viewStudents);

// Função assíncrona para a visualização dos alunos em uma respectiva turma
async function viewStudents() {
  try {
    // Fetch da rota de visualização de alunos de uma turma 
    const response = await fetch(`http://localhost:${port}/students/${classId}`, {
        // Indica que o método HTPP relacionado à rota é o GET
        method: "GET",
        headers: {
            // Passa o token de segurança como parâmetro no cabeçalho da requisição
            'Authorization': `Bearer ${token}`
      }
    });
    // Se a resposta for de sucesso
    if (response.status == 200) { 
        // Pega o array de alunos para poder imprimir a tabela
        const studentsArray = await response.json(); 
        // Chama a função void de imprimir alunos de aconto com o array de alunos
        printTable(studentsArray); 
    // Caso contrário, se a resposta for o status 404
    } else if (response.status == 404){ 
        // Pega o JSON com a mensagem/informações do erro
        const errorInfo = await response.json(); 
        // Emite um alerta que contém a mensagem do JSON que errorInfo recebe
        alert("Falha ao buscar: " + (errorInfo.message));
    }
  } catch (error) {
    // Caso de erro e não consiga conectar à rota, emite um alerta de erro ao tentar se conectar com o servidor
    alert("Erro de conexão com o servidor.");
  }
}

// Função síncrona de imprimir alunos em uma tabela a partir do array de alunos (parâmetro da tabela)
function printTable(students) {
    // Cria o elemento tBody para o ID da tabela no html, para, a partir dele, efetuar as alterações na tabela
    const tBody = document.getElementById("table-data");
    // Se a variável tBody for nula, sair da função de imprimir a tabela
    if (!tBody) return; 

    // Certificar de que, inicialmente, a tabela esteja vazia e sem nenhum elemento pendente
    tBody.innerHTML = ""; 

    // Se o array de alunos for nulo ou não tiver nenhum elemento
    if (!students || students.length === 0) {
    // Indicar no elemento da tabela que nenhum aluno foi encontrado
    tBody.innerHTML = '<tr><td colspan="3">Nenhum aluno encontrado.</td></tr>';
    // Sair da função de imprimir aluno
    return;
    }
    
    // Caso o array de alunos tenha conteúdo, para cada linha do array, realizar a seguinte tarefa
    students.forEach((student) => {
    // Cria uma linha de tabela para cada conjunto de dados do array de alunos, ou seja, para cada aluno
    const tr = document.createElement("tr");
    // Para cada linha, criar os seguintes elementos: um check-box, o ID do aluno e o seu respectivo nome completo
    tr.innerHTML = `
        <td><input type="checkbox" id="select_${student.ra}" class="selectStudent" value="${student.ra}" unchecked /></td>
        <td>${student.ra || "Sem RA"}</td>     
        <td>${student.name || "Sem Nome"}</td>
    `;
    // Adiciona um nó na tabela que contém os dados acima (para cada linha)
    tBody.appendChild(tr);
    });
}

/* ================================================================================================================================================================ */

/* ======================================================== Fetch para a adição/atualização de aluno ============================================================== */

// Constantes que recebem os dados inseridos nos inputs da página de adicionar alunos (ID, nome e turma da página carregada)
const raInput = document.getElementById("inputID");
const nameInput = document.getElementById("inputName");

// Criação da função assíncrona que adiciona/atualiza alunos 
async function addStudents() {
    // Declaração e inicialização de variáveis que contém o ID e o nome do aluno a partir dos valores inseridos nos respectivos inputs
    let ra = raInput.value;
    let name = nameInput.value;

    // Declaração e inicialização do corpo da requisição, que irá conter o ID, o nome e a turma (que vem com a página) do aluno
    const bodyReqData = {
    ra: String(ra),
    name: String(name),
    class: Number(classId)
    };

    try {
        // Constante que recebe o fetch da tora de adicionar/atualizar alunos
        const result = await fetch(`http://localhost:${port}/addStudents/${classId}`, {
            // Indica que o método HTTP da rota é o POST
            method: "POST",
            // Transforma o objeto em JS do corpo da requisição em uma string JSON
            body: JSON.stringify(bodyReqData),
            // "Cabeçalho da requisição"
            headers: {
                // Diz que o tipod e conteúdo que a rota vai utilizar é o formato JSON
                "Content-Type": "application/json",
                // Passa o token de segurança como parâmetro
                'Authorization': `Bearer ${token}`
            }
        });
        // Para qualquer resultado com status diferente de 500
        if (result.status !== 500) {
            // Emite um alerta de sucesso ao adicionar ou atualizar uma aluno
            alert("Aluno adicionado com sucesso!");
            // Recarrega a tabela de alunos
            viewStudents();
        }
        // Caso o erro seja igual a 500
        else {
            // Emitir um alerta de que ocorreu um erro ao cadastrar um aluno
            alert("Erro ao cadastrar aluno");
        }
    // Caso a requisição dê erro
    } catch(err){
        // Imprimir no console qual foi o erro ao tentar fazer a requisição
        console.log("Erro: ", err);
        // Emitir um alerta de erro na requisição
        alert("Erro na requisição! Tente novamente!");
        // Lança o erro e interrompe a execução da função, avisando que ocorreu um erro
        throw err;
    }
}

// Constante relacionada com o botão de "Salvar"
const saveStudent = document.getElementById("btnSave");
// Cria uma funcionalidade de, ao clicar no botão de "Salvar", a função de adicionar/atualizar aluino seja executada
saveStudent.addEventListener("click", addStudents);
// Variável que referencia o botão de "Importar Alunos"
const importStudents = document.getElementById("btnImportStudents");
// Adiciona um listener para o clique no botão de importar alunos
importStudents.addEventListener("click", () => {
    // Redireciona para a página de importar alunos
    window.location.href = `../pages/importStudents.html?subject=${subjectId}&class=${classId}`;
});
// Variável que referencia o botão de Voltar
const returnToClass = document.getElementById("back");
// Adiciona um listener para o clique no botão de voltar
back.addEventListener('click', ()=>{
    // Redireciona para a página de aluno
    window.location.href = `../pages/students.html?subject=${subjectId}&class=${classId}`;
})
/* ================================================================================================================================================================ */

/* ============================================================= Fetch para a exclusão de aluno =================================================================== */

// Adicionando o evento de exclusão de aluno(s) ao botão de apagar
document.getElementById("btnDelete").addEventListener('click', deleteSelectedStudents)

// Função para obter um array com os RAs dos alunos selecionados
async function deleteSelectedStudents() {
    // Obtém todos os checkboxes com as classe selectStudent
    const checkboxes = document.querySelectorAll('.selectStudent');
    // Converte o resultado obtido anteriormente para um array apenas com os checkboxes marcados
    const checkboxesSelecionados = Array.from(checkboxes).filter(checkbox => checkbox.checked);
    // Cria um array apenas com os valores dos checkboxes marcados
    const selectedValues = checkboxesSelecionados.map(checkbox => checkbox.value);
    // Se o array estiver vazio, emite uma mensagem de erro
    if(selectedValues == ""){
        alert('Nenhum aluno selecionado');
    }
    // Se o array estiver preenchido, prossegue com a exclusão
    else{
        try{
            // Constante que recebe o fetch da tora de adicionar/atualizar alunos
            const response = await fetch(`http://localhost:${port}/deleteStudent/${classId}`, {
                // Indica que o método HTTP da rota é o DELETE
                method: "DELETE",
                // Transforma o objeto em JS do corpo da requisição em uma string JSON
                body: JSON.stringify(selectedValues),
                // "Cabeçalho da requisição"
                headers: {
                    // Diz que o tipod e conteúdo que a rota vai utilizar é o formato JSON
                    "Content-Type": "application/json",
                    // Passa o token de segurança como parâmetro
                    'Authorization': `Bearer ${token}`
                }
            });
            // Guarda o valor em json recebido do fetch
            const responseData = await response.json();
            // Se o status for de sucesso
            if(response.status == 200){
                // Emite mensagem de sucesso
                alert(responseData.message);
                // Desmarca o seletor geral do cabeçalho
                document.getElementById('checkBoxDeleteStudents').checked = false;
                // Atualiza a tabela
                await viewStudents();
            }
            else{
                // Qualquer outro status da resposta, mostra alerta de erro
                alert(responseData.error);
            }
        }
        // Caso falha na requisição
        catch(error){
            // Emite um alerta de erro
            alert(`Erro ao acessar rota: ${error}`);
        }
    }
}

// Seleciona o id do checkbox de selecionar todos os alunos para deletar e adiciona um evento que dispara toda vez que o estado do checkbox muda
document.getElementById('checkBoxDeleteStudents').addEventListener('change', selectAllStudents);

// Função para selecionar todos os checkboxs individuais de cada aluno da tabela
function selectAllStudents(){
    // Varíavel que seleciona todos os checkboxes individuais dos alunos
    const checkboxes = document.querySelectorAll('.selectStudent');
    
    // Loop para processar cada checkbox individual
    checkboxes.forEach(element => {
        // Se o elemento checado for true(marcado), ele se tornará false (desmarcado). Agora, se o elemento checado for false(desmarcado), se tornará true(marcado);
        element.checked = element.checked == true ? false : true;
    });
}

