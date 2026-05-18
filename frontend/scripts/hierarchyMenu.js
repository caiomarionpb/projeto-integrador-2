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

// Importando a porta que será utilizada nas rotas
import {port} from './formAssets.js';

/* ================================================================== Logout do sistema ================================================================== */

// Função de logout
export function logout() {
    // Remove o token do localStorage
    localStorage.removeItem("token");
    // Remove a flag de primeiro acesso do localStorage
    localStorage.removeItem("firstAccess");
    // Redireciona o usuário para a página de login
    window.location.href = "../pages/index.html";
}
/* ======================================================================================================================================================= */

/* ======================================================== Funções para o carregamento do menu lateral ================================================== */
// Função que carrega a hierarquia de dados atrelada ao docente
export async function loadHierarchyMenu() {
    // Obtém o container de menu para mainpulá-lo
    const menuContainer = document.getElementById("menu-container"); 
    // Se ele não estiver definido no HTML, exibe uma mensagem de erro e cancela a função
    if (!menuContainer) {
        console.error("Elemento 'menu-container' não encontrado no HTML.");
        return;
    }
    // Se o menu existir (a função não foi cancelada)
    try {
        // Acessa a rota para obter a hierarquia de dados
        const response = await fetch(`http://localhost:${port}/professor-hierarchy`, {
            // Define o método da requisição
            method: "GET",
            // Envia o token de autenticação para o cabeçalho da requisição
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        // Se o status retornado pela requisição estiver fora da faixa de sucesso (200)
        if (!response.ok) {
            // Se o status for 401 (não autorizado) ou 403 (acesso proibido) -> o token de login expirou
            if (response.status === 401 || response.status === 403) {
                // Envia um alerta indicando a expiração da sessão
                alert("Sua sessão expirou. Faça login novamente.");
                // Remove o token do local storage
                localStorage.removeItem("token");
                // Remove o controlador de primeiro acesso do local storage
                localStorage.removeItem("firstAccess");
                // Redireciona o usuário para a página de login
                window.location.href = "../pages/index.html";
            }
            // Envia um novo erro para a aplicação
            throw new Error("Erro ao buscar dados do menu.");
        }
        // Se a resposta tiver sido bem sucedida (faixa 200) e o usuário estiver autenticado, obtém o json com a estruturação dos dados do aluno
        const hierarchyData = await response.json();
        // Chama a função que estrutura o menu com base no json retornado pela requisição
        buildMenuDOM(hierarchyData, menuContainer);
    // Se houver algum erro durante a execução...
    } catch (error) {
        // Exibe o erro no console
        console.error(error);
        // Informa uma mensagem de erro no menu
        menuContainer.innerHTML = "<p>Erro ao carregar menu.</p>";
    }
}

// Função que constrói o menu lateral com base nos dados e agrupa os summarys
function buildMenuDOM(institutions, container) {
    // Limpa o container e adiciona a nova estrutura
    container.innerHTML = '';

    // Container principal de "Instituições"
    const rootDetails = document.createElement('details');
    rootDetails.open = true;
    
    // Summary de "Instituições"
    const rootSummary = createSummaryElement('Minhas instituições', 'user', false); 
    // Adicionando o elemento à página
    rootDetails.appendChild(rootSummary);

    // Botão de "Adicionar Instituição" dentro do details
    const addInstBtn = createAddButtonElement('institution', null);
    // Adicionando o elemento à página
    rootDetails.appendChild(addInstBtn);

    // Iteração de cada INSTITUIÇÃO
    institutions.forEach(inst => {
        const instDetails = document.createElement('details');
        instDetails.className = 'foundationDetails';
        
        // Summary da Instituição (sem botão)
        const instSummary = createSummaryElement(inst.name, 'institution', true, inst.id);
        // Adicionando o elemento à página
        instDetails.appendChild(instSummary);

        // Botão de "Adicionar Curso" (dentro do details da instituição)
        const addCourseBtn = createAddButtonElement('course', inst.id);
        // Adicionando o elemento à página
        instDetails.appendChild(addCourseBtn);

        // Iteração de cada CURSO
        inst.courses.forEach(course => {
            const courseDetails = document.createElement('details');
            courseDetails.className = 'coursesDetails';
            
            // Summary do Curso (sem botão)
            const courseSummary = createSummaryElement(course.name, 'course', true, course.id);
            // Adicionando o elemento à página
            courseDetails.appendChild(courseSummary);

            // Botão de "Adicionar Disciplina" (dentro do details do curso)
            const addSubjectBtn = createAddButtonElement('subject', course.id);
            // Adicionando o elemento à página
            courseDetails.appendChild(addSubjectBtn);

            // Iteração de cada DISCIPLINA
            course.subjects.forEach(subject => {
                const subjectDetails = document.createElement('details');
                subjectDetails.className = 'subjectsDetails';
                
                // Summary da Disciplina (sem botão)
                const subjectSummary = createSummaryElement(subject.name, 'subject', true, subject.id);
                // Adicionando o elemento à página
                subjectDetails.appendChild(subjectSummary);

                // Botão de "Adicionar Turma" (dentro do details da disciplina)
                const addClassBtn = createAddButtonElement('class', subject.id);
                // Adicionando o elemento à página
                subjectDetails.appendChild(addClassBtn);

                // Iteração de cada TURMA
                subject.classes.forEach(cls => {
                    // Nível da Turma
                    const classElement = createClassElement('classes', cls.name, 'class', cls.id, subject.id);
                    // Adicionando o elemento à página
                    subjectDetails.appendChild(classElement);
                });
                // Adicionando o elemento à página
                courseDetails.appendChild(subjectDetails);
            });
            // Adicionando o elemento à página
            instDetails.appendChild(courseDetails);
        });
        // Adicionando o elemento à página
        rootDetails.appendChild(instDetails);
    });
    // Adicionando o elemento à página
    container.appendChild(rootDetails);
}

// Função para criar o elemento para ser exibido no modelo da tag summary, recebendo o texto e o nome do ícone que serão exibidos
function createSummaryElement(text, iconName, isDeletable, id) {
    // Criando a tag summary
    const summary = document.createElement('summary');
    // Adicionando 'summary-container' para usar flexbox
    summary.className = 'summary-container'; 
    // Adicionando a estrutura dentro da tag criada
    summary.innerHTML = `
        <div class="topicIcon">
            <img src="../img/icons/${iconName}-light.png" alt="">
        </div>
        <div class="topicName">${text}</div>
    `;
    // Se o parâmetro que indica que o item pode ser removido for verdadeiro
    if(isDeletable === true){
        // Cria o botão de remover
        const rmBtn = document.createElement('span');
        rmBtn.className = 'rm-btn';
        rmBtn.innerHTML = '<i class="bi bi-trash-fill"></i>';
        // Adiciona o evento de clique ao botão
        rmBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Previne que o <details> abra/feche
            e.stopPropagation(); // Para a propagação do evento
            handleRemoveItemClick(iconName, id); // Adiciona a função de remoção
        });
        // Adiciona o botão ao summary
        summary.appendChild(rmBtn); 
    }

    // Retorna o elemento completo
    return summary;
}

