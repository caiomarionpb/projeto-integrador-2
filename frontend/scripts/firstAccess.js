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

/* =========================================================== Redirecionamento após o primeiro acesso =================================================== */

// Obtém o valor armazenado na variável de armazenamento local que controla o primeiro acesso
const firstAccess = localStorage.getItem("firstAccess");

// Se a flag estiver definida e seu valor for falso...
if(firstAccess && firstAccess === false){
    // Redirecionamento para a página inicial
    window.location.href = "../pages/home.html";
}

/* ======================================================================================================================================================= */

/* ===================================================== Importação de variáveis externas ============================================================= */
// Importação de variáveis e funções que se encontram no arquivo formAssets.ts
import { port } from "./formAssets.js";
/* ======================================================================================================================================================= */

/* =========================================================== Manipulação do formulário de cadastro =================================================== */

// Obtendo os campos do formulário para manipulá-los
// Input com o nome da instituição
const institutionInput = document.getElementById('inputInstitution');
// Input com o nome do curso
const courseInput = document.getElementById('inputCourse');
// Formulário de cadastro
const firstAccessForm = document.getElementById('firstAccessForm');

// Se o formulário estiver definido, atribui-se uma função que lida com seu evento submit
if(firstAccessForm){
    firstAccessForm.addEventListener('submit', (e) => {
        registerFirstAccess(e);
    });
}

// Função para gerenciar o cadastro através do submit
async function registerFirstAccess(event){
    // Cancela o comportamento padrão do evento submit
    event.preventDefault();
    // Verifica se todos is campos estão válidos
    if(institutionInput.value.trim() !== "" && courseInput.value.trim() !== ""){
        // Declara o objeto que será enviado como parâmetro para a função de cadastro da instituição e do curso
        const formData = {
            nameInst: institutionInput.value.trim(),
            nameCourse: courseInput.value.trim()
        }
        const registerSuccess = await registerInstitutionAndCourse(formData);
        if(!registerSuccess){
            // Impede o prosseguimento do cadastro
            return;
        }
        // Emite um alerta de sucesso
        alert("Cadastro realizado com successo!!\nVocê será redirecionado para a página inicial.");
        // Redireciona para a página inicial
        window.location.href = "../pages/home.html";
    }
}

// Função para cadastrar a primeira instituição e o primeiro curso de um docente
async function registerInstitutionAndCourse(formData) {
    try{
        const response = await fetch(`http://localhost:${port}/register-first-access`, {
            // Método da rota
            method: "POST",
            // Corpo da requisição convertido para JSON
            body: JSON.stringify(formData),
            // Cabeçalho da rota -> define o tipo de conteúdo como JSON e permite CORS
            headers: {
                "Authorization": `Bearer ${token}`,
                // Definindo o tipo de conteúdo como JSON
                "Content-Type": "application/json"
            }
        });
        // Verifica se o status da resposta não é 500 (erro interno do servidor)
        if(response.status !== 500){
            // Se o status da resposta estiver na faixa 200 - sucesso
            if(response.ok){
                // Converte a resposta para JSON
                const responseData = await response.json();
                // Verificando a resposta do servidor
                if(responseData.success){
                    if(responseData.success === true){
                        // Se houver sucesso absoluto nas operações, desmarca o identificador de primeiro acesso
                        localStorage.setItem('firstAccess', false);
                        return true;
                    }
                    else{
                        // Exibe um alerta de erro caso o cadastro não tenha sido bem-sucedido
                        alert("Houve um erro ao realizar o cadastro. Tente novamente mais tarde.");
                        // Retorna false para indicar falha no cadastro
                        return false;
                    }
                }
                else{
                    // Exibe um alerta de erro caso o cadastro não tenha sido bem-sucedido
                    alert("A resposta do servidor não foi definida.");
                    // Retorna false para indicar falha no cadastro
                    return false;
                }
            }
            else{
                // Exibe um alerta de erro caso o cadastro não tenha sido bem-sucedido
                alert("Houve um erro no servidor ao realizar o cadastro. Tente novamente mais tarde.");
                // Retorna false para indicar falha no cadastro
                return false;
            }
        }
        else{
            // Exibe um alerta de erro caso o cadastro não tenha sido bem-sucedido
            alert("Houve um erro no servidor ao realizar o cadastro. Tente novamente mais tarde.");
            // Retorna false para indicar falha no cadastro
            return false;
        }

    }
    // Captura qualquer erro que ocorra durante a requisição e retorna true para evitar cadastro
    catch(error){
        console.error("Erro na requisição: ", error);
        alert("Erro ao se conectar com o servidor! Tente novamente mais tarde.");
        // Retorna false para indicar falha no cadastro
        return false;
    }
}

/* ======================================================================================================================================================= */