/* Autor: Enzo Olivato Pazian */


/* =================================================== Redirecionamento caso o docente esteja logado =================================================== */
// Obtenção do token armazenado no localStorage do navegador
const token = localStorage.getItem("token");
// Verificação se o token existe
if(token){
    // Redirecionamento para a página inicial (home) do sistema (caso o professor já esteja logado)
    window.location.href = "../pages/home.html";
}
/* ======================================================================================================================================================= */

/* =================================================== Declaração/Importação de variáveis e restrições =================================================== */
// Importação de variáveis e funções que se encontram no arquivo formAssets.ts
import { eyeButton1, eyeButton2, passwordInput, confirmPasswordInput, isPasswordValid, isPasswordConfirmationValid, passwordValidation, verifyPassword, confirmValidation, port, verifyEmailExists } from "./formAssets.js";
// --- REGEX dos campos de nome, e-mail e telefone ---
// Define uma restrição para o campo de nome no qual só aceita letras (maiúsculas e minúsculas) e espaços, com tamanho entre 1 e 50 caracteres
const nameRegex = /^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ ]+$/;
// Define uma expressão regular para validar o e-mail
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Define uma expressão regular para validar o número de telefone no formato brasileiro
const phoneRegex = /^\(?[1-9]{2}\)?\s?9?\d{4}-?\d{4}$/;
// --- Variáveis que recebem os elementos dos inputs do formulário de cadastro ---
// Obtém o elemento de entrada de nome pelo seu ID "inputFirstName"
const nameInput = document.getElementById("inputFirstName");
// Obtém o elemento de entrada de e-mail pelo seu ID "inputEmail"
const emailInput = document.getElementById("inputEmail");
// Obtém o elemento de entrada de telefone pelo seu ID "inputTel"
const phoneInput = document.getElementById("inputTel");
// --- Flags de validação dos campos do formulário (todas setadas como false de início) ---
// Flag para a validação do nome
var isNameValid = false;
// Flag para a validação do e-mail
var isEmailValid = false;
// Flag para a validação do telefone
var isPhoneValid = false;
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
        // Transforma o tipo de conteúdo do "inputConfirmPass" em texto (para o usuário poder visualizar o que está sendo digitado)
        confirmPasswordInput.type = 'text';
        // Forma sucinta de dizer que se o botão do olho for ele sem o risco, ao clicar transformá-lo no ícone com o risco. Caso contrário, transformá-lo no olho sem o risco
        eyeButton2.innerHTML = eyeButton2.innerHTML == '<i class="bi bi-eye"></i>' ? '<i class="bi bi-eye-slash"></i>' : '<i class="bi bi-eye"></i>';
    }
    else {
        // Ao clicar novamente, retorna o tipo de conteúdo do "inputConfirmPass" para "password", onde o texto passa a ficar escondido
        confirmPasswordInput.type = 'password';
        // Forma sucinta de dizer que se o botão do olho for ele sem o risco, ao clicar transformá-lo no ícone com o risco. Caso contrário, transformá-lo no olho sem o risco
        eyeButton2.innerHTML = eyeButton2.innerHTML == '<i class="bi bi-eye"></i>' ? '<i class="bi bi-eye-slash"></i>' : '<i class="bi bi-eye"></i>';
    }
});
/* ======================================================================================================================================================= */
/* =============================================================== Máscara para o telefone =============================================================== */
// --- Event Listeners e funções para formatação do campo de telefone ---
// Adcionando os eventos para o input e para a digitação de teclas
phoneInput.addEventListener("input", formatPhone);
// Escuta a tecla 'keydown' no campo de telefone para tratar Backspace e preservar/ajustar a máscara corretamente
phoneInput.addEventListener("keydown", handleBackspace);
/* Função que formata o valor do input de telefone enquanto o usuário digita:
   remove caracteres não numéricos, limita a 11 dígitos e aplica máscara no formato (XX) XXXXX-XXXX */