// Função que cria o elemento do botão "Adicionar"
function createAddButtonElement(levelToAdd, parentId) {
    // Criando uma div para envolver o novo elemento criado
    const container = document.createElement('div');
    // Adicionando uma nova classe à div que envolve o botão
    container.className = 'add-button-container'; 
    // Adicionando um novo span que receberá aclasse que estiliza o botão de adição
    const addBtn = document.createElement('span');
    // Adicionando a classe ao botão
    addBtn.className = 'add-btn'; 
    
    // Adicionando o texto dos botões de acordo com o tipo de nível
    switch(levelToAdd) {
        // Nível de instituição
        case 'institution':{
            addBtn.classList.add('add-btn-institution');
            addBtn.textContent = '+ Adicionar Instituição';
            break;
        }
        // Nível de curso
        case 'course':{
            addBtn.classList.add('add-btn-course');
            addBtn.textContent = '+ Adicionar Curso';
            break;
        }
        // Nível de disciplina
        case 'subject': {
            addBtn.classList.add('add-btn-subject');
            addBtn.textContent = '+ Adicionar Disciplina';
            break;
        }
        // Nível de turma
        case 'class':{
            addBtn.classList.add('add-btn-class');
            addBtn.textContent = '+ Adicionar Turma';
            break;
        }
    }
    
    // Adiciona ao evento de clique a função responsável por cadastrar cada tipo de elemento
    addBtn.addEventListener('click', (e) => {
        e.preventDefault(); 
        e.stopPropagation(); 
        handleAddItemClick(levelToAdd, parentId);
    });

    // Adicionando o botão à página
    container.appendChild(addBtn);
    
    // Retornando o container
    return container;
}

