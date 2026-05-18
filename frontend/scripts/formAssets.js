/* Autor: Caio Marion */

/* ================================================================ Declaração de variáveis ============================================================== */
// Porta do servidor backend
export const port = 3030; //3030 - Noemi | 3000 - Outros

// --- Atribuição através de const por se tratar de uma variável global imutável ---
// É necessário aplicar o export pois as constantes e variáveis serão importadas em outros arquivos .ts
// REGEX define uma restrição para o campo de senha no qual deve conter entre 6 a 20 caracteres, pelo menos uma letra e um número
export const passRegex = /^(?=.*[a-zA-Z])(?=.*\d).{6,20}$/;
// Variável da senha que recebe o elemento de input através do ID do campo "inputNewPass"
export const passwordInput = document.getElementById("inputNewPass");
// Variável da confirmação de senha que recebe o elemento de input através do ID do campo "inputConfirmPass"
export const confirmPasswordInput = document.getElementById("inputConfirmPass");
// --- Atribuição através de var por se tratar de uma variável mutável ---
// Flag para a validação da senha
export var isPasswordValid = false;
// Flag para a validação da confirmação de senha
export var isPasswordConfirmationValid = false;
/* ======================================================================================================================================================= */


/* ================================================================ Botão de visualização ================================================================ */
// Atribuição através de const por se tratar de uma variável imutável
// Variável do ícone do olho para senha do botão com ID "eyeButton1"
export const eyeButton1 = document.getElementById("eyeButton1");
// Variável do ícone do olho para senha do botão com ID "eyeButton2"
export const eyeButton2 = document.getElementById("eyeButton2");
/* ======================================================================================================================================================= */


