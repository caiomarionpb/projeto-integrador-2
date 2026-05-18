/* Autor: Enzo Olivato Pazian */

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

/* ====================================================== Importação da porta que roda o servidor ======================================================== */

// Importando a porta que será utilizada nas rotas
import {port} from './formAssets.js';

/* ======================================================================================================================================================= */

/* ================================================= Importação das funcionalidades básicas do projeto =================================================== */

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
if(params && params != '' && !isNaN(Number(params.get('subject'))) && !isNaN(Number(params.get('class'))) && params.get('subject') != '' && params.get('class') != ''){
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

// Adiciona uma escuta de evento ao carregar a página e chama a função que verifica se a página pertence mesmo ao docente
document.addEventListener('DOMContentLoaded', verifyOwnership);

// Função assíncrona que verifica se a página pertence ao docente logado
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

/* ================================================================================================================================================================ */7
// Variáveis Globais

    // Array com as informações dos estudantes
    let studentsArray = [];
    // Array com as informações dos componentes de nota
    let componentsArray = [];
    // Array para armazenar as notas
    let gradesArray = []; 
    // Variável que guarda o nome da turma
    let className = '';
    // Variável que guarda o código da matéria
    let subjectCode ='';
 

/* ============================================ Fetches das rotas de visualização de alunos e de componentes ====================================================== */

// Adiciona um listener para o evento DOMContentLoaded para carregar os alunos ao carregar a página
document.addEventListener("DOMContentLoaded", viewData);

// Função para exibir os alunos
async function viewData() {
    // Declaração das variáveis utilizadas no carregamento das informações 
    // Bloco de busca dos dados dos alunos
    try {
        // Chamando a rota que obtém os dados dos estudantes associados a uma turma
        const response = await fetch(`http://localhost:${port}/students/${classId}`, {
            // Método da requisição
            method: "GET",
            // Passando o token de autorização pelo cabeçalho
            headers: {
              'Authorization': `Bearer ${token}`
            }
        });

        // Se o status da resposta for 200 -> sucesso
        if (response.status === 200) { 
            // Armazena o array de alunos retornado através do JSON da resposta do fetch
            studentsArray = await response.json();
          // Caso contrário, se o status da resposta for 404 -> ão foi encontrado nenhum aluno
        } else if (response.status === 404){ 
            // Emite um alerta de que nenhum aluno foi encontrado
            alert("Nenhum aluno encontrado.");
        } else {
            // Por fim, se não for nenhuma dessas situações, quer dizer que ocorreu uma falha no servidor. Portanto, emite-se um alerta
            alert("Falha no servidor ao buscar alunos.")
        }
      // Captura o erro
    } catch (error) {
        // Emite um alerta de erro na conexão
        alert("Erro de conexão ao buscar alunos.");
    }
    
    // Bloco de busca dos dados dos componentes de nota
    try {
      // Chamando a rota que obtém as informações dos componentes de nota
        const result = await fetch(`http://localhost:${port}/viewComponents/${classId}`, {
            // Método da requisição
            method: "GET",
            // Passando o token de autorização pelo cabeçalho
            headers: {
              'Authorization': `Bearer ${token}`
            }
        });

        // Se o status da resposta for 200 -> sucesso
        if (result.status === 200) { 
            // Armazena o array com as informações dos componentes retornadas através do JSON da resposta do fetch
            componentsArray = await result.json();
        }
        // Se nenhum componente for encontrado (404 - Not found)
        else if (result.status === 404){ 
            // Emite uma mensagem de erro
            alert("Nenhum componente encontrado.");
        }
        // Caso o status seja diferente, emite uma mensagem de erro
        else {
            alert("Falha no servidor ao buscar componentes.")
        }
    }
    // Captura o erro que ocorreu durante a busca dos dados de componente e emite uma mensagem de erro
    catch (error) {
        alert("Erro de conexão ao buscar componentes.");
    }

    // Bloco de busca das notas dos alunos para cada componente
    try {
        // Chamando a rota que obtém os dados das notas de cada estudante da turma
        const gradeRes = await fetch(`http://localhost:${port}/grades/${classId}`, {
            // Método da requisição
            method: "GET",
            // Passando o token de autorização pelo cabeçalho
            headers: {
              'Authorization': `Bearer ${token}`
            }
        });

        // Se o status da resposta for 200 -> sucesso
        if (gradeRes.status === 200) { 
            // Armazena o array com as notas relacionadas entre aluno e componentes retornadas através do JSON da resposta do fetch
            gradesArray = await gradeRes.json();
        }
        // Se nenhuma nota associada às informações ou a rota forem encontradas (404 -> not found)
        else if (gradeRes.status === 404){ 
            // Emite um alerta de erro
            alert("Nenhuma nota cadastrada");
            // Define o array de notas como um array padrão para evitar problemas com o tipo de dado             
            gradesArray = [];
        }
        // Caso o status seja diferente, emite uma mensagem de erro
        else {
            alert("Falha no servidor ao buscar notas.")
        }
    }
    // Captura o erro que ocorreu durante a busca das notas e emite uma mensagem de erro
    catch (error) {
        alert("Erro de conexão ao buscar notas.");
    }

    // Bloco de busca para os dados da turma (composição do nome do CSV de exportação)
    try {
      // Acessa a rota que retorna o nome da turma e a sigla da disciplina
        const infoRes = await fetch(`http://localhost:${port}/class_info/${classId}`, {
          // Método da requisição
            method: "GET",
            // Token de autorização
            headers: { 'Authorization': `Bearer ${token}` }
        });
        // variavel que guarda o json das informações pegadas da rota
        const data = await infoRes.json();
        
        // Se o status da resposta for 200 e a variavel data nao estiver vazia 
        if (infoRes.status === 200 && data[0] != null) { 
          // Obtém o objeto retornado do nome da turma e a sigla da materia
            className = data[0].className;
            subjectCode = data[0].subjectCode;
           
        } else {
            console.log("Informações da turma não encontradas.");
            // Define valores padrão para o nome do arquivo (os parâmetros da URL)
            className = `${classId}`;
            subjectCode = `${subjectId}`;
        }
    } catch (error) {
        alert("Erro de conexão ao buscar informações da turma.");
    }

    // Chamar a função para imprimir a tabela com todos os dados, passando todos os 3 arrays necessários para sua construção
    printTable(componentsArray, studentsArray, gradesArray);
}

/* ================================================================================================================================================================ */

/* ============================================== Impressão da tabela de alunos com RA, Nome e componentes ======================================================== */

// Função de exibição da tabela principal de turmas, que contém o RA, o nome, os componentes e as notas de um aluno, recebendo os arrays obtidos da função viewData como parâmetros
function printTable(components, students, grades) {
  
  // Cria um elemento thead que abrigará os títulos do cabeçalho da tabela, incluindo RA, Nome ee a sigla dos componentes, que serão renderizados 
  // Thead recebe a referência da tabela principal usada no HTML
  const thead = document.getElementById("table-component");

  // Se thead não estiver definida, retorna a função e encerra sua operação
  if(!thead) return;

  // Se thead estiver definido, remove seu conteúdo interno para permitir a criação da tabela
  thead.innerHTML = ""; 
  
  // Cria uma linha na tabela a armazena em uma variável para que possa ser menipulada
  const headerRow = document.createElement("tr");
  // Atribui à nova linha duas colunas de título: Matrícula e Nome do auluno
  headerRow.innerHTML = `
    <th>Matrícula</th>
    <th>Nome</th>
  `;

  // Se o array de componentes estiver indefinido ou seu tamanho for 0 (array vazio)
  if (!components || components.length === 0) {
    // Atribui à coluna de título uma mensagem de erro
    headerRow.innerHTML += '<th colspan="3">Nenhum componente encontrado.</th>';
  } else {
    // Se os componentes existirem, ou seja, se eo array estiver definido e seu tamanho for maior que 0, percorre o array para criar colunas relacionadas aos componentes
    components.forEach((component) => {
      // Cria uma nova coluna de título para a tabela e armazena ela em uma variável para manipulá-la
      const th = document.createElement("th"); 
      
      // Verifica se o componente atual é a média final para impedir que o botão de edição seja renderizado
      const isMF = component.code.toUpperCase() === 'MF';
      
      let buttonHTML = ''; // Inicia sem botão
      
      // Só adiciona o botão de edição se NÃO FOR a Média Final
      if (!isMF) {
        // Adiciona o nome do componente e o botão de editar à coluna de título recém criada
        // Adiciona o título no span, que, caso haja erro na obtenção do nome, coloca um nome genérico
        // Para o botão de salvar, atribui ao parâmetro data-component-id o id do componente que está sendo exibido, que será utilizado como identificador na função de edição/salvamento de notas
        buttonHTML = `
            <button class="btn btn-sm btn-outline-primary edit-component-btn" data-component-id="${component.id}">
                <i class="bi bi-pencil"></i>
            </button>
        `;
      }
      
      // Renderiza o cabeçalho com as informações necessárias
      th.innerHTML = `
        <div class="componentHeader">
        <span>${component.code.toUpperCase() || "Sem Comp."}</span>
        ${buttonHTML}
        </div>
      `;
      headerRow.appendChild(th); 
    });
  }
  // Adiciona a linha de cabeçalho completa
  thead.appendChild(headerRow); 

  // Cria uma constante para o elemento de tabela do HTML que contém o id "table-data"
  const tbody = document.getElementById("table-data");
  // Se não existir este elemento, não retornar nenhum valor e sair da função
  if (!tbody) return; 
  // Inicializar o corpo da tabela (inicialmente vazio)
  tbody.innerHTML = ""; 

  // Se o array de alunos passado não existir ou tiver tamanho igual a zaro (vazio)
  if (!students || students.length === 0) {
    // Atribui ao corpo da tabela uma linha com uma única coluna que exibe a mensagem de aluno não encontrado
    tbody.innerHTML = '<tr><td colspan="'+ (2 + (components ? components.length : 1)) +'">Nenhum aluno encontrado.</td></tr>';
    // Não retorna nenhum valor e sai da função
    return;
  }
  // Se o array de alunos tiver elementos, executar para cada um deles:
  students.forEach((student) => {
    // Cria uma constante que representa um elemento HTML tr, ou seja, table row (linha de tabela) para poder inserir os valores
    const tr = document.createElement("tr");
    // Insere em cada linha o RA e o nome dos respsectivos alunos
    tr.innerHTML = `
      <td>${student.ra || "Sem RA"}</td> 
      <td>${student.name || "Sem Nome"}</td>
    `;

    // Agora, para cada aluno, adiciona uma célula para cada componente
    // Se o array de componentes estiver preenchido
    if (components && components.length > 0) {
        // Para cada componente de nota armaenado no array...
        components.forEach((component) => {
            // Encontra a nota do aluno para o componente específico
            const grade = grades.find(g => 
                // Verifica se o studentId e o componentId da nota correspondem ao RA do aluno e ao ID do componente
                g.studentId === student.ra && g.componentId === component.id
            );

            // Se a nota existir, obtém seu valor; caso contrário, define como uma string vazia
            const gradeValue = grade ? grade.value : '';

            // Verifica se é o componente MF
            const isMF = component.code.toUpperCase() === 'MF';

            // Se for MF, a classe será apenas "form-control"
            // Se NÃO for MF, a classe será "form-control grade-input"
            // A classe 'grade-input' é o que permite que a coluna seja editável
            const inputClass = isMF ? "form-control" : "form-control grade-input";

            // Cria uma nova célula da tabela para a nota
            const td = document.createElement("td");

            // Cria o input desabilitado com os atributos necessários necessários, entre eles:
            // O input recebe o tipo number para evitar a digitação de caracteres textuais e ser interpretado diretamente como um valor numérico
            // O input recebe as classes do bootstrap para fins de estilização
            // O input recebe um dataset com o id do estudante para poder identificá-lo ao salvar as alterações
            // O input recebe um dataset com o id do componente para poder identificá-lo ao salvar as alterações
            // O input poderá receber apenas dados numéricos de 0 a 10 variando de 0.01 em 0.01
            td.innerHTML = `
                <input 
                    type="number" 
                    class="${inputClass}" 
                    value="${gradeValue}" 
                    data-student-id="${student.ra}" 
                    data-component-id="${component.id}" 
                    disabled 
                    step="0.01"
                    min="0"
                    max="10"
                >`;
            // Adiciona o input criado à linha que pertence
            tr.appendChild(td);
        });
    }
    // Adiciona ao corpo da tabela as linhas criadas acima
    tbody.appendChild(tr);
  });
};



/* ================================================================================================================================================================ */

/* ================================================================== Lógica de Edição de Notas ================================================================= */

// Obtendo o tableHead para manipulá-lo
const tableHead = document.getElementById("table-component");
// Adiciona o listener para cliques no cabeçalho da tabela
tableHead.addEventListener('click', function(e) {
    // Verifica se o clique foi em um botão de editar
    const editButton = e.target.closest('.edit-component-btn');
    // Verifica se o clique foi em um botão de salvar
    const saveButton = e.target.closest('.save-component-btn');
    // Chama a função apropriada com base no botão clicado
    if (editButton) {
      // Caso o botão de editar tenha sido clicado, chama a função de edição
        handleEditClick(editButton);
    } else if (saveButton) {
      // Caso o botão de salvar tenha sido clicado, chama a função de salvar/
        handleSaveClick(saveButton);
    }
});

// Função para lidar com o clique no botão de editar
function handleEditClick(button) {
    // Obtém o ID do componente a partir do data-attribute do botão
    const componentId = button.dataset.componentId;
    // Obtém o corpo da tabela 
    const tableBody = document.getElementById("table-data");
    // Desabilita todos os inputs de notas
    tableBody.querySelectorAll('.grade-input').forEach(input => input.disabled = true);
    // Reverte todos os botões de salvar para o estado de editar
    tableHead.querySelectorAll('.save-component-btn').forEach(btn => {
        btn.innerHTML = '<i class="bi bi-pencil"></i>';
        btn.classList.replace('save-component-btn', 'edit-component-btn');
        btn.classList.replace('btn-success', 'btn-outline-primary');
    });
    // Habilita apenas os inputs do componente selecionado
    const inputsToEnable = tableBody.querySelectorAll(`.grade-input[data-component-id="${componentId}"]`);
    inputsToEnable.forEach(input => input.disabled = false);
    // Altera o botão de editar para salvar  
    button.innerHTML = '<i class="bi bi-save"></i>';
    button.classList.replace('edit-component-btn', 'save-component-btn');
    button.classList.replace('btn-outline-primary', 'btn-success'); // Muda a cor para verde
    // Desabilita todos os outros botões de editar enquanto estiver editando
    tableHead.querySelectorAll('.edit-component-btn').forEach(btn => btn.disabled = true);
}

// Função para lidar com o clique no botão de salvar
async function handleSaveClick(button) {
    // Obtém o ID do componente a partir do data-attribute do botão
    const componentId = button.dataset.componentId;
    // Obtém o corpo da tabela
    const tableBody = document.getElementById("table-data"); 
    // Array para armazenar as notas a serem salvas
    const gradesToSave = [];
    // Obtém todos os inputs do componente específico
    const inputs = tableBody.querySelectorAll(`.grade-input[data-component-id="${componentId}"]`);
    // Prepara os dados para envio
    inputs.forEach(input => {
        gradesToSave.push({
            studentId: input.dataset.studentId,
            componentId: parseInt(componentId),
            value: input.value ? parseFloat(input.value) : null // Envia null se o campo estiver vazio
        });
    });

    try {
        // Envia os dados para o backend pela rota de inserir ou atualizar notas 
        const response = await fetch(`http://localhost:${port}/grades-update-insert`, {
            // Método POST da reequiição HTTP
            method: 'POST',
            // "Cabeçalho" da requisição, indicando o tipo de conteúdo e enviando o token de autenticação
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            // Corpo da requisição
            body: JSON.stringify(gradesToSave)
        });
        // Obtém a resposta em formato json para a análise do resultado
        const responseData = await response.json();
        // Verifica se a resposta foi bem-sucedida
        if (response.ok && responseData.success) {
          // Emite um alerta que as notas foram salvas com sucesso
          alert('Notas salvas com sucesso!');
          // Realiza uma operação para cada um dos inputs
          inputs.forEach(input => input.disabled = true);
          // Reverte o botão de salvar para o estado de editar
          button.innerHTML = '<i class="bi bi-pencil"></i>';
          button.classList.replace('save-component-btn', 'edit-component-btn');
          button.classList.replace('btn-success', 'btn-outline-primary'); // Reverte a cor
          // Habilita todos os botões de editar novamente
          tableHead.querySelectorAll('.edit-component-btn').forEach(btn => btn.disabled = false);
        } else {
          // Emite um alerta de erro ao salvar as notas
          alert(`Erro ao salvar notas: ${responseData.error || 'Erro desconhecido'}`);
        }
    } catch (error) {
        // Captura qualquer erro que ocorra durante a requisição
        console.error("Erro na requisição de salvar notas:", error);
        alert('Erro de conexão ao salvar notas.');
    }
}


/* ================================================================================================================================================================ */

/* ==================================================================== Gerenciamento de componentes de nota ====================================================== */

// Adiciona um listener para o clique no botão de adicionar componente
document.getElementById("btnAddComponent").addEventListener("click", addComponent);
// Função para adicionar um componente de nota
async function addComponent(){

  // Obtendo o nome do componente de nota através do prompt
  let componentName = prompt("CADASTRO DE COMPONENTE DE NOTA PARA A DISCIPLINA\nInforme o nome do componente: (ex: Prova 1, Atividade avaliativa 1, etc)");
  // Se o campo não foi definido, foi abortado ou está em branco
  if(!componentName || componentName.trim() === ''){
    // Emite a mensagem de erro
    alert("Campo informado incorretamente...\nOperação abortada");
    // Aborta a função
    return;
  }

  // Obtendo a sigla do componente de nota através do prompt
  let componentCode = prompt("CADASTRO DE COMPONENTE DE NOTA PARA A DISCIPLINA\nInforme a sigla do componente: (ex: P1, P2, ATV1)");
  // Se o campo não foi definido, foi abortado ou está em branco
  if(!componentCode || componentCode.trim() === ''){
    // Emite a mensagem de erro
    alert("Campo informado incorretamente...\nOperação abortada");
    // Aborta a função
    return;
  }

  // Obtendo o nome do componente de nota através do prompt
  let componentDescription = prompt("CADASTRO DE COMPONENTE DE NOTA PARA A DISCIPLINA\nInforme uma descrição para o componente:");
  // Se o campo não foi definido, foi abortado ou está em branco
  if(!componentDescription || componentDescription.trim() === ''){
    // Emite a mensagem de erro
    alert("Campo informado incorretamente...\nOperação abortada");
    // Aborta a função
    return;
  }

  // Obtendo o peso do componente de nota através do prompt
  let componentWeight = prompt("CADASTRO DE COMPONENTE DE NOTA PARA A DISCIPLINA\nInforme o peso do componente: (ex: 1, 0.5, 50, etc)\nOBS.: Se quiser que o cálculo seja uma média simples, cadastre todos com o mesmo peso.");
  // Se o campo não foi definido, foi abortado, está em branco, não é numérico ou é menor ou igual a 0
  if(!componentWeight || componentWeight.trim() === '' || isNaN(Number(componentWeight)) || Number(componentWeight) <= 0){
    // Emite a mensagem de erro
    alert("Campo informado incorretamente...\nOperação abortada");
    // Aborta a função
    return;
  }
  // Monta o corpo da requisição com os dados do componente
  const body = {
    name: componentName,
    code: componentCode,
    description: componentDescription,
    weight: Number(componentWeight),
    subjectId: Number(subjectId)
  }
  try{
    // Envia os dados para o backend pela rota definida no switch case
    const response = await fetch(`http://localhost:${port}/addComponent/${subjectId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
    });
  
    // Se a resposta estiver na faixa 200 -> sucesso na operação
    if (response.ok) {
      // Obtém a resposta em formato json para a análise do resultado
      const responseData = await response.json();
      // Se a resposta indicar sucesso na operação
      if(responseData.success){
        // Emite um alerta de sucesso
          alert('Componente cadastrado com sucesso!');
          //
          viewData();
      }
      else{
        alert('Erro ao cadastrar componente. Tente novamente mais tarde.');
      }
    }
    // Se o status não for de sucesso, emite a mensagem de erro
    else {
        const err = await response.json();
        // Emite um alerta de erro
        alert(`Houve uma falha ao cadastrar: ${err.error || 'Erro desconhecido'}`);
    }
  }
  // Captura qualquer erro que ocorra durante a requisição
  catch(error){
    alert(`Erro ao cadastrar componente de nota: ${error}`);
  }
}

// Botão de cálculo da média final
const btnCalcFinalGrade = document.getElementById("btnCalcFinalGrade");
// Se o botão estiver definido no HTMl, adiciona o evento de cálculo da média final
if (btnCalcFinalGrade) {
    btnCalcFinalGrade.addEventListener("click", handleCalculateFinalGrade);
}

// Função de cálculo da média final
async function handleCalculateFinalGrade() {
    // Emite uma confirmação para o cálculo da média para evitar cálculos acidentais
    if (!confirm("Isso irá calcular (ou recalcular) a Média Final para todos os alunos com base nos componentes e pesos atuais.\n\nDeseja continuar?")) {
        return;
    }
    
    try {
        // Chama a nova rota que efetua o cálculo das notas finais
        const response = await fetch(`http://localhost:${port}/grades/calculate-final/`, {
            // Método da requisição 
            method: 'POST',
            // Cabeçalho da requisição
            headers: {
                // Tipo de conteúdo a ser passado no corpo da requisição
                'Content-Type': 'application/json',
                // Passando o token de autorização
                'Authorization': `Bearer ${token}`
            },
            // Enviando o id da turma e da disciplina pelo corpo da requisição
            body: JSON.stringify({classId: classId, subjectId: subjectId})
        });

        // Obtém a resposta da requisição
        const responseData = await response.json();

        // Verifica o status e o status de sucesso da resposta devolvida pela rota
        if (response.ok && responseData.success) {
            // Emite uma mensagem de sucesso
            alert('Médias finais calculadas e salvas com sucesso!');
            // Recarrega a tabela para mostrar a nova coluna "MF"
            await viewData(); 
        } else {
            // Mostra a mensagem de erro vinda do backend (ex: "Soma dos pesos é 0")
            alert(`Erro ao calcular médias: ${responseData.message || 'Erro desconhecido'}`);
        }
    } catch (error) {
        // Se houver algum erro durante a operação, emite uma mensagem de erro
        alert('Erro de conexão ao tentar calcular as médias.');
    }
}