// Função que adiciona classes aos itens criados para permitir sua estilização
function createClassElement(className, text, iconName, classId, subjectId) {
    // Criando a div que envolverá o tópico
    const div = document.createElement('div');
    // Adicionando a classe flex do bootstratp para fins visuais
    div.className = 'class-container';

    // Criando a div secundária que receberá o tópico
    const divTopic = document.createElement('div');
    // Adicionamos 'summary-container' para alinhar igual aos outros elementos
    divTopic.className = `${className} summary-container`;
    
    // Definindo o conteúdo interno do tópico que contém a turma
    divTopic.innerHTML = `
        <div class="topicIcon">
            <img src="../img/icons/${iconName}-light.png" alt="ícone">
        </div>
        <div class="topicName">${text}</div>
    `;
    
    // Adiciona o evento de clique
    divTopic.addEventListener('click', () => {
        handleClassClick(classId, text, subjectId);
    });
    
    // Cria o botão de remover
    const rmBtn = document.createElement('span');
    rmBtn.className = 'rm-btn';
    rmBtn.innerHTML = '<i class="bi bi-trash-fill"></i>';
    // Adiciona o evento de clique ao botão
    rmBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Previne que o <details> abra/feche
        e.stopPropagation(); // Para a propagação do evento
        handleRemoveItemClick('class', classId); // Adiciona a função de remoção
    });

    // Adicionando a turma à div principal
    div.appendChild(divTopic);
    // Adiciona o botão à div
    div.appendChild(rmBtn); 
    
    // Retorna a div configurada
    return div;
}

// Função que lida com o clique realizado em cada turma
function handleClassClick(classId, className, subjectId) {
    alert(`Te redirecionando para a turma: ${className} (ID: ${classId})`);
    // Direcionamento/acesso à página da turma especificada 
    window.location.href = `../pages/students.html?subject=${subjectId}&class=${classId}`;
}

