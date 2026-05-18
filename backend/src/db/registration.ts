// Autor: Noemi Kayama
/* =========================================================== Importação de pacotes e funções ========================================================== */

// Importa o módulo dotenv para carregar variáveis de ambiente
import dotenv from 'dotenv';
// Carrega as variáveis de ambiente do arquivo email.env
dotenv.config({ path: '../backend/email.env' }); 
// Importa o módulo nodemailer para envio de emails
import nodemailer from 'nodemailer';
// Importa funções de abertura e fechamento de conexão com o banco de dados
import {open, close} from "../config/db";
// Importa o módulo do OracleDB
import OracleDB from "oracledb";
/* ======================================================================================================================================================= */


/* ============================================================ Funções assíncronas exportadas =========================================================== */
// Interface que representa um docente
export interface Professor {
    id?: number,
    name?: string,
    email: string,
    password: string,
    cell_number?: string
}

// Interface que representa a autenticação de um docente
export interface ProfessorAuth {
    id: number,
    email: string
}

// Função para obter professor por ID
export async function getProfessorById(id: number): Promise<Professor | null> {
    // Abre a conexão com o banco de dados
    const conn = await open();
    try {
        // Executa a consulta SQL para obter o professor pelo ID
        const result = await conn.execute(
            `SELECT ID as "id", FIRST_NAME as "first_name", SURNAME as "surname", EMAIL as "email", PASSWORD as "password" FROM PROFESSOR
            WHERE ID = :id`,
             [id]
        );
        // Retorna o professor encontrado ou null se não houver correspondência
        return (result.rows && result.rows[0]) as Professor | null;
    } finally {
        // Fecha a conexão com o banco de dados
        await close(conn);
    }
}

// Função para verificar existência de professor por email -> Cadastro
export async function getProfessorByEmail(email: string): Promise<Professor | null> {
    const conn = await open();
    try{
        // Obtém o ID do professor com base no email fornecido -> verifcação para o cadastro
        const result =  await conn.execute(
            `SELECT ID as "id" FROM PROFESSOR WHERE EMAIL = :email`,
            [email]
        );
        // Retorna o id do professor encontrado ou null se não houver correspondência
        return (result.rows && result.rows[0]) as Professor | null;
    } finally{
        // Fecha a conexão
        await close(conn);
    }
}

// Função para verificar existência de professor por email -> Cadastro
export async function getProfessorByPhone(phone: string): Promise<Professor | null> {
    const conn = await open();
    try{
        // Obtém o ID do professor com base no celular fornecido -> verifcação para o cadastro
        const result =  await conn.execute(
            `SELECT ID as "id" FROM PROFESSOR WHERE CELL_NUMBER = :phone`,
            [phone]
        );
        // Retorna o id do professor encontrado ou null se não houver correspondência
        return (result.rows && result.rows[0]) as Professor | null;
    } finally{
        // Fecha a conexão
        await close(conn);
    }
}

// Função para autenticar professor por email e senha -> Login
export async function getProfessorByEmailAndPassword(email: string, password: string): Promise<ProfessorAuth | null> {
    // Abre a conexão com o banco de dados
    const conn = await open();
    try{
        // Obtém o ID do professor com base no email e senha fornecidos -> autenticação por Login
        const result =  await conn.execute(
            `SELECT ID as "id" FROM PROFESSOR WHERE EMAIL = :email AND PASSWORD = :password`,
            [email, password]
        );
        // Retorna o id do professor encontrado ou null se não houver correspondência
        return (result.rows && result.rows[0]) as ProfessorAuth | null;
    } finally{
        // Fecha a conexão
        await close(conn);
    }
}


// Função para extrair o primeiro nome de uma string de nome completo, que recebe como parâmetro o nome completo
function firstName(name: string): string {
    // Declaração e inicialização do índice
    let i: number = 0;
    // Declaração e inicialização da variável que armazenará o primeiro nome
    let first_name: string = "";
    // Divide o nome completo em partes usando espaço como separador
    while (name[i] != ' ' && i < name.length) {
        first_name += name[i];
        i++;
    }
    return first_name;
}