function formatPhone(e) {
    // Verifica se o disparador do evento não é nulo
    if (e.target) {
        //Remove os caracteres que não forem numéricos usando a regEx /\D/g, sendo [^...] tudo o que não está dentro dos colchetes e o g a flag global para substituir todos os casos na string, e limita o tamanho a 11 digitos usando o substring
        let phone = e.target.value.replace(/\D/g, "").substring(0, 11);
        // Variável para receber o número formatado
        let formatted = "";
        // Verifica se a quantidade de números digitado é maior que 0 -> Formatação do DDD
        if (phone.length > 0) {
            // Agrupa os caracteres da posição 0 até a posição 2
            formatted += `(${phone.substring(0, 2)})`;
        }
        // Verifica se a quantidade de números digitado é maior que 2 -> Formatação da primeira parte do número
        if (phone.length >= 3) {
            // Agrupa os caracteres da posição 2 até a posição 7
            formatted += ` ${phone.substring(2, 7)}`;
        }
        // Verifica se a quantidade de números digitado é maior que 7 -> Formatação da segunda parte do número
        if (phone.length >= 8) {
            // Agrupa os caracteres da posição 7 até a posição 11
            formatted += `-${phone.substring(7, 11)}`;
        }
        //Envia para o campo o número formatado
        e.target.value = formatted;
    }
}
// Função que permite apagar os caracteres da máscara para corrigir digitações erradas
function handleBackspace(e) {
    // Verifica se o disparador do evento não é nulo
    if (e.target) {
        // Obtém a tecla digitada
        const key = e.key;
        // Obtém a posição do cursor para se orientar ao apagar a máscara
        const pos = e.target.selectionStart;
        // Verifica se a tecla é a backspace
        if (key === "Backspace") {
            // Obtém o valor do campo e força a limpeza de caracteres não aceitos
            const phone = e.target.value.replace(/\D/g, "");
            // Verifica a posição do cursor
            if (pos <= 4 && phone.length <= 2) {
                // Apaga o caracter da máscara na posição selecionada
                e.target.value = "";
                // Sobrescreve a função original
                e.preventDefault();
            }
        }
    }
}
/* ======================================================================================================================================================= */
/* ========================================= Impedindo a digitação de números e outros caracteres no input de nome ======================================= */
// Adiciona ao evento input do nome a função de formatação do campo do nome
nameInput.addEventListener("input", formatName);
// Função de formatação do nome
function formatName(e) {
    // Verifica se o disparador do evento não é nulo
    if (e.target) {
        // Remove os caracteres que não forem caracteres usando a regEx /[^A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ ]+/g, sendo [^...] tudo o que não está dentro dos colchetes, o + sendo um ou mais dos caracteres referenciados e o g a flag global para substituir todos os casos na string
        let name = e.target.value.replace(/[^A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ ]+/g, "");
        // Retorna o valor formatado para o input, caso nameInput não seja nulo
        if (nameInput) {
            nameInput.value = name;
        }
    }
}
/* ======================================================================================================================================================= */
/* ================================================================= Verificação da senha ================================================================ */
// Adiciona um Event listener para cada digitação; Usa o "passwordInput" declarada anteriormente; O addEventListener faz com que, ao realizar a ação "keyup", ou seja, quando o usuário soltar a tecla do teclado, ele utiliza o objeto "e" do evento "KeyboardEvent" que diz o que foi digitado e verifica através da função "verifyPassword" se o que foi digitado no momento está de acordo com as regras de validação
passwordInput.addEventListener("keyup", (e) => {
    // Verifica se o disparador do evento não é nulo, caso não seja, ele prossegue para chamar a função de verificação de senha
    if (e.target) {
        // Chamada da função de verificação de senha, passando o valor atual do campo de senha
        verifyPassword(e.target.value);
    }
});
/* ======================================================================================================================================================= */
/* =================================================== Validação dos campos de nome, e-mail e telefone =================================================== */
// --- Validação do nome ---
// Função para validar o campo de nome
function nameValidation(data) {
    // Verifica se nameInput não é nulo
    if (nameInput) {
        // Se o campo estiver vazio ou não passar na verificação da regex
        if (data.trim() === "" || !nameRegex.test(data)) {
            // Adiciona a classe 'invalid' que faz com que o borda mude para a cor vermelha 
            nameInput.classList.add('invalid');
            // Adicionando a flag de validação
            isNameValid = false;
            // Remove a classe 'valid' do CSS que faz com que o borda mude para a cor verde
            nameInput.classList.remove('valid');
        }
        // Se o campo não estiver vazio e passar na verificação da regex
        else {
            // Adiciona a classe 'valid' que faz com que o borda mude para a cor verde
            nameInput.classList.add('valid');
            // Adicionando a flag de validação
            isNameValid = true;
            // Remove a classe 'invalid' do CSS que faz com que o borda mude para a cor vermelha
            nameInput.classList.remove('invalid');
        }
    }
}
;
// Event listener para cada digitação; Usa o "nameInput" declarada anteriormente; O addEventListener faz com que, ao realizar a ação "keyup", ou seja, quando o usuário soltar a tecla do teclado, ele utiliza o objeto "e" do evento "KeyboardEvent" que diz o que foi digitado e verifica através da função "nameValidation" se o que foi digitado no momento está de acordo com as regras de validação
nameInput.addEventListener("keyup", (e) => {
    // Verifica se o disparador do evento não é nulo
    if (e.target) {
        // Chamada da função de verificação de nome, passando o valor atual do campo de nome
        nameValidation(e.target.value);
    }
});
// --- Validação do e-mail ---
// Função para validar o campo de email
function emailValidation(data) {
    // Verifica se emailInput não é nulo
    if (emailInput) {
        if (data.trim() === "" || !emailRegex.test(data)) {
            // Adiciona a classe 'invalid' que faz com que o borda mude para a cor vermelha
            emailInput.classList.add('invalid');
            // Adicionando a flag de validação
            isEmailValid = false;
            // Remove a classe 'valid' do CSS que faz com que o borda mude para a cor verde
            emailInput.classList.remove('valid');
        }
        // Se o campo não estiver vazio e passar na verificação da regex
        else {
            // Adiciona a classe 'valid' que faz com que o borda mude para a cor verde
            emailInput.classList.add('valid');
            // Adicionando a flag de validação
            isEmailValid = true;
            // Remove a classe 'invalid' do CSS que faz com que o borda mude para a cor vermelha
            emailInput.classList.remove('invalid');
        }
    }
}
;
// Event listener para cada digitação; Usa o "emailInput" declarada anteriormente; O addEventListener faz com que, ao realizar a ação "keyup", ou seja, quando o usuário soltar a tecla do teclado, ele utiliza o objeto "e" do evento "KeyboardEvent" que diz o que foi digitado e verifica através da função "nameValidation" se o que foi digitado no momento está de acordo com as regras de validação
emailInput.addEventListener("keyup", (e) => {
    // Se o evento possui alvo (input existe), chama a função de validação de e-mail passando o valor atual do campo
    if (e.target) {
        emailValidation(e.target.value);
    }
});
// --- Validação do telefone ---
// Função para validar o campo de telefone
function phoneValidation(data) {
    // Se o campo estiver vazio ou não passar na verificação da regex
    if (phoneInput) {
        if (data.trim() === "" || !phoneRegex.test(data)) {
            // Adiciona a classe 'invalid' que faz com que o borda mude para a cor vermelha
            phoneInput.classList.add('invalid');
            // Adicionando a flag de validação
            isPhoneValid = false;
            // Remove a classe 'valid' do CSS que faz com que o borda mude para a cor verde
            phoneInput.classList.remove('valid');
        }
        // Se o campo não estiver vazio e passar na verificação da regex
        else {
            // Adiciona a classe 'valid' que faz com que o borda mude para a cor verde
            phoneInput.classList.add('valid');
            // Adicionando a flag de validação
            isPhoneValid = true;
            // Remove a classe 'invalid' do CSS que faz com que o borda mude para a cor vermelha
            phoneInput.classList.remove('invalid');
        }
    }
}
;
// Event listener para cada digitação; Usa o "phoneInput" declarada anteriormente; O addEventListener faz com que, ao realizar a ação "keyup", ou seja, quando o usuário soltar a tecla do teclado, ele utiliza o objeto "e" do evento "KeyboardEvent" que diz o que foi digitado e verifica através da função "nameValidation" se o que foi digitado no momento está de acordo com as regras de validação
phoneInput.addEventListener("keyup", (e) => {
    // Verifica se o disparador do evento não é nulo
    if (e.target) {
        // Chama a função de validação do telefone, passando o valor atual do campo de telefone
        phoneValidation(e.target.value);
    }
});
/* ======================================================================================================================================================= */
/* ====================================================== Validação dos campos de senha e confirmação ==================================================== */
// --- Validação da senha ---
// Event listener para cada digitação; Usa o "passwordInput" declarada anteriormente; O addEventListener faz com que, ao realizar a ação "keyup", ou seja, quando o usuário soltar a tecla do teclado, ele utiliza o objeto "e" do evento "KeyboardEvent" que diz o que foi digitado e verifica através da função "passwordValidation" se o que foi digitado no momento está de acordo com as egras de validação
passwordInput.addEventListener("keyup", (e) => {
    // Verifica se o disparador do evento não é nulo
    if (e.target) {
        // Executa a função de validação da senha para o valor inserido na senha
        passwordValidation(e.target.value);
    }
});
// --- Validação da confirmação de senha ---
// Event listener para cada digitação; Usa o "confirmPasswordInput" declarada anteriormente; O addEventListener faz com que, ao realizar a ação "keyup", ou seja, quando o usuário soltar a tecla do teclado, ele utiliza o objeto "e" do evento "KeyboardEvent" que diz o que foi digitado e verifica através da função "confirmValidation" se o que foi digitado no momento está de acordo com as regras de validação
confirmPasswordInput.addEventListener("keyup", (e) => {
    // Verifica se o disparador do evento não é nulo
    if (e.target) {
        // Chama a função de validação da confirmação de senha
        confirmValidation(e.target.value);
    }
});
/* ======================================================================================================================================================= */

