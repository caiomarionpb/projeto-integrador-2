/* Autor: Noemi Kayama */

/* =================================================== Redirecionamento caso o docente esteja logado =================================================== */
// Obtenção do token armazenado no localStorage do navegador
const token = localStorage.getItem("token");
// Verificação se o token existe
if(token){
    // Redirecionamento para a página inicial (home) do sistema (caso o professor já esteja logado)
    window.location.href = "../pages/home.html";
}
/* ======================================================================================================================================================= */

/* ========================================================= Importação de variáveis e restrições ======================================================== */
// Importação de variáveis e funções que se encontram no arquivo formAssets.ts
import { eyeButton1, eyeButton2, confirmPasswordInput, verifyPassword, passwordInput, isPasswordValid, isPasswordConfirmationValid, passwordValidation, port } from "./formAssets.js";
/* ======================================================================================================================================================= */
/* ========================================================= Botões de visualização de senha ============================================================= */
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
// Adiciona um Event Listener para quando ocorrer o clique do mouse (click). Caso isso ocorra, ele executa a função anônima que serve para o botão de olho da senha, fazendo com que o input mostre ou não o que está sendo digitado
eyeButton2.addEventListener("click", () => {
    // Se a senha estiver como 'password', ou seja, escondida
    if (confirmPasswordInput.type == 'password') {
        // Transforma o tipo de conteúdo do "inputNewPass" em texto (para o usuário poder visualizar o que está sendo digitado)
        confirmPasswordInput.type = 'text';
        // Forma sucinta de dizer que se o botão do olho for ele sem o risco, ao clicar transformá-lo no ícone com o risco. Caso contrário, transformá-lo no olho sem o risco
        eyeButton2.innerHTML = eyeButton2.innerHTML == '<i class="bi bi-eye"></i>' ? '<i class="bi bi-eye-slash"></i>' : '<i class="bi bi-eye"></i>';
    }
    else {
        // Ao clicar novamente, retorna o tipo de conteúdo do "inputNewPass" para "password", onde o texto passa a ficar escondido
        confirmPasswordInput.type = 'password';
        // Forma sucinta de dizer que se o botão do olho for ele sem o risco, ao clicar transformá-lo no ícone com o risco. Caso contrário, transformá-lo no olho sem o risco
        eyeButton2.innerHTML = eyeButton2.innerHTML == '<i class="bi bi-eye"></i>' ? '<i class="bi bi-eye-slash"></i>' : '<i class="bi bi-eye"></i>';
    }
});
/* ================================================================ Verificação da senha ================================================================= */
// Event listener para cada digitação; Usa o "passwordInput" declarada anteriormente; O addEventListener faz com que, ao realizar a ação "keyup", ou seja, quando o usuário soltar a tecla do teclado, ele utiliza o objeto "e" do evento "KeyboardEvent" que diz o que foi digitado e verifica através da função "verifyPassword" se o que foi digitado no momento está de acordo com as egras de validação
passwordInput.addEventListener("keyup", (e) => {
    // Verifica se o alvo do evento existe (não é nulo ou undefined)
    if (e.target) {
        // Chama a função de verificação da senha, passando o valor do campo de entrada
        verifyPassword(e.target.value);
    }
});
/* ======================================================================================================================================================= */
/* ===================================================== Validação dos campos de senha e confirmação ===================================================== */
// --- Validação da senha ---
// Event listener para cada digitação; Usa o "passwordInput" declarada anteriormente; O addEventListener faz com que, ao realizar a ação "keyup", ou seja, quando o usuário soltar a tecla do teclado, ele utiliza o objeto "e" do evento "KeyboardEvent" que diz o que foi digitado e verifica através da função "passwordValidation" se o que foi digitado no momento está de acordo com as egras de validação
passwordInput.addEventListener("keyup", (e) => {
    // Verifica se o alvo do evento existe (não é nulo ou undefined)
    if (e.target) {
        // Chama a função de validação da senha, passando o valor do campo de entrada
        passwordValidation(e.target.value);
    }
});
// --- Validação da confirmação de senha ---
// Event listener para cada digitação; Usa o "confirmPasswordInput" declarada anteriormente; O addEventListener faz com que, ao realizar a ação "keyup", ou seja, quando o usuário soltar a tecla do teclado, ele utiliza o objeto "e" do evento "KeyboardEvent" que diz o que foi digitado e verifica através da função "confirmValidation" se o que foi digitado no momento está de acordo com as egras de validação
confirmPasswordInput.addEventListener("keyup", (e) => {
    // Verifica se o alvo do evento existe (não é nulo ou undefined)
    if (e.target) {
        // Chama a função de validação da senha, passando o valor do campo de entrada
        passwordValidation(e.target.value);
    }
});
/* ======================================================================================================================================================= */
/* ============================================================ Função de redefinição de senha =========================================================== */
const inputEmail = document.getElementById("inputEmail");