// Função para obter o sobrenome a partir do nome completo e o primeiro nome
function lastName(name: string, firstName: string): string {
    // Cria o nome completo e o primeiro nome sem espaços extras (de tal forma que os nomes fiquem "juntos")
    const fullName = name.trim();
    const first = firstName.trim();
    // Se o nome completo for igual ao primeiro nome, retorna uma string vazia, pois não há sobrenome
    if (fullName == first) {
        return "";
    } 
    // Volta a adicionar um espaço entre o primeiro nome e o resto, para evitar erros na hora da execução
    const firstBegin = first + " ";
    // Se o nome completo realmente começar com o primeiro nome e um espaço
    if (fullName.startsWith(firstBegin)) {
        // Retorna a parte do nome completo que vem após o primeiro nome e o espaço
        return fullName.substring(firstBegin.length);
    }
    // Caso o nome não comece com o primeiro nome, retorna uma string vazia
    return "";
}


// Função para cadastro do professor
export async function addProfessor(name:string, email:string,  cell_number:number, password:string): Promise<number>{
    const first: string = firstName(name);
    const surname: string = lastName(name, first);
    // Abre a conexão
    const conn = await open();
    try{
        // Tenta executar inserção com comando sql
        const result= await conn.execute<{
            outBinds :{id:number}}>(
            `INSERT INTO PROFESSOR (FIRST_NAME, SURNAME, EMAIL, CELL_NUMBER, PASSWORD)
            VALUES (:first, :surname, :email, :cell_number, :password )
            RETURNING ID INTO :id`,
            {first,
            surname, 
            email, 
            cell_number, 
            password, 
            id: {
                // Indica que o parametro será retornado pelo oracle
                dir: OracleDB.BIND_OUT,
                // Define o tipo de dado que o oracle vai retonar
                type: OracleDB.NUMBER
                }},
                // Se a operação de inserção der certo será salva automaticamente no banco 
                {autoCommit: true}
            );
            
            // Armazena id retornado pelo oracle
            const outBinds = result.outBinds as {id?:number[]} | undefined;
            
            // Verificação se realmente foi retornado um id
            if(!outBinds || !outBinds.id || outBinds.id.length===0){
                throw new Error("Erro ao obter um ID")
            }
            // Retorna id gerado
            return outBinds.id[0];
        }finally{
            // Fecha conexão
            await close(conn);
        }
}

// Configurações do Gmail para envio de emails
const GMAIL_USER = process.env.GMAIL_USER;
// Lembre-se: Use a "Senha de App" do Google, não sua senha normal!
const GMAIL_PASS = process.env.GMAIL_PASS; 

// Configuração do transporte de email usando nodemailer
const transporter = nodemailer.createTransport({
    // Configurações do servidor SMTP do Gmail
    host: "smtp.gmail.com",
    // Porta para envio seguro
    port: 465,
    // Indica que a conexão deve ser segura
    secure: true,
    // Configurações de autenticação (e-mail e senha) do Gmail do remetente
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS, // Use a "Senha de App" aqui
    },
});

// Logs para verificar se as variáveis de ambiente foram carregadas corretamente
console.log(`GMAIL_USER: ${GMAIL_USER}`);
console.log(`Password: ${GMAIL_PASS}`);

// Interface que representa uma pessoa; Anteriormente, foi feita uma interface com o nome Professor, mas como na outra a variável password é obrigatória, foi criada essa nova interface para lidar com casos onde a senha pode não ser necessária também 
export interface Person {
    id?: number,
    name?: string,
    email: string,
    password?: string,
    cell_number?: string
}