/* =================================================================== Função de cadastro ================================================================ */
// Obtendo o campo do formulário para manipulá-lo
const form = document.getElementById("registerForm");
// Adicionando a função controladora do evento submit
form.addEventListener("submit", register);

// Função de cadastro que recebe o evento de submeter do formulário como parâmetro e é do tipo void, pois não retorna nenhum valor
async function register(event) {
    // Cancela o comportamento padrão do evento submit
    event.preventDefault();
    // Verifica se todos os campos estão validados
    if (isNameValid && isEmailValid && isPhoneValid && isPasswordValid && isPasswordConfirmationValid) {
        // Verifica se o e-mail já está cadastrado no sistema
        if(await verifyEmailExists(emailInput.value) === true){
            // Emite um alerta informando que o e-mail já está cadastrado
            alert("O e-mail informado já está cadastrado. Utilize outro e-mail para continuar.");
            // Impede o prosseguimento do cadastro
            return;
        }
        // Verifica se o telefone já está cadastrado no sistema
        if(await verifyPhoneExists(phoneInput.value) === true){
            // Emite um alerta informando que o telefone já está cadastrado
            alert("O telefone informado já está cadastrado. Utilize outro telefone para continuar.");
            // Impede o prosseguimento do cadastro
            return;
        }
        // Se nenhuma das verificações anteriores impedir o cadastro, prossegue para registrar o professor no sistema
        // Declarando o objeto que será enviado para o backend com os dados do professor
        const professorData = {
            name: nameInput.value,
            email: emailInput.value,
            cell_number: phoneInput.value,
            password: passwordInput.value
        };
        // Chama a função de registro do professor, passando os dados do professor
        const registeredProfessorId = await registerProfessor(professorData);
        // Verifica se o retorno da função foi falso
        if(!registeredProfessorId){
            // Impede o prosseguimento do cadastro
            return;
        }
        // Emite um alerta de sucesso
        alert("Cadastro realizado com successo!!\nSeja bem vindo à plataforma!");
        // Define que este é o primeiro acesso do usuário
        localStorage.setItem('firstAccess', true);
        // Redireciona para a página inicial
        window.location.href = "../pages/firstAccess.html";
    }
    else {
        // Se não estiverem, emite uma mensagem de erro
        alert("Um ou mais campos estão incorretos. Preencha todos corretamemte para continuar.");
    }
}