/* ================================================================================================================================================================ */

/* ============================================ Redirecionamento de páginas ao clicar nos respectivos botões ====================================================== */

// Variável que referencia o botão de "Adicionar Alunos"
const addStudents = document.getElementById("btnAddStudents");
// Adiciona um listener para o clique no botão de adicionar alunos
addStudents.addEventListener("click", function() {
    // Redireciona para a página de adicionar alunos
    window.location.href = `../pages/addStudents.html?subject=${subjectId}&class=${classId}`;
});

/* ================================================================================================================================================================ */

/* ====================================================== Funções para a exportação do arquivo .csv =============================================================== */

// Função para gerar o padrão de formatação de data/hora do arquivo de exportação (YYY-MM- -DD_HHmmssm)
export function gerarTimestamp() {
    // A constante now recebe o valor da data/hora do momento da exportação
    const now = new Date();
    // Formatação de ano
    const yyyy = String(now.getFullYear());
    // Formatação de mês
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    // Formatação de dia
    const dd = String(now.getDate()).padStart(2, '0');
    // Formatação das horas
    const hh = String(now.getHours()).padStart(2, '0');
    // Formatação de minutos
    const mi = String(now.getMinutes()).padStart(2, '0');
    // Formatação de segundos
    const ss = String(now.getSeconds()).padStart(2, '0');
    // Formatação de milisegundos
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    
    // Retornar a string no formato solicitado no escopo
    return `${yyyy}-${mm}-${dd}_${hh}${mi}${ss}${ms}`;
}