// Função para verificar existência de professor por email -> Cadastro
export async function getPersonByEmail(email: string): Promise<Person | null> {
    // Abre a conexão com o banco de dados
    const conn = await open();
    try{
        // Obtém o ID do professor com base no email fornecido -> verifcação para o cadastro
        const result =  await conn.execute(
            `SELECT ID as "id" FROM PROFESSOR WHERE EMAIL = :email`,
            [email]
        );
        // Retorna o id do professor encontrado ou null se não houver correspondência
        return (result.rows && result.rows[0]) as Person | null;
    } finally{
        // Fecha a conexão
        await close(conn);
    }
}

// Função para atualizar a senha do professor
export async function updatePassword(newPassword: string, email: string): Promise<Person | null> {
    // Abre a conexão com o banco de dados
    const conn = await open();
    // Tenta executar o código
    try {
        // Executa o comando SQL para atualizar a senha do professor com base no email
        const result = await conn.execute(
            // Comando SQL para atualizar a senha e retornar o ID
            `UPDATE PROFESSOR SET PASSWORD = :newPassword WHERE EMAIL = :email RETURNING ID INTO :id`,
            {   // Parâmetro de entrada
                newPassword: newPassword,
                // Parâmetro de entrada
                email: email,
                // Parâmetro de saída
                id: {
                    // Indica que o parametro será retornado pelo Oracle
                    dir: OracleDB.BIND_OUT,
                    // Define o tipo de dado que o Oracle vai retonar
                    type: OracleDB.NUMBER
                }
            },
            // Confirma a transação automaticamente
            {autoCommit: true}
        );
        // Obtém os valores retornados
        const outBinds = result.outBinds as { id?: number[] } | undefined;

        // Se o outBinds existir, se o id existir e tiver pelo menos um elemento
        if (outBinds && outBinds.id && outBinds.id.length > 0) {
            // Retorna o ID e email do professor cuja senha foi atualizada
            return { id: outBinds.id[0], email: email };
        } else {
            // Se não, o UPDATE não afetou linhas (email não encontrado no DB)
            return null;
        }
    } finally {
        // Fecha a conexão com o banco de dados
        await close(conn);
    }
}

// Verificação se a senha do Gmail do nota10pi2@gmail.com está definida
if (!GMAIL_PASS) {
    // Log de aviso se a variável de ambiente não estiver definida
    console.warn('AVISO: GMAIL_PASS não está definida. O envio de email provavelmente falhará.');
}

// Função para enviar link por email para redefinição de senha
export async function sendEmailLink(email: string): Promise<Number> {
    // Definição do link para a página de nova senha
    const url = "http://127.0.0.1:5500/frontend/pages/newPassword.html";
    
    // Definição das opções e componentes do e-mail
    const mailOptions = {
        // Remetente do e-mail
        from: `"NotaDez" <${GMAIL_USER}>`,
        // Destinatário do e-mail
        to: `${email}`, 
        // Assunto do e-mail
        subject: "Aqui está o seu link!", 
        
        // Caso o e-mail não suporte HTML, esse comando envia o texto simples com o link
        text: `Olá! Aqui está o seu link: ${url}`,
        
        // HTML do e-mail com o CSS embutido,contend a mensagem e o link estilizado
        html: `
            <h1>Olá!</h1>
            <p>Obrigado por se registrar. Por favor, clique no link abaixo para ir à página.</p>
            
            <a href="${url}" 
               target="_blank" 
               style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;" > Clique aqui para confirmar
            </a>
            
            <p style="margin-top: 20px;">Se o botão não funcionar, copie e cole este link no seu navegador:</p>
            <p>${url}</p>
        `,
    };

    // Tentativa de envio do email
    try {
        // Registro do processo de envio
        console.log("Enviando email...");
        // Envia o email usando o transporter configurado
        let info = await transporter.sendMail(mailOptions);
        // Log do resultado do envio
        console.log("Email enviado com sucesso!");
        // Retorna 0 para indicar sucesso
        return 0;
    // Caso ocorra um erro no envio
    } catch (error) {
        // Log do erro ocorrido
        console.error("Erro ao enviar o email:", error);
        // Retorna -1 para indicar falha
        return -1;
    }
}
