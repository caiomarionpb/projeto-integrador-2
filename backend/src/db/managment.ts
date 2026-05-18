/* Autor: Enzo Olivato Pazian */

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

export interface IdReturns {
    ID: number
}

// Função para identificar se um docente possui instituições cadastradas (primeiro acesso)
export async function getInstituitionByProfessor(professorId: string): Promise<IdReturns | null>{
    // Abrindo a conexão com o banco
    const conn = await open();
    try{
        // Query para obter a(s) instituição(ões) atreladas ao docente
        const sql = 'SELECT id FROM INSTITUTION WHERE id_professor = TO_NUMBER(:id)';
        // Executando a query
        const result = await conn.execute(sql, [professorId]);
        // Se houver uma ou mais instituições registradas, retorna o resultado obtido convertendo-o para o modelo da interface IdReturns
        if (result.rows && result.rows.length > 0) {
            const row = result.rows[0] as { id: number };
            return { ID: row.id };
        }
        // Retorna null se não houver nenhuma instituição registrada
        return null;
    }
    finally{
        // Fecha a conexão
        await close(conn);
    }
}

// Função para buscar a lista de dados atrelada ao docente (instituições, cursos, disciplinas e turmas)
export async function getProfessorHierarchy(professorId: string): Promise<any[]> {
    // Abrindo a conexão
    const conn = await open();
    try {
        // Query para obter todos os dados relacionados ao docente...
        const sql = `
            SELECT
                i.id AS "institution_id", 
                i.name AS "institution_name",
                c.id AS "course_id", 
                c.name AS "course_name",
                s.id AS "subject_id", 
                s.name AS "subject_name",
                cl.id AS "class_id", 
                cl.name AS "class_name", 
                cl.day AS "class_day", 
                cl.time AS "class_time", 
                cl.classroom AS "class_room"
            FROM Institution i
            LEFT JOIN Course c ON i.id = c.id_institution
            LEFT JOIN Subject s ON c.id = s.id_course
            LEFT JOIN Class cl ON s.id = cl.id_subject
            WHERE i.id_professor = TO_NUMBER(:professorId) 
            ORDER BY "institution_name", "course_name", "subject_name", "class_day"`;
        // Executando a query
        const result = await conn.execute(sql, [professorId]);
        // Obtendo o array com o(s) resultado(s)
        return result.rows as any[] || []; 
    } finally {
        // Fecha a conexão
        await close(conn);
    }
}

// Interface que representa a instituição, onde somente o nome e o id do docente são necessários
export interface Institution {
    id?: number,
    name: string,
    professorId: number
}

