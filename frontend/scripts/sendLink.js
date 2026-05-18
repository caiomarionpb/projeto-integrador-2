// // Autor: Beatriz Naomi Ferreira Sasaki

// /* =================================================== Redirecionamento caso o docente esteja logado =================================================== */
// Obtenção do token armazenado no localStorage do navegador
const token = localStorage.getItem("token");
// Verificação se o token existe
if(token){
    // Redirecionamento para a página inicial (home) do sistema (caso o professor já esteja logado)
    window.location.href = "../pages/home.html";
}
// /* ======================================================================================================================================================= */

// /* ========================================================= Importação de variáveis e restrições ======================================================== */
// // Importação de variáveis e funções que se encontram no arquivo formAssets.ts
// import { verifyEmailExists } from "./formAssets.js";
// /* ======================================================================================================================================================= */

// /* =================================================================== Variáveis globais ================================================================= */


// Porta do servidor
const port = 3030; // 3030 - Noemi | 3000 - Outros
// // Variável para garantir o acesso ao código para múltiplas funções


// export var code;
// // Define uma expressão regular para validar o e-mail
// const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


// Obtendo o campo de input do email para manipulá-lo
const emailField = document.getElementById("inputEmail");


// // Obtendo o campo de input do código para manipulá-lo
// const codeField = document.getElementById("inputCode");
// // Obtendo o formulário para manipulá-lo e gerenciar seus eventos
// const codeConfForm = document.getElementById("confCodeForm");
// // Obtendo o formulário para manipulá-lo e gerenciar seus eventos
// const confEmailForm = document.getElementById("confEmailForm");
// // Obtendo o formulário de nova senha para manipulá-lo
// const newPasswordForm = document.getElementById("newPasswordForm");
// Obtendo o "link" de reenvio de código para manipulá-lo
// const generateCodeLink = document.getElementById("generateAgain");
// /* ======================================================================================================================================================= */

// /* ================================================================ Código de confirmação ================================================================ */

// confEmailForm.addEventListener("submit", validateEmailAndGenerateCode);

// // Função para validar o email e gerar o código
// async function validateEmailAndGenerateCode(event) {
//     // Cancela o comportamento padrão do evento submit
//     event.preventDefault();
//     if(emailField.value !== "" && emailRegex.test(emailField.value)) {
//         // Verifica se o e-mail está cadastrado
//         const emailExists = await verifyEmailExists(emailField.value);
//         if (!emailExists) {
//             alert("O e-mail inserido não está cadastrado. Verifique o e-mail ou realize um novo cadastro.");
//             return;
//         }
//         // Chama a função de gerar código
//         codeGenerator();
//         // Exibe o formulário de confirmação de código
//         codeConfForm.classList.remove("d-none");
//         codeConfForm.classList.add("d-flex");
//         // Oculta o formulário de confirmação de e-mail
//         confEmailForm.classList.add("d-none");
//     } else {
//         alert("Por favor, insira um e-mail válido para continuar.");
//     }
// }

// // Função de gerar código
// function codeGenerator() {
//     // Variáveis para valores máximos e mínimos do intervalo
//     let max;
//     let min;
//     // Valor máximo do intervalo para gerar um número de 6 dígitos
//     max = 999999;
//     // Valor mínimo do intervalo para gerar um número de 6 dígitos
//     min = 100000;
//     // Arredonda o valor gerado pela função random() multiplicado pelo intervalo, somado a 1 e depois ao valor mínimo
//     code = Math.floor(Math.random() * (max - min + 1) + min);
//     // Imprime o código no log (versão beta - pré envio de e-mail)
//     console.log(code);
//     // >> INSERIR A FUNÇÃO DE ENVIO DO CÓDIGO POR E-MAIL <<
// }

// // Adiciona ao evento submit do formulário de confirmação a função de verificação do código
// codeConfForm.addEventListener("submit", codeVerification);