/* ================================================================= Verificação da senha ================================================================ */
// Atribui à variável "minPass" o item da lista "min6", o qual diz que a senha deve ter no mínimo 6 caracteres entre letras e dígitos 
export const minPass = document.getElementById("min6");
// Atribui à variável "maxPass" o item da lista "max20", o qual diz que a senha deve ter no máximo 20 caracteres entre letras e dígitos
export const maxPass = document.getElementById("max20");
// Atribui à variável "minLetter" o item da lista "minLetter", o qual diz que a senha deve ter no mínimo 1 dígito
export const minLetter = document.getElementById("minLetter");
// Atribui à variável "minNumber" o item da lista "minNum", o qual diz que a senha deve ter no mínimo 1 letra
export const minNumber = document.getElementById("minNum");
// Função com export (para ser utilizada em outros arquivos .ts) para a verificação de requisitos da senha que recebe como parâmetro o dado do tipo string (texto) e não retorna nenhum valor (void)
export function verifyPassword(data) {
    // REGEX define a retrição de mínimo de 6 caracteres
    const min6 = /^.{6,}$/;
    // REGEX define a retrição de máximo de 20 caracteres
    const max20 = /^.{0,20}$/;
    // REGEX define a retrição da existência de letras na senha
    const letter = /[A-Za-z]/;
    // REGEX define a retrição da existência de números na senha
    const number = /[0-9]/;
    // Verificação de no mínimo 6 caracteres
    if (min6.test(data)) {
        // Adiciona a classe 'valid' do CSS que faz com que o texto mude para a cor verde
        minPass.classList.add('valid');
        // Remove a classe 'invalid' do CSS que faz com que o texto mude para a cor vermelha
        minPass.classList.remove('invalid');
        // Sobrescreve no HTML a mensagem da lista de regras da senha e adiciona/sobrescreve o ícone de check, que vem com importação do Bootstrap
        minPass.innerHTML = 'No mínimo 6 caracteres <i class="bi bi-check-lg"></i>';
    }
    else {
        // Adiciona a classe 'invalid' que faz com que o texto mude para a cor vermelha
        minPass.classList.add('invalid');
        // Remove a classe 'valid' do CSS que faz com que o texto mude para a cor verde
        minPass.classList.remove('valid');
        // Sobrescreve no HTML a mensagem da lista de regras da senha e adiciona/sobrescreve o ícone de "x", que vem com importação do Bootstrap
        minPass.innerHTML = 'No mínimo 6 caracteres <i class="bi bi-x"></i>';
    }
    // Verificação de no máximo 20 caracteres
    if (max20.test(data)) {
        // Adiciona a classe 'valid' que faz com que o texto mude para a cor verde
        maxPass.classList.add('valid');
        // Remove a classe 'invalid' do CSS que faz com que o texto mude para a cor vermelha
        maxPass.classList.remove('invalid');
        // Sobrescreve no HTML a mensagem da lista de regras da senha e adiciona/sobrescreve o ícone de check, que vem com importação do Bootstrap
        maxPass.innerHTML = 'No máximo 20 caracteres<i class="bi bi-check-lg"></i>';
    }
    else {
        // Adiciona a classe 'invalid' que faz com que o texto mude para a cor vermelha
        maxPass.classList.add('invalid');
        // Remove a classe 'valid' do CSS que faz com que o texto mude para a cor verde
        maxPass.classList.remove('valid');
        // Sobrescreve no HTML a mensagem da lista de regras da senha e adiciona/sobrescreve o ícone de "x", que vem com importação do Bootstrap
        maxPass.innerHTML = 'No máximo 20 caracteres <i class="bi bi-x"></i>';
    }
    // Verificação da existência de letra (maiúscula ou nimúscula)
    if (letter.test(data)) {
        // Adiciona a classe 'valid' que faz com que o texto mude para a cor verde
        minLetter.classList.add('valid');
        // Remove a classe 'invalid' do CSS que faz com que o texto mude para a cor vermelha
        minLetter.classList.remove('invalid');
        // Sobrescreve no HTML a mensagem da lista de regras da senha e adiciona/sobrescreve o ícone de check, que vem com importação do Bootstrap
        minLetter.innerHTML = 'No mínimo uma letra <i class="bi bi-check-lg"></i>';
    }
    else {
        // Adiciona a classe 'invalid' que faz com que o texto mude para a cor vermelha
        minLetter.classList.add('invalid');
        // Remove a classe 'valid' do CSS que faz com que o texto mude para a cor verde
        minLetter.classList.remove('valid');
        // Sobrescreve no HTML a mensagem da lista de regras da senha e adiciona/sobrescreve o ícone de "x", que vem com importação do Bootstrap
        minLetter.innerHTML = 'No mínimo uma letra <i class="bi bi-x"></i>';
    }
    // Verificação da existência de número (de 0  )
    if (number.test(data)) {
        // Adiciona a classe 'valid' que faz com que o texto mude para a cor verde
        minNumber.classList.add('valid');
        // Remove a classe 'invalid' do CSS que faz com que o texto mude para a cor vermelha
        minNumber.classList.remove('invalid');
        // Sobrescreve no HTML a mensagem da lista de regras da senha e adiciona/sobrescreve o ícone de check, que vem com importação do Bootstrap
        minNumber.innerHTML = 'No mínimo um número <i class="bi bi-check-lg"></i>';
    }
    else {
        // Adiciona a classe 'invalid' que faz com que o texto mude para a cor vermelha
        minNumber.classList.add('invalid');
        // Remove a classe 'valid' do CSS que faz com que o texto mude para a cor verde
        minNumber.classList.remove('valid');
        // Sobrescreve no HTML a mensagem da lista de regras da senha e adiciona/sobrescreve o ícone de "x", que vem com importação do Bootstrap
        minNumber.innerHTML = 'No mínimo um número <i class="bi bi-x"></i>';
    }
}
/* ======================================================================================================================================================= */