// Função assíncrona para adicionar uma instituição. Ela recebe o nome da instituição e o id do docente e não retorna nada, ela apenas executa a função
export async function addInstitution(name: string, professorId: number): Promise <number> {
    // Abre a conexão com o banco de dados
    const conn = await open();
    try {
        // Executa a inserção de dados SQL
        const result = await conn.execute(
        // Comando SQL para criar uma instituição
            `INSERT INTO INSTITUTION (NAME, ID_PROFESSOR)
            VALUES (:name, :professorId) RETURNING ID INTO :id`,
            // Parâmetros de entrada
            {name, 
            professorId, 
            id: {
                // Indica que o parametro será retornado pelo oracle
                dir: OracleDB.BIND_OUT,
                // Define o tipo de dado que o oracle vai retonar
                type: OracleDB.NUMBER
                }
            },
            // Dá commit no SQL
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
    // Se der erro
    } catch (err) {
        // Aviso de que ocorreu um erro
        console.log("Erro ao cadastrar instituição: ", err);
        // Interrupção da função e retorno do erro para quem chamou a função
        throw err;
    // Por fim
    } finally {
        // Fecha a conexão
        await close(conn);
    }
}

// Interface que representa o curso, onde somente o nome e o id do docente são necessários
export interface Course {
    id?: number,
    name: string,
    idInstitution: number
}

// Função assíncrona para adicionar um curso. Ela recebe o nome do curso e o id da instituição e retorna true caso a operação seja bem sucedida
export async function addCourse(name: string, idInstitution: number): Promise <boolean> {
    // Abre a conexão com o banco de dados
    const conn = await open();
    try {
        // Executa a inserção de dados SQL
        await conn.execute(
        // Comando SQL para criar um curso
            `INSERT INTO COURSE (NAME, ID_INSTITUTION)
            VALUES (:name, :idInstitution)`,
            // Parâmetros de entrada
            {name, idInstitution},
            // Dá commit no SQL
            {autoCommit: true}
        );
        // Aviso de que o curso foi registrado com sucesso
        console.log("Curso registrado com sucesso");
        // Se não houver nenhum problema no processo, retorna true
        return true;
    // Se der erro
    } catch (err) {
        // Aviso de que ocorreu um erro
        console.log("Erro ao cadastrar curso: ", err);
        // Interrupção da função e retorno do erro para quem chamou a função
        throw err;
    // Por fim
    } finally {
        // Fecha a conexão
        await close(conn);
    }
}


// Interface que representa a disciplina, onde somente o nome, a sigla, o período e o id do curso são necessários
export interface Subject {
    id?: number,
    name: string,
    code: string,
    term: string,
    courseId: number
}

// Função assíncrona para adicionar uma disciplina. Ela recebe o nome da disciplina, sua sigla, seu período e o id do curso e retorna true caso o cadastro seja bem sucedido
export async function addSubject(name: string, code: string, term: string, idCourse: number): Promise <boolean>{
    // Abre a conexão com o banco de dados
    const conn = await open();
    try {
        // Executa a inserção de dados SQL
        await conn.execute(
        // Comando SQL para criar uma disciplina
            `INSERT INTO SUBJECT (NAME, CODE, TERM, ID_COURSE)
            VALUES (:name, :code, :term, :idCourse)`,
            // Parâmetros de entrada
            {name, code, term, idCourse},
            // Dá commit no SQL
            {autoCommit: true}
        );
        // Aviso de que a disciplina foi registrada com sucesso
        console.log("Disciplina registrada com sucesso");
        // Se não houver nenhum problema no processo, retorna true
        return true;
    // Se der erro
    } catch (err) {
        // Aviso de que ocorreu um erro
        console.log("Erro ao cadastrar disciplina: ", err);
        // Interrupção da função e retorno do erro para quem chamou a função
        throw err;
    // Por fim
    } finally {
        // Fecha a conexão
        await close(conn);
    }
}


// Interface que representa a disciplina, onde somente o nome, a sigla, o período e o id do curso são necessários
export interface Class {
    id?: number,
    name: string,
    day: string,
    time: string,
    building: string,
    classroom: string,
    subjectId: number
}

// Função assíncrona para adicionar uma turma. Ela recebe o nome da disciplina, sua seu(s) dia(s), seu horário, seu prédio, sua sala e o id da disciplina e retorna true caso o cadastro seja bem sucedido
export async function addClass(name: string, day: string, time: string, building: string, classroom: string, idSubject: number): Promise<boolean>{
    // Abre a conexão com o banco de dados
    const conn = await open();
    try {
        // Executa a inserção de dados SQL
        await conn.execute(
        // Comando SQL para criar uma disciplina
            `INSERT INTO CLASS (NAME, DAY, TIME, BUILDING, CLASSROOM, ID_SUBJECT)
            VALUES (:name, :day, :time, :building, :classroom, :idSubject)`,
            // Parâmetros de entrada
            {name, day, time, building, classroom, idSubject},
            // Dá commit no SQL
            {autoCommit: true}
        );
        // Aviso de que a turma foi registrada com sucesso
        console.log("Turma registrada com sucesso");
        // Se não houver nenhum problema no processo, retorna true
        return true;
    // Se der erro
    } catch (err) {
        // Aviso de que ocorreu um erro
        console.log("Erro ao cadastrar turma: ", err);
        // Interrupção da função e retorno do erro para quem chamou a função
        throw err;
    // Por fim
    } finally {
        // Fecha a conexão
        await close(conn);
    }
}

// Função assíncrona para excluir uma instituição. Ela recebe o id da instituição e retorna true caso a exclusão seja bem sucedida
export async function removeInstitution(id: number): Promise <boolean>{
    // Abre a conexão com o banco de dados
    const conn = await open();
    try{
        // Executa a query para remover a instituição com o id especificado
        await conn.execute(`DELETE FROM INSTITUTION WHERE id = :id`,
            // Parâmetro da query
            [id], 
            // Dá commit no SQL
            {autoCommit: true});
        // Aviso de que a instituição foi excluída com sucesso
        console.log("Instituição excluída com sucesso");
        // Se não houver nenhum problema no processo, retorna true
        return true;
    // Se der erro
    } catch (err) {
        // Aviso de que ocorreu um erro
        console.log("Erro ao excluir instituição: ", err);
        // Interrupção da função e retorno do erro para quem chamou a função
        throw err;
    // Por fim
    } finally {
        // Fecha a conexão
        await close(conn);
    }
}

// Função assíncrona para excluir um curso. Ela recebe o id do curso e retorna true caso a exclusão seja bem sucedida
export async function removeCourse(id: number): Promise <boolean>{
    // Abre a conexão com o banco de dados
    const conn = await open();
    try{
        // Executa a query para remover o curso com o id especificado
        await conn.execute(`DELETE FROM COURSE WHERE id = :id`, 
            // Parâmetro da query
            [id], 
            // Dá commit no SQL
            {autoCommit: true});
        // Aviso de que o curso foi excluída com sucesso
        console.log("Curso excluído com sucesso");
        // Se não houver nenhum problema no processo, retorna true
        return true;
    // Se der erro
    } catch (err) {
        // Aviso de que ocorreu um erro
        console.log("Erro ao excluir curso: ", err);
        // Interrupção da função e retorno do erro para quem chamou a função
        throw err;
    // Por fim
    } finally {
        // Fecha a conexão
        await close(conn);
    }
}

// Função assíncrona para excluir uma disciplina. Ela recebe o id da disciplina e retorna true caso a exclusão seja bem sucedida
export async function removeSubject(id: number): Promise <boolean>{
    // Abre a conexão com o banco de dados
    const conn = await open();
    try{
        // Executa a query para remover a disciplina com o id especificado
        await conn.execute(`DELETE FROM SUBJECT WHERE id = :id`,
            // Parâmetro da query
            [id], 
            // Dá commit no SQL
            {autoCommit: true});
        // Aviso de que a disciplina foi excluída com sucesso
        console.log("Disciplina excluída com sucesso");
        // Se não houver nenhum problema no processo, retorna true
        return true;
    // Se der erro
    } catch (err) {
        // Aviso de que ocorreu um erro
        console.log("Erro ao excluir disciplina: ", err);
        // Interrupção da função e retorno do erro para quem chamou a função
        throw err;
    // Por fim
    } finally {
        // Fecha a conexão
        await close(conn);
    }
}

// Função assíncrona para excluir uma turma. Ela recebe o id da turma e retorna true caso a exclusão seja bem sucedida
export async function removeClass(id: number): Promise <boolean>{
    // Abre a conexão com o banco de dados
    const conn = await open();
    try{
        // Executa a query para remover a turma com o id especificado
        await conn.execute(`DELETE FROM CLASS WHERE id = :id`, 
            // Parâmetro da query
            [id], 
            // Dá commit no SQL
            {autoCommit: true});
        // Aviso de que a turma foi excluída com sucesso
        console.log("Turma excluída com sucesso");
        // Se não houver nenhum problema no processo, retorna true
        return true;
    }
    // Se der erro
    catch (err) {
        // Aviso de que ocorreu um erro
        console.log("Erro ao excluir turma: ", err);
        // Interrupção da função e retorno do erro para quem chamou a função
        throw err;
    // Por fim
    } finally {
        // Fecha a conexão
        await close(conn);
    }
}

// Função para a verificação de exclusão de instituições 
export async function canRemoveInstitution(id: number): Promise<boolean>{
    // Abrindo a conexão com o banco
    const conn = await open();
    try{
        // Query para obter o(s) curso(s) atrelado(s) à isntituição
        const sql = 'SELECT id FROM COURSE WHERE id_institution = :id';
        // Executando a query
        const result = await conn.execute(sql, [id]);
        // Se houver um ou mais cursos relacionados a essa instituição, retorna false, pois não será permitido excluí-la
        if (result.rows && result.rows.length > 0) {
            return false;
        }
        // Retorna true se não houver nenhum curso relacionado a ela, pois sua exclusão é permitida
        return true;
    }
    // Se der erro
    catch (err) {
        // Aviso de que ocorreu um erro
        console.log("Erro ao consultar cursos para escluir instituições: ", err);
        // Interrupção da função e retorno do erro para quem chamou a função
        throw err;
    }
    finally{
        // Fecha a conexão
        await close(conn);
    }
}

// Função para a verificação de exclusão de cursos 
export async function canRemoveCourse(id: number): Promise<boolean>{
    // Abrindo a conexão com o banco
    const conn = await open();
    try{
        // Query para obter a(s) disciplina(s) atrelada(s) ao curso
        const sql = 'SELECT id FROM SUBJECT WHERE id_course = :id';
        // Executando a query
        const result = await conn.execute(sql, [id]);
        // Se houver uma ou mais disciplinas relacionados a esse curso, retorna false, pois não será permitido excluí-lo
        if (result.rows && result.rows.length > 0) {
            return false;
        }
        // Retorna true se não houver nenhuma disciplina relacionado a ele, pois sua exclusão é permitida
        return true;
    }
    // Se der erro
    catch (err) {
        // Aviso de que ocorreu um erro
        console.log("Erro ao consultar disciplinas para excluir cursos: ", err);
        // Interrupção da função e retorno do erro para quem chamou a função
        throw err;
    }
    finally{
        // Fecha a conexão
        await close(conn);
    }
}

// Função para a verificação de exclusão de disicplinas 
export async function canRemoveSubject(id: number): Promise<boolean>{
    // Abrindo a conexão com o banco
    const conn = await open();
    try{
        // Variável de controle para a existência de turmas
        let existsClass = false;
        // Variável de controle para a existência de componentes
        let existsComponents = false;
        
        // Query para obter a(s) turma(s) atrelada(s) à disciplina
        let sql = 'SELECT id FROM CLASS WHERE id_subject = :id';
        // Executando a query
        let result = await conn.execute(sql, [id]);
        // Se houver uma ou mais turmas relacionadas a esse curso, retorna false, pois não será permitido excluí-la
        if (result.rows && result.rows.length > 0) {
            existsClass = true;
        }

        // Query para obter o(s) componentes(s) de nota atrelado(s) à disciplina
        sql = 'SELECT id FROM GRADE_COMPONENT WHERE id_subject = :id';
        // Executando a query
        result = await conn.execute(sql, [id]);
        // Se houver uma ou mais turmas relacionadas a esse curso, retorna false, pois não será permitido excluí-la
        if (result.rows && result.rows.length > 0) {
            existsComponents = true;
        }
        
        // Se existirem turmas ou componentes atrelados à disciplina, retorna false -> não é permitido excluí-la
        if(existsClass || existsComponents){
            return false;
        }
        // Retorna true se não houver nenhuma turma ou componente relacionada a ela, pois sua exclusão é permitida
        return true;
    }
    // Se der erro
    catch (err) {
        // Aviso de que ocorreu um erro
        console.log("Erro ao consultar turmas para excluir disciplinas: ", err);
        // Interrupção da função e retorno do erro para quem chamou a função
        throw err;
    }
    finally{
        // Fecha a conexão
        await close(conn);
    }
}

// Função para a verificação de exclusão de disicplinas 
export async function canRemoveClass(id: number): Promise<boolean>{
    // Abrindo a conexão com o banco
    const conn = await open();
    try{
        // Query para obter a(s) matrícula(s) atrelada(s) à turma
        const sql = 'SELECT id_student FROM REGISTRATION WHERE id_class = :id';
        // Executando a query
        const result = await conn.execute(sql, [id]);
        // Se houver uma ou mais matrículas relacionadas à essa turma, retorna false, pois não será permitido excluí-la
        if (result.rows && result.rows.length > 0) {
            return false;
        }
        // Retorna true se não houver nenhuma matrícula relacionada a ela, pois sua exclusão é permitida
        return true;
    }
    // Se der erro
    catch (err) {
        // Aviso de que ocorreu um erro
        console.log("Erro ao consultar turmas para excluir disciplinas: ", err);
        // Interrupção da função e retorno do erro para quem chamou a função
        throw err;
    }
    finally{
        // Fecha a conexão
        await close(conn);
    }
}