// // Função de verificação do código de confirmação
// function codeVerification(event) {
//     // Cancela o comportamento padrão do evento submit
//     event.preventDefault();
//     // Obtém o valor digitado pelo usuário através do campo de input
//     let enteredCode = codeField.value;
//     // Verifica se o input não está vazio
//     if (enteredCode != "") {
//         // Verifica se foram digitados todos os 6 dígitos
//         if (enteredCode.length === 6) {
//             // Caso o código esteja correto
//             if (code === Number(enteredCode)) {
//                 // Emite um alerta de sucesso
//                 // Exibe o formulário de redefinição de senha
//                 newPasswordForm.classList.remove("d-none");
//                 newPasswordForm.classList.add("d-flex");
//                 // Oculta o formulário de confirmação de código
//                 codeConfForm.classList.add("d-none");
//                 // Redirecionamento para a página de redefinição de senha
//                 // window.location.href = "../../frontend/pages/newPassword.html";
//             }
//             // Caso o código esteja incorreto
//             else {
//                 // Emite um alerta de erro
//                 alert("O código informado não condiz com o código gerado. Tente novamente.");
//             }
//         }
//         // Caso o código possua menos que 6 dígitos
//         else {
//             // Emite um alerta de erro
//             alert("O código informado contém um erro. Verifique se os 6 dígitos foram inseridos no campo.");
//         }
//     }
//     // Caso o código não tenha sido preenchido
//     else {
//         // Emite um alerta de erro
//         alert("Preencha o campo para continuar.");
//     }
// }

// // Adiciona ao evento de click do "link" de reenvio do código a função de verificação do código
// generateCodeLink.addEventListener("click", codeGenerator);
// /* ======================================================================================================================================================= */

// /* ========================================================== Limite de caracteres para o código ========================================================= */

// // Adicona a função de adequação dos caracteres ao evento de input
// codeField.addEventListener("input", () => {
//     //Remove os caracteres que não forem numéricos usando a regEx /\D/g e limita o tamanho a 6 digitos usando o substring
//     codeField.value = codeField.value.replace(/\D/g, "").substring(0, 6);
// });

/* ======================================================================================================================================================= */ 
/* =================================================================== Código do fetch =================================================================== */

// Obtendo o email para enviar link de redefinição de senha
const sendLink = document.getElementById("btnSendEmail");

// Adicionando um evento que, se o botão sendEmail não for nulo, ao clicar no botão para enviar o link de redefinição de senha, chama a função confEmail
if (sendLink) {
    sendLink.addEventListener("click", confEmail);
}

// Função assíncrona para confirmar o email e enviar o link de redefinição de senha
async function confEmail(event) {
    // Comando que impede o navegador de atualizar a página ao enviar o formulário
    event.preventDefault();
    
    // Se o campo de informar e-mail não for nulo 
    if (emailField) {
        // Cria-se uma constante email que recebe o valor do campo de informar e-mail
        const email = emailField.value;

        // Se o campo de e-mail não estiver vazio
        if (email != "") {
            // Cria-se um objeto requestBody que contém o e-mail a ser enviado no corpo da requisição
            const requestBody = {
                // Converte o email para string e o atribui à propriedade email do objeto
                email: String(email)            
            };
            try {
                // Pedindo para o navegador uma requisição HTTP para o servidor que está rodando
                const response = await fetch(`http://localhost:${port}/conf-link`, {
                // Define o metodo da requisição que o navegador vai mandar para o servidor
                method: "POST",
                // Envia o corpo da requisição 
                body: JSON.stringify(requestBody),
                // Define as informações que o servidor precisa para entender o que está vindo
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }});
                // Se a resposta do servidor for diferente de 500 (erro interno do servidor)
                if (response.status !== 500) {
                    // Converte a resposta do servidor para o formato JSON
                    const data = await response.json();
                    // Se o id da resposta do servidor for maior que 0 (indicando que encontrou o usuário com o email fornecido)
                    if (Number(data.id) > 0) {
                        // Exibe um alerta informando que o código foi enviado para o email
                        alert("Código enviado para o email!");
                    // Se o id da resposta do servidor for igual a 0 (indicando que não encontrou o usuário com o email fornecido)
                    } else if (Number(data.id) === 0) {
                        // Exibe um alerta informando que o email não foi encontrado
                        alert("Email não encontrado!");
                    }
                }
                else {
                    // Se a resposta do servidor for 500, é enviado um alerta de erro no servidor
                    alert("Erro no servidor. Tente novamente mais tarde.");
                }
            } catch (error) {
                // Em caso de erro na requisição, exibe o erro no console e um alerta para o usuário
                console.error("Erro na requisição:", error);
                alert("Erro na requisição. Tente novamente mais tarde.");
            }
        // Se o campo de e-mail estiver vazio
        }else {
            // Exibe um alerta informando que o e-mail é inválido
            alert("Por favor, insira um email válido.");
        }
    }
    // Se o campo de informar e-mail for nulo
    else {
        // Exibe um alerta informando que o campo de e-mail não foi encontrado
        alert("Input de email não encontrado.");
    }
};