// Obtendo o campo do formulário para manipulá-lo
const newPasswordForm = document.getElementById("newPasswordForm");
// // Adicionando a função controladora do evento submit através do Event Listener
// newPasswordForm.addEventListener("submit", passwordRedefinition);
// // Função de redefinição de senha que recebe o evento de submeter do formulário como parâmetro e é do tipo void, pois não retorna nenhum valor
// function passwordRedefinition(event) {
//     // Cancela o comportamento padrão do evento submit
//     event.preventDefault();
//     // Verifica se todos os campos estão validados
//     if (isPasswordValid && isPasswordConfirmationValid) {
//         // Emite um alerta de sucesso
//         alert("Sua senha foi redefnida com successo!!\nVocê será redirecionado para o login.");
//         // Redireciona para a página inicial
//         window.location.href = "../../frontend/pages/index.html";
//     }
//     // Se não estiverem, emite uma mensagem de erro
//     else {
//         alert("Um ou mais campos estão incorretos. Preencha todos corretamemte para continuar.");
//     }
// }

// Se o campo do formulário não for vazio, adiciona um evento que ao enviar o formulário chama a função para redefinir a senha
if (newPasswordForm) {
    newPasswordForm.addEventListener("submit", resetPassword);
}

// Função assíncrona para a redefinição de senha
async function resetPassword(event) {
    // Cancela o comportamento padrão do evento submit
    event.preventDefault();
    // Verifica se todos os campos estão validados
    if (isPasswordValid && isPasswordConfirmationValid && inputEmail) {
        // Variáveis que armazenam os valores obtidos do input de senha e email
        const password = passwordInput.value;
        const email = inputEmail.value;
        // Verifica se a senha não está vazia
        if (password != "") {
            // Cria o corpo da requisição com a nova senha e email
            const requestBody = {
                password: String(password),
                email: String(email)
            };
            try {
                // Realiza a requisição para o servidor backend para redefinir a senha
                const response = await fetch(`http://localhost:${port}/new-password`, {
                    // Especifica o método da requisição como POST
                    method: 'POST',
                    // Converte o corpo da requisição para JSON
                    body: JSON.stringify(requestBody),
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    }});
                if (response.status !== 500) {
                    // Obtém os dados da resposta em formato JSON
                    const data = await response.json();
                    // Se o id retornado for maior que 0, a senha foi redefinida com sucesso
                    if (Number(data.id) > 0) {
                        // Emite um alerta de sucesso
                        alert("Sua senha foi redefinida com successo!!\nVocê será redirecionado para o login.");
                        // Redireciona para a página inicial
                        window.location.href = "../../frontend/pages/index.html";
                    } else if (Number(data.id) === 0) {
                        // Se o id retornado for 0, é enviado um alerta de que o email não foi encontrado
                        alert("Houve um erro ao redefinir a senha. Tente novamente.");
                    }
                }
                else {
                    // Se a resposta do servidor for 500, é enviado um alerta de erro no servidor
                    alert("Erro no servidor. Tente novamente mais tarde.");
                }
            } catch(error) {
                // Em caso de erro na requisição, exibe o erro no console e um alerta para o usuário
                console.error("Erro na requisição:", error);
                alert("Erro na requisição. Tente novamente mais tarde.");
            }
        }
        else {
            // Se a senha estiver vazia, emite um alerta para o usuário
            alert("Por favor, insira senhas válidas para continuar.");
        }
    }
    else {
        // Se os campos não estiverem validados, emite um alerta de erro
        alert("Senha não pode ser redefinida.")
    }
};

/*======================================================================================================================================================= */ 