/* ================================================================= Verificação da senha ================================================================ */
// --- Validação da senha ---
// Função com export (para ser utilizada em outros arquivos .ts) para a validação de senha que recebe como parâmetro o dado do tipo string (texto) e não retorna nenhum valor (void)
export function passwordValidation(data) {
    // Se o campo estiver vazio ou não passar na verificação da regex
    if (data.trim() === "" || !passRegex.test(data)) {
        // Adiciona a classe 'invalid' que faz com que o borda mude para a cor vermelha
        passwordInput.classList.add('invalid');
        // Adicionando a flag de validação
        isPasswordValid = false;
        // Remove a classe 'valid' do CSS que faz com que o borda mude para a cor verde
        passwordInput.classList.remove('valid');
        // Verificando a confirmação de senha
        confirmValidation(confirmPasswordInput.value);
    }
    // Se o campo não estiver vazio e passar na verificação da REGEX
    else {
        // Adiciona a classe 'valid' que faz com que o borda mude para a cor verde
        passwordInput.classList.add('valid');
        // Adicionando a flag de validação
        isPasswordValid = true;
        // Remove a classe 'invalid' do CSS que faz com que o borda mude para a cor vermelha
        passwordInput.classList.remove('invalid');
        // Verificando a confirmação de senha
        confirmValidation(confirmPasswordInput.value);
    }
}

// --- Validação da confirmação de senha ---
// Função com export (para ser utilizada em outros arquivos .ts) para a validação de confirmação de senha que recebe como parâmetro o dado do tipo string (texto) e não retorna nenhum valor (void)
export function confirmValidation(data) {
    // Se o campo de confirmação de senha for igual ao campo de senha e não estiver vazio
    if (confirmPasswordInput.value == passwordInput.value && data.trim() !== "") {
        // Adiciona a classe 'valid' que faz com que o borda mude para a cor verde
        confirmPasswordInput.classList.add('valid');
        // Adicionando a flag de validação
        isPasswordConfirmationValid = true;
        // Remove a classe 'invalid' do CSS que faz com que o borda mude para a cor vermelha
        confirmPasswordInput.classList.remove('invalid');
    }
    // Se o campo de confirmação de senha for diferente do campo de senha ou estiver vazio
    else {
        // Adiciona a classe 'valid' que faz com que o texto mude para a cor verde
        confirmPasswordInput.classList.add('invalid');
        // Adicionando a flag de validação
        isPasswordConfirmationValid = false;
        // Remove a classe 'invalid' do CSS que faz com que o texto mude para a cor vermelha
        confirmPasswordInput.classList.remove('valid');
    }
}

/* ==================================================================================================================================================== */


/* ================================================================= Funções com rotas ================================================================ */
// Função para verificar se o e-mail já está cadastrado
export async function verifyEmailExists(email) {
    try{
        const response = await fetch(`http://localhost:${port}/professor-email`, {
            // Método da rota
            method: "POST",
            // Corpo da requisição convertido para JSON
            body: JSON.stringify({ email: email }),
            // Cabeçalho da rota -> define o tipo de conteúdo como JSON e permite CORS
            headers: {
                // Definindo o tipo de conteúdo como JSON
                "Content-Type": "application/json",
                // Permitindo CORS
                "Access-Control-Allow-Origin": "*"
            }
        });
        // Verifica se o status da resposta não é 500 (erro interno do servidor)
        if(response.status !== 500){
            // Converte a resposta para JSON
            const responseData = await response.json();
            // Verifica a resposta do servidor
            // Se o idProfessor retornado for maior que 0, um usuário com esse e-mail foi encontrado
            if(Number(responseData.idProfessor) > 0){
                // Retorna true para indicar que o e-mail já existe
                console.log(responseData.idProfessor);
                return true;
            }
            // Se o idProfessor retornado for igual a 0, nenhum usuário com esse e-mail foi encontrado
            else if(Number(responseData.idProfessor) === 0){
                // Retorna false para indicar que o e-mail já não existe
                return false;
            }
        }
        // Se o status for 500, exibe um alerta de erro e retorna true para evitar cadastro
        else{
            alert("Erro ao se conectar com o servidor! Tente novamente mais tarde.");
            return true;
        }
    }
    // Captura qualquer erro que ocorra durante a requisição e retorna true para evitar cadastro
    catch (error) {
        console.error("Erro na requisição: ", error);
        alert("Erro ao se conectar com o servidor! Tente novamente mais tarde.");
        return true;
    }
}
/* ================================================================================================================================================== */