// Função que lida com o clique no botão de adição ao lado dos campos, indicando o nível de conteúdo clicado e o id do componente pai em relação ao que será gerado
async function handleAddItemClick(level, parentId) {
    // Recebe o token de autenticação do localStorage
    const token = localStorage.getItem("token");
    // Variável para receber a rota da API
    let endpoint = '';
    // Variável para armazenar o corpo a ser enviado para as requisições
    let body = {};
    // Variável para a mensagem de sucesso
    let successMessage = '';

    try {
        // Coleta os dados baseado no nível
        switch (level) {
            case 'institution':
                // Usa os prompts do JS como formulário e recebe o nome da instituição
                const instName = prompt("Digite o nome da nova Instituição:");
                // Cancela a operação se o campo não estiver definido
                if (!instName) return; 
                // Define a rota da API
                endpoint = '/register-institution';
                // Define o corpo da requisição
                body = { name: instName };
                // Define a mensagem de sucesso a ser exibida no alerta
                successMessage = 'Instituição adicionada!';
                break;

            case 'course':
                // Usa os prompts do JS como formulário e recebe o nome do curso
                const courseName = prompt("Digite o nome do novo Curso:");
                // Cancela a operação se o campo não estiver definido
                if (!courseName) return;
                // Define a rota da API
                endpoint = '/register-course';
                // Define o corpo da requisição
                body = { name: courseName, idInstitution: parentId };
                // Define a mensagem de sucesso a ser exibida no alerta
                successMessage = 'Curso adicionado!';
                break;

            case 'subject':
                // Usa os prompts do JS como formulário e recebe o nome, a sigla e o período da disciplina
                const subjName = prompt("Nome da Disciplina:");
                // Cancela a operação se o campo não estiver definido
                if (!subjName) return;
                const subjCode = prompt("Sigla da Disciplina (ex: ITW101):");
                // Cancela a operação se o campo não estiver definido
                if (!subjCode) return;
                const subjTerm = prompt("Período/Semestre (ex: 2º Semestre):");
                // Cancela a operação se o campo não estiver definido
                if (!subjTerm) return;
                // Define o corpo da requisição
                endpoint = '/register-subject';
                // Define o corpo da requisição
                body = { name: subjName, code: subjCode, term: subjTerm, idCourse: parentId };
                // Define a mensagem de sucesso a ser exibida no alerta
                successMessage = 'Disciplina adicionada!';
                break;
            
            case 'class':                
                // Usa os prompts do JS como formulário e recebe o nome, o dia, o horário, o prédio e a sala da turma
                const name = prompt("Nome da Turma (ex: Turma A, 3NX):");
                // Cancela a operação se o campo não estiver definido
                if (!name) return;
                const day = prompt("Dias da semana (ex: Segunda-feira):");
                // Cancela a operação se o campo não estiver definido
                if (!day) return;
                const time = prompt("Horário (ex: 19:00):");
                // Cancela a operação se o campo não estiver definido
                if (!time) return;
                const building = prompt("Prédio/Bloco:");
                // Cancela a operação se o campo não estiver definido
                if (!building) return;
                const classroom = prompt("Sala/Laboratório:");
                // Cancela a operação se o campo não estiver definido
                if (!classroom) return;
                // Define a rota da API
                endpoint = '/register-class';
                // Define o corpo da requisição
                body = { name, day, time, building, classroom, idSubject: parentId };
                // Define a mensagem de sucesso a ser exibida no alerta
                successMessage = 'Turma adicionada!';
                break;
            
            default:
                // Emite uma mensagem de erro caso o nível obtido não esteja no range de opções
                console.error(`Nível desconhecido: ${level}`);
                return;
        }

        // Envia os dados para o backend pela rota definida no switch case
        const response = await fetch(`http://localhost:${port}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        // Se a resposta estiver na faixa 200 -> sucesso na operação
        if (response.ok) {
            // Emite o alerta de sucesso
            alert(successMessage);
            // Recarrega o menu para exibir o novo item
            loadHierarchyMenu(); 
        }
        // Se o status não for de sucesso, emite a mensagem de erro
        else {
            const err = await response.json();
            // Emite um alerta de erro
            alert(`Houve uma falha ao cadastrar: ${err.error || 'Erro desconhecido'}`);
        }
    } catch (error) {
        // Emite uma mensagem de erro caso não consiga cadastrar algum elemento
        alert(`Erro ao adicionar item (${level}): ${error}`);
    }
}

// Função que lidará com o clique nos botões de remoção ao lado dos campos, indicando o nível de conteúdo clicado e o id do componente
async function handleRemoveItemClick(level, itemId){
    alert(`Removendo a(o) ${level} com o id ${itemId}`);

    // Recebe o token de autenticação do localStorage
    const token = localStorage.getItem("token");
    // Array para o feedback
    let message = ['',''];
    // Variável que confirma se o usuário realmente quer excluir um item
    let removalAssurance = false;

    try{
        // Analisa os possíveis níveis passados por parâmetro
        switch(level){
            // Se for instituição...
            case 'institution':{
                // Define a mensagem para o alert
                message[0] = `instituição`;
                message[1] = `Não é possível excluir a instituição pois ela possui um ou mais cursos associados a ela`;
                break;
            }
            // Se for curso
            case 'course':{
                // Define a mensagem para o alert
                message[0] = `curso`;
                message[1] = `Não é possível excluir o curso pois ele possui uma ou mais disciplinas associadas a ele`;
                break;
            }
            // Se for disciplina
            case 'subject':{
                // Define a mensagem para o alert
                message[0] = `disciplina`;
                message[1] = `Não é possível excluir a disciplina pois ela possui uma ou mais turmas e/ou componentes de nota associados a ela`;
                break;
            }
            case 'class': {
                // Define a mensagem para o alert
                message[0] = `turma`;
                message[1] = `Não é possível excluir a turma pois ela possui uma ou mais matrículas associadas a ela`;
                break;
            }
            // Se não for nenhum
            default:{
                // Emite uma mensagem de erro caso o nível obtido não esteja no range de opções
                console.error(`Nível desconhecido: ${level}`);
                return;
            }
        }
        // Se a verificação de possibilidade de remoção for bem sucedida, prossegue com a exclusão do elemento indicado
        if(level != 'class'){
            if(await verifyRemotion(level, itemId)){// Envia os dados para o backend pela rota definida no switch case
                const response = await fetch(`http://localhost:${port}/delete-${level}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({id: itemId})
                });

                // Se a resposta estiver na faixa 200 -> sucesso na operação
                if (response.ok) {
                    // Recebe o objeto retornado pela função
                    const deleted = await response.json();
                    // Retorna um valor correspondente ao armazenado no indicador de possibilidade de exclusão retornado pela rota
                    if(deleted.success === true){
                        alert(`O(A) ${message[0]} foi excluído(a) com sucesso!`);
                        // Chamando a função de carregamento para atualizar o menu
                        loadHierarchyMenu();
                    }
                    else{
                        alert(`Não foi possível excluir o(a) ${message[0]} desejado(a).\nErro: ${deleted.error}`);
                    }
                }
                // Se o resultado não foi de sucesso, emite uma mensagem de erro
                else {
                    const err = await response.json();
                    // Emite um alerta de erro
                    alert(`Houve uma falha ao processar a exclusão: ${err.error || 'Erro desconhecido'}`);
                }
            }
            else{
                alert(message[1]);
            }     
        }
        // se a verificação de possibilidade de remoção indicar que a operação não pode ser realizada, emite uma mensagem de erro
        else{
            // Confirma se o usuário realmente deseja excluir aquela turma
            removalAssurance = confirm("Você tem certeza que deseja excluir essa turma?\nSe você fizer isso, todos os dados relacionados a ela serão removidos PERMANENTEMENTE.\nATENÇÃO: Essa ação não poderá ser desfeita.");
            
            // Se há consentimento para a exclusão do item, prossegue com a operação
            if(removalAssurance){
                const response = await fetch(`http://localhost:${port}/delete-${level}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({id: itemId})
                });

                // Se a resposta estiver na faixa 200 -> sucesso na operação
                if (response.ok) {
                    // Recebe o objeto retornado pela função
                    const deleted = await response.json();
                    // Retorna um valor correspondente ao armazenado no indicador de possibilidade de exclusão retornado pela rota
                    if(deleted.success === true){
                        alert(`O(A) ${message[0]} foi excluído(a) com sucesso!`);
                        // Chamando a função de carregamento para atualizar o menu
                        loadHierarchyMenu();
                    }
                    else{
                        alert(`Não foi possível excluir o(a) ${message[0]} desejado(a).\nErro: ${deleted.error}`);
                    }
                }
                // Se o resultado não foi de sucesso, emite uma mensagem de erro
                else {
                    const err = await response.json();
                    // Emite um alerta de erro
                    alert(`Houve uma falha ao processar a exclusão: ${err.error || 'Erro desconhecido'}`);
                }
            }
            // Se não houver consentimento, retorna uma mensagem de alerta
            else{
                alert('Operação de exclusão abortada.');
            }
        }
    }
    // Se houver algum erro durante a execução
    catch (error) {
        // Emite uma mensagem de erro caso não consiga cadastrar algum elemento
        console.error(`Erro ao excluir ${message[0]}: ${error}`);
        alert(`Erro de conexão ao excluir ${message[0]}.`);
    }
}

// Função que faz a chamada à rota que verifica se é possível ou não remover um item
async function verifyRemotion(level, id){
    // Recebe o token de autenticação do localStorage
    const token = localStorage.getItem("token");
    // Variável para receber a rota da API
    let endpoint = '';

    try{
        switch(level){
            case 'institution':{
                endpoint = '/can-delete-institution';
                break;
            }
            case 'course':{
                endpoint = '/can-delete-course';
                break;
            }
            case 'subject':{
                endpoint = '/can-delete-subject';
                break;
            }
            default:{
                // Emite uma mensagem de erro caso o nível obtido não esteja no range de opções
                console.error("Nível desconhecido:", level);
                return;
            }
        }
        
        // Envia os dados para o backend pela rota definida no switch case
        const response = await fetch(`http://localhost:${port}${endpoint}/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });

        // Se a resposta estiver na faixa 200 -> sucesso na operação
        if (response.ok) {
            // Recebe o objeto retornado pela função
            const canDelete = await response.json();
            // Retorna um valor correspondente ao armazenado no indicador de possibilidade de exclusão retornado pela rota
            if(canDelete.success === true){
                return true;
            }
            else{
                return false;
            }
        }
        // Se o resultado não foi de sucesso, emite uma mensagem de erro
        else {
            const err = await response.json();
            // Emite um alerta de erro
            alert(`Houve uma falha ao verificar se o item pode ser excluído: ${err.error || 'Erro desconhecido'}`);
            return false;
        }
    } catch (error) {
        // Emite uma mensagem de erro caso não consiga cadastrar algum elemento
        console.error(`Erro ao verificar a exclusão do(a) ${level}: ${error}`);
        alert("Erro de conexão ao verificar.");
    }
}
/* ======================================================================================================================================================= */