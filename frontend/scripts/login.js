/* Autor: Gabriela Sichiroli Ferrari */

/* =================================================== Redirecionamento caso o docente esteja logado =================================================== */
// Obtenção do token armazenado no localStorage do navegador
const token = localStorage.getItem("token");
// Verificação se o token existe
if(token){
    // Redirecionamento para a página inicial (home) do sistema (caso o professor já esteja logado)
    window.location.href = "../pages/home.html";
}
/* ======================================================================================================================================================= */

/* ============================================================= Importação de variáveis ================================================================= */
// Importação de variáveis de outros arquivos
import { passwordInput, eyeButton1, port } from "./formAssets.js";
/* ======================================================================================================================================================= */



/* ============================================================= Atribuição de variável ================================================================== */
// Variáveis globais e constantes (imutáveis) atribuídas com a tipagem típica do TypeScript
// A variável "inputMail" é constante e recebe o elemento de input do "inputEmail"
const inputMail = document.getElementById("inputEmail");
// A variável "inputPass" é constante e recebe o elemento de input do "inputNewPass"
const inputPass = document.getElementById("inputNewPass");
// A variável "login" é constante e recebe o elemento de input do "inputNewPass"
const loginForm = document.getElementById("loginForm");
// Adiciona um Event Listener para quando ocorrer o clique do mouse (click). Caso isso ocorra, ele executa a função anônima que serve para o botão de olho da senha, fazendo com que o input mostre ou não o que está sendo digitado
eyeButton1.addEventListener("click", () => {
    // Se a senha estiver como 'password', ou seja, escondida
    if (passwordInput.type == 'password') {
        // Transforma o tipo de conteúdo do "inputNewPass" em texto (para o usuário poder visualizar o que está sendo digitado)
        passwordInput.type = 'text';
        // Forma sucinta de dizer que se o botão do olho for ele sem o risco, ao clicar transformá-lo no ícone com o risco. Caso contrário, transformá-lo no olho sem o risco
        eyeButton1.innerHTML = eyeButton1.innerHTML == '<i class="bi bi-eye"></i>' ? '<i class="bi bi-eye-slash"></i>' : '<i class="bi bi-eye"></i>';
    }
    else {
        // Ao clicar novamente, retorna o tipo de conteúdo do "inputNewPass" para "password", onde o texto passa a ficar escondido
        passwordInput.type = 'password';
        // Forma sucinta de dizer que se o botão do olho for ele sem o risco, ao clicar transformá-lo no ícone com o risco. Caso contrário, transformá-lo no olho sem o risco
        eyeButton1.innerHTML = eyeButton1.innerHTML == '<i class="bi bi-eye"></i>' ? '<i class="bi bi-eye-slash"></i>' : '<i class="bi bi-eye"></i>';
    }
});
/* ======================================================================================================================================================= */



/* =============================================================== Verificação de login ================================================================== */

// Adiciona ao evento submit do formulário de login a função login() que verifica usuário e senha, após confirmar que o formulário existe (não nulo)
if (loginForm) {
    loginForm.addEventListener("submit", login);
}


async function login(event) {
    // Cancelamento o comportamento padrão (default) do evento submit
    event.preventDefault();
    // Verificação se os elementos de e-mail e senha existem (não são nulos); Para a função funcionar, é necessário ambos existirem
    if (inputMail && inputPass) {
        // Obtém o valor do campo de input do email
        const mail = inputMail.value;
        // Obtém o valor do campo de input da senha
        const password = inputPass.value;
        // Verifica se ambos campos não estão vazios para prosseguir com a verificação
        if (mail.trim() !== "" && password.trim() !== "") {
            // Criando o corpo da requisição para o servidor
            const requestBody = {
                email: String(mail),
                password: String(password)
            };
            try{
                // Criando a requisição para o servidor através da rota de login
                const response = await fetch(`http://localhost:${port}/login`, {
                    // Método da rota
                    method: "POST",
                    // Corpo da requisição convertido para JSON
                    body: JSON.stringify(requestBody),
                    // Cabeçalho da rota -> define o tipo de conteúdo como JSON e permite CORS
                    headers: {
                        // Definindo o tipo de conteúdo como JSON
                        "Content-Type": "application/json",
                    }
                });
                // Verifica se o status da resposta não é 500 (erro interno do servidor)
                if(response.status !== 500){
                    if(response.ok){
                        // Converte a resposta para JSON
                        const responseData = await response.json();
                        // Verifica a resposta do servidor
                        if(responseData.token){
                            // Exibe uma mensagem de sucesso
                            alert("Login realizado com sucesso!");
                            // Armazena o token de autenticação do professor no localStorage do navegador
                            localStorage.setItem("token", responseData.token);
                            // Redireciona o professor para a página inicial (home) do sistema
                            window.location.href = "../pages/home.html";
                            return;
                        }
                    }
                    else if(response.status === 401){
                        alert("Email ou senha incorretos");
                    }
                }
                // Se o status da resposta for 500, emite um alerta de erro
                else{
                    alert("Erro ao se conectar com o servidor! Tente novamente mais tarde.");
                }
            }
            // Captura qualquer erro que ocorra durante a requisição
            catch (error) {
                console.error("Erro na requisição:", error);
                alert("Erro ao se conectar com o servidor! Tente novamente mais tarde.");
            }
        }
        else {
            // Caso contrário (campos não preenchidos), emite um alerta de erro
            alert("Ambos os campos devem ser preenchidos");
        }
    }
    else {
        // Caso contrário, se os elementos do formulário não forem encontrados, emite um alerta de erro
        alert("Erro: Elementos do formulário não foram encontrados");
    }
}
/* ======================================================================================================================================================== */ 