// Constante que recebe o elemento button que exporta o arquivo .csv
const btnExportCsv = document.getElementById('btnExportCsv');

// Se o botão existir
if(btnExportCsv){
  // Ao efetuar o evento de "click" no botão, executar a função exportToCSV
  btnExportCsv.addEventListener("click", exportToCSV);
}

// Função que formata a célula do arquivo .csv a partir das informações que irão para o arquivo
function formatCSVCell(data) {
  // Na célula, se a informação for nula ou indefinida, ela é subtituida por uma string vazia
  let cell = String(data ?? ''); 
  
  // Substitui uma aspas duplas por duas aspas duplas
  cell = cell.replace(/"/g, '""');

  // Se a célula conter uma aspas dupla ou uma virguila ou quebra de linha
  if (cell.search(/("|,|\n)/g) >= 0) {
      // Envolve o valor da célula entre aspas duplas e coloca o novo valor na mesma variável
      cell = `"${cell}"`;
  }
  // Retorna a célula
  return cell;
}

// Função que exporta o arquivo .csv
function exportToCSV() {
    // Se o array de alunos tiver tamanho igual a zero
    if (studentsArray.length === 0) {
      // Emite um alerta dizendo que não há alunos cadastrados para serem exportados
      alert("Não há alunos para exportar.");
      // Não retorna nada e sai da função
      return;
    }

    // Cria o "cabeçalho" do arquivo de exportação
    const headers = ["Matrícula", "Nome"];

    // Vai para o array de componentes e realiza uma ação para cada "linha" do array
    componentsArray.forEach(component => {
      // Adiciona ao final do array as siglas de cada componente em letra maiúscula
      headers.push(component.code.toUpperCase());
    });

    // Junta os conteúdos do cabeçalho, separados por uma vírgula e termina com uma quebra de linha \n
    let csvContent = headers.map(formatCSVCell).join(',') + '\n';

    // Aqui começa a formatação das linhas, uma por vez
    studentsArray.forEach(student => {
      // Cria um array com o RA do aluno e o nome 
      const row = [student.ra, student.name];

      // Agora, para cada componente de nota, executa o seguinte
      componentsArray.forEach(component => {
          // Encontra os mesmos RAs e IDs de componente
          const grade = gradesArray.find(g => 
              g.studentId === student.ra && g.componentId === component.id
          );
          // Coloca a nota com o seu valor se existir e uma string vazia se não existir
          const gradeValue = grade ? grade.value : '';
          // Adiciona ao final do array "row" (acima), o valor da nota para aquele componente
          row.push(gradeValue);
      });
      // Junta os conteúdos do conteúdo ao que já existia, separando por uma vírgula e terminando com uma quebra de linha \n
      csvContent += row.map(formatCSVCell).join(',') + '\n';
    });

    // Chamada da função de download
    downloadCSV(csvContent);
}

// Função para o download do arquivo .csv
function downloadCSV(csvContent) {
    // Chama a função para gerar o horário atual
    const timestamp = gerarTimestamp();
    // Substituição de qualquer coisa que não seja letra e número por "_"
    // const cleanClassName = className.replace(/[^a-z0-9]/gi, '_'); // No nome da turma
    // const cleanSubjectCode = subjectCode.replace(/[^a-z0-9]/gi, '_'); // Na sigla da disciplina
    // Cria um blob com o conteúdo do arquivo .csv
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Cria uma tag <a> temporária na memória
    const link = document.createElement("a");
    
    // Cria uma URL para o blob que será enviado ao cliente
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    
    // Formatação do nome do arquivo .csv
    const fileName = `${timestamp}-Turma${className}_${subjectCode}.csv`;
    // Transforma o link da tag <a> em um arquivo "baixável", com o nome formatado acima
    link.setAttribute("download", fileName);

    // Deixa o link invisível
    link.style.visibility = 'hidden';
    // Anexa ao corpo o link
    document.body.appendChild(link);
    // Simula um clique
    link.click();
    // Remove o link do corpo
    document.body.removeChild(link);

    // Limpa a URL que foi gerado para o blob da memória
    URL.revokeObjectURL(url);
}


/* ================================================================================================================================================================ */