// Função para verificar se o telefone já está cadastrado
async function verifyPhoneExists(phone) {
    try{
        const response = await fetch(`http://localhost:${port}/professor-phone`, {
            // Método da rota
            method: "POST",
            // Corpo da requisição convertido para JSON
            body: JSON.stringify({ cell_number: phone }),
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
            // Se o idProfessor retornado for maior que 0, um usuário com esse celular foi encontrado
            if(Number(responseData. idProfessor) > 0){
                // Retorna true para indicar que o celular já existe
                console.log(responseData.idProfessor);
                return true;
            }
            // Se o idProfessor retornado for igual a 0, nenhum usuário com esse celular foi encontrado
            else if(Number(responseData.idProfessor) === 0){
                // Retorna false para indicar que o celular já não existe
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
        console.error("Erro na requisição:", error);
        alert("Erro ao se conectar com o servidor! Tente novamente mais tarde.");
        return true;
    }
}

// Função para registrar o professor no sistema
async function registerProfessor(professorData) {
    try{
        const response = await fetch(`http://localhost:${port}/register-professor`, {
            // Método da rota
            method: "POST",
            // Corpo da requisição convertido para JSON
            body: JSON.stringify(professorData),
            // Cabeçalho da rota -> define o tipo de conteúdo como JSON e permite CORS
            headers: {
                // Definindo o tipo de conteúdo como JSON
                "Content-Type": "application/json"
            }
        });
        // Verifica se o status da resposta não é 500 (erro interno do servidor)
        if(response.status !== 500){
            if(response.ok){
                // Converte a resposta para JSON
                const responseData = await response.json();
                // Verifica a resposta do servidor
                // Se o token de autenticação foi definido, o cadastro foi bem sucedido
                if(responseData.token){
                    // Armazena o token de autenticação do professor no localStorage do navegador
                    localStorage.setItem("token", responseData.token);
                    // Retorna o true para indicar sucesso
                    return true;
                }
                else{
                    // Exibe um alerta de erro caso o cadastro não tenha sido bem-sucedido
                    alert("Houve um erro ao cadastrar o professor. Tente novamente mais tarde.");
                    // Retorna false para indicar falha no cadastro
                    return false;
                }
            }
            else{
                // Exibe um alerta de erro caso o cadastro não tenha sido bem-sucedido
                alert("Houve um erro ao cadastrar o professor. Tente novamente mais tarde.");
                // Retorna false para indicar falha no cadastro
                return false;
            }
        }
        else{
            // Se o status for 500, exibe um alerta de erro
            alert("Erro ao se conectar com o servidor! Tente novamente mais tarde.");
            // Retorna false para indicar falha no cadastro
            return false;
        }
    }
    // Captura qualquer erro que ocorra durante a requisição e retorna true para evitar cadastro
    catch (error) {
        console.error("Erro na requisição: ", error);
        alert("Erro ao se conectar com o servidor! Tente novamente mais tarde.");
        // Retorna false para indicar falha no cadastro
        return false;
    }
}
/* ======================================================================================================================================================= */ 