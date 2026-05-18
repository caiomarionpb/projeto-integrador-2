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

/* =========================================================== Redirecionamento para o primeiro acesso =================================================== */

// Obtém o valr armazenado na variável de armazenamento local que controla o primeiro acesso
const firstAccess = localStorage.getItem("firstAccess");

// Se a flag estiver definida e seu valor for verdadeiro...
if(firstAccess && firstAccess === true){
    // Aviso de acesso inválido
    alert("Antes de prosseguir, você precisa cadastrar uma instituição e um curso para o qual leciona.");
    // Redirecionamento para o formulário de cadastro de disciplina e curso para primeiro acesso
    window.location.href = "../pages/firstAccess.html";
}

// Verifica se a flag não está definida ou se não está marcada como false, para que função não tenha que ser carregada em casos não aplicáveis
if(!firstAccess || firstAccess !== false){
    // Adicionando a função de verificação de primeiro acesso ao carregamento da página
    document.addEventListener('DOMContentLoaded', verifyFirstAccess)
    
    // Função para verificar se este é o primeiro acesso do usuário - impede brechas
    async function verifyFirstAccess(){
        try{
            // Faz a requisição para a rota que acessa o banco e retorna se esse é ou não o primeiro acesso
            const response = await fetch(`http://localhost:${port}/first-access`, {
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
                    // Obtém a resposta em formato json para a naálise do resultado
                    const responseData = await response.json();
                    // Se este for o primeiro acesso...
                    if(responseData.firstAccess === true){
                        // Define a variável de armazenamento local e atribui true ao seu valor
                        localStorage.setItem('firstAccess', true);
                        // Redireciona para o formulário de cadastro de disciplina e curso para primeiro acesso
                        window.location.href = "../pages/firstAccess.html";
                    }
                    else{
                        // Define a variável de armazenamento local e atribui false ao seu valor, permitindo que o usuário continue a navegação e tenha seu acesso restrito ao formulário de primeiro acesso
                        localStorage.setItem('firstAccess', false);
                    }
                }
                // Caso o status da resposta não esteja na faixa 200 ou 500, emite uma mensagem de erro
                else{
                    alert("Erro ao buscar os dados do usuário.");
                }
            }
            // Se houver erro interno no servidor (faixa 500)
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
}

/* ======================================================================================================================================================= */

// Importando a porta que será utilizada nas rotas
import {port} from './formAssets.js';

import {loadHierarchyMenu} from './hierarchyMenu.js';

/* ================================================================== Logout do sistema ================================================================== */

// Botão de logout
const logoutButton = document.getElementById("logoutButton");

// Se o botão estiver definido, adiciona a função ao evento de clique
if (logoutButton) {
    logoutButton.addEventListener("click", logout);
}

// Função de logout
function logout() {
    // Remove o token do localStorage
    localStorage.removeItem("token");
    // Remove a flag de primeiro acesso do localStorage
    localStorage.removeItem("firstAccess");
    // Redireciona o usuário para a página de login
    window.location.href = "../pages/index.html";
}
/* ======================================================================================================================================================= */

/* ======================================================== Funções para o carregamento do menu lateral ================================================== */

// A função de carregar a hierarquia de dados atrelada ao docente será chamada quando a página for carregada
document.addEventListener("DOMContentLoaded", loadHierarchyMenu);

/* ======================================================================================================================================================= */