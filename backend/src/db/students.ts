/* Autor: Noemi Kayama */

/* =============================================== Importação de funções dos respectivos pacotes instalados ===================================================== */

// Importação do OracleDB 
import OracleDB from "oracledb";
// Importação das funcoes de abrir e fechar conexão com o banco
import {open, close} from "../config/db";
// Importação do multer para manipulação de arquivos
import multer from "multer";

// Interface para o relatório de importação
export interface ImportReport {
    // Total de linhas processadas
    lineTotal: number;
    // Total de inserções bem-sucedraas
    insertTotal: number;
}

/* ================================================================================================================================================================ */

// Função para verificar se um professor é o dono da turma - controle de acesso
export async function professorOwnsClass(professorId: number, classId: number): Promise<boolean> {
    // Abrindo a conexão com o banco
    const conn = await open();
    try {
        // Query para obter o ra do professor responsável por aquela turma
        const sql = `
        SELECT I.id_professor as "id"
        FROM
            Class Cl
        JOIN
            Subject S ON Cl.id_subject = S.id
        JOIN
            Course C ON S.id_course = C.id
        JOIN
            Institution I ON C.id_institution = I.id
        WHERE
            Cl.id = :classId
        `;
        // Executando a query
        const result = await conn.execute(
            sql, { classId: classId } // Passando objeto para o named bind
        );

        // Verificando se foi devolvrao um resultado
        if (result.rows && result.rows.length > 0) {
            // Obtém o ra do professor retornado
            const row = result.rows[0] as { id: number };

            // Se o ra retornado for igual ao ra do professor informado, retorna true
            if (row.id === professorId) {
                return true;
            }
            // Se os ras não forem correspondentes, retorna false
            else {
                return false;
            }
        }
        // Retorna false se a query não retornar resultados (precaução)
        console.log('A query não encontrou a turma ou o professor associado.');
        return false;
    }
    catch (err) {
        // Adicionando um log de erro para facilitar o debug futuro
        console.error('Erro ao verificar posse de turma:', err);
        return false;
    }
    finally {
        // Fecha a conexão
        await close(conn);
    }
}


// Interface para representar um estudante
export interface Student {
    ra: string;
    name: string;
}

// Função para processar a importação de um arquivo CSV contendo dados de estudantes
export async function process_csv_import(file: Express.Multer.File, page_class:number): Promise<ImportReport> {
   // Contador para o número de estudantes adicionados 
    let addedStudents = 0; 

    // Recebe o buffer binário do file e converte para string UTF-8
    const result = file.buffer.toString("utf-8");
    // Divrae o conteúdo do file em linhas
    const lines = result.split("\n");
    // Conta o total de linhas no file  
    const lineTotal = lines.length;
    // Verifica se o file está vazio
    if (lineTotal === 0) {
        // Lança um erro se o file estiver vazio
        throw new Error("CSV vazio ou sem dados.");
    }
    // Primeira coluna do arquivo
    const indexRa = 0; 
    // Segunda coluna do arquivo 
    const indexName = 1; 

    // Separa os títulos da primeira linha e os mapeia em um array
    const tableHeader = lines[0]!.split(",").map(h => h.trim());  
    // Se o array do cabeçalho for menor do que 2, ou seja, possui menos que duas colunas, ele emite um erro com um aviso  
    if (tableHeader.length < 2) {
        throw new Error("O arquivo CSV deve conter pelo menos duas colunas de dados.");
    }
    // Abre uma conexão com o banco de dados
    const conn = await open();
    
    try {
        // Leitura do arquivo linha por linha, começando da segunda linha (índice 1)
        for (let i = 1; i < lines.length; i++) {
            // Variável que pega a linha atual
            const currentLine = lines[i];
            // Pula linhas vazias
            if (!currentLine?.trim()) continue; 
            // Divide a linha atual em valores separados por vírgula
            const values = currentLine.split(",");
           // Extrai e limpa os valores de nome e ra 
            const name = values[indexName].trim();
            const ra = values[indexRa].trim();
            // Verifica se ambos os valores de nome e ra estão presentes
            if (name && ra) {
                try {   
                    const verify = await registrationStudentVerification(ra, page_class)
                    if(!verify){
                        // Insere o estudante no banco de dados
                        await conn.execute(
                            `INSERT INTO STUDENT (id, NAME) VALUES (:ra, :name)`, 
                            { ra, name }
                        );
                        // Registra o estudante na turma especificada
                        await conn.execute(
                            `INSERT INTO REGISTRATION (ID_CLASS, ID_STUDENT) VALUES (:page_class, :ra)`,
                            [page_class, ra]
                        );
                        // Incrementa o contador de estudantes adicionados
                            addedStudents += 1; 
                    }
                    else {
                        console.log(`Deu ruim`);
                        await conn.execute(
                            `INSERT INTO REGISTRATION (ID_CLASS, ID_STUDENT) VALUES (:page_class, :ra)`,
                            [page_class, ra]
                        );
                    }
                // Em caso de erro ao inserir no banco de dados
                } catch (dbError: any) { 
                    // Log do erro detalhado no console
                    console.error(`Erro no banco de dados ao inserir RA ${ra} (Linha ${i + 1}).`, dbError);
                    // Desfaz todas as operações realizadas na transação atual
                    await conn.rollback(); 
                    // Extrai a mensagem de erro do banco de dados
                    const dbErrorMessage = dbError.message || "Erro desconhecrao no DB";
                    // 
                    throw new Error(`Erro na linha ${i + 1} (RA: ${ra}). Erro no Oracle: ${dbErrorMessage}`); 
                }
            // Se os dados estiverem incompletos ou vazios
            } else {
                // Mensagem de erro detalhada
                const erroMsg = `Dados incompletos ou vazios na linha ${i + 1} (RA: ${ra}, Nome: ${name}). Cancelando a importação.`;
                // Log do erro no console
                console.error(`Erro na confirmação de dados: ${erroMsg}`);
                // Desfaz todas as operações
                await conn.rollback(); 
                // Lança o erro com a mensagem detalhada
                throw new Error(erroMsg);
            }
        }
        // Confirma todas as operações realizadas na transação
        await conn.commit(); 
    // Em caso de erro geral durante o processamento
    } catch (error) {
        //  sinaliza que ocorreu uma condição de erro
        throw error;
    
    } finally {
        // Fecha a conexão com o banco de dados
        await close(conn);
    }
    // Retorna o relatório de importação com o total de linhas processadas e o total de inserções bem-sucedraas
    return {
        lineTotal: lineTotal - 1, 
        insertTotal: addedStudents,
    };
}

/* =========================================================================================================================================================== */

/* =================================== Manipulação do banco de dados para ver se um aluno existe em alguma turma ============================================= */

// Função para verificar se um estudante está registrado em uma turma específica
export async function registrationStudentVerification(ra: string, page_class: number): Promise<Class | null> {
    // Abre uma conexão com o banco de dados
    const conn = await open();
    // Tenta executar a consulta de verificação
    try {
        // Executa a consulta para verificar se o estudante está registrado na turma
        const result = await conn.execute(
                `SELECT r.ID_CLASS
                FROM REGISTRATION r
                JOIN Student s ON r.ID_STUDENT = s.id
                WHERE S.id = :ra
                AND r.ID_CLASS = :class`,
                {ra: ra, 
                 class: page_class}
            );
            // Log de verificação no console
            console.log("Verificando se o aluno existe em alguma turma...");
        // Verifica se há resultados retornados
        if (result.rows && result.rows.length > 0) {
            // Mapeia os resultados para o formato da interface Class
            const registration: Class[] = result.rows.map((row: any) => ({
                    id_class: row.ID_CLASS  
                }));
            // Retorna o primeiro registro encontrado
            return registration[0];
        // Se não houver resultados, retorna null
        } else {
            return null;
        }
    // Em caso de erro durante a consulta
    } catch(err) {
        // Log de erro no console
        console.error(`Erro: `, err);
        // Lança o erro para ser tratado em outro lugar
        throw err;
    } finally {
        // Fecha a conexão com o banco de dados
        await close(conn);
    }
}

/* =============================================================================================================================================================== */

/* ============================================== Manipulação do banco de dadospara adicionar/atualizar aluno ==================================================== */

// Função para atualizar estudantes no banco de dados
export async function updateStudents(ra: string, name: string, page_class: number): Promise <void> {
    // Abre uma conexão com o banco de dados
    const conn = await open();
    // Tenta executar as operações de atualização/inserção
    try {
        // Verifica se o estudante já está registrado na turma especificada
        const student_class = await registrationStudentVerification(ra, page_class);

        // Se o estudante NÃO estiver registrado na turma, tentamos inserir o aluno e registrá-lo na turma.
        if (!student_class) {

            // Tenta inserir o aluno na tabela STUDENT (Se ele já existir, esta operação falhará devido à PK)
            try {
                await conn.execute(
                    `INSERT INTO STUDENT (ID, NAME) VALUES (:ra, :name)`,
                    { ra: ra, name: name },
                    { autoCommit: false } // Mantém a transação aberta
                );
            } catch (err: any) {
                // Se a chave primária for duplicada, emite um erro
                if (err.errorNum !== 1) { 
                    throw err; // Lança qualquer outro erro que não seja de chave duplicada
                }
                console.log(`Aluno RA ${ra} já existe na tabela STUDENT. Continuando para REGISTRATION.`);
            }

            // Registra o estudante na turma especificada
            await conn.execute(
                `INSERT INTO REGISTRATION (ID_CLASS, ID_STUDENT) VALUES (:page_class, :ra)`,
                { page_class: page_class, ra: ra }
            );

            console.log(`Aluno ${name} (RA: ${ra}) registrado na turma ${page_class}.`);
            await conn.commit();
        // Se o estudante JÁ estiver registrado na turma (e, portanto, ele já existe na STUDENT)
        } else {
            // Log de que o estudante já está cadastrado
            console.log(`Aluno RA ${ra} já cadastrado na turma ${page_class}. Atualizando nome para ${name}.`);

            // Atualiza o nome do estudante no banco de dados (na tabela STUDENT)
            await conn.execute(
                `UPDATE STUDENT SET NAME = :name WHERE ID = :ra`, // Assumindo que a coluna na STUDENT é 'ID'
                { ra: ra, name: name }
            );
            
            await conn.commit();
        }
    }
    catch(err) {
        // Log de erro no console
        console.error("Erro ao registrar/atualizar no banco de dados: ", err);
        // Em caso de erro, desfazemos quaisquer alterações pendentes
        await conn.rollback(); 
        // Lança o erro para ser tratado em outro lugar
        throw err;
    } finally {
        // Fecha a conexão com o banco de dados
        if (conn) {
            await close(conn);
        }
    }
}
/* ============================================================================================================================================================== */

/* ==================================== Manipulação do banco de dados para visualizar todos os alunos de uma turma ============================================== */

// Interface para representar estudantes
export interface Students {
    ra: string,
    name: string
}
// Função para visualizar estudantes no banco de dados
export async function viewStudents(page_class: number): Promise<Students[] | null> {
    // Abre uma conexão com o banco de dados
    const conn = await open();
    try {
            // Executa a consulta para selecionar os estudantes ordenados por nome
            const result = await conn.execute(
                `SELECT S.id AS ra, S.name AS NAME FROM REGISTRATION R
                JOIN STUDENT S ON R.ID_STUDENT = S.id
                WHERE R.ID_CLASS = :class
                ORDER BY S.name`,
                {class: page_class}
            );
            // Verifica se há resultados retornados
            if (result.rows && result.rows.length > 0) {
                // Mapeia os resultados para o formato da interface Students
                const students: Students[] = result.rows.map((row: any) => ({
                    ra: row.RA,     
                    name: row.NAME  
                }));
                // Retorna o array de estudantes
                return students;
            // Se não houver resultados, retorna um array vazio
            } else {
                return []; 
            }
            
    } 
    // Em caso de erro durante a execução da consulta
    catch(error) {
        // Log do erro no console
        console.error("Erro ao buscar notas da turma:", error); 
        // Retorna null em caso de erro
        return null; 
    }
    finally {
        // Fecha a conexão com o banco de dados
        if (conn) {
            await close(conn);
        }
    }
}
/* ============================================================================================================================================================== */

/* ========================================= Manipulação do banco de dados para deletar aluno(s) de uma turma =================================================== */

// Função para deletar um estudante do banco de dados
export async function deleteStudent(ra: string[], page_class: number) :Promise<void> {
    let i: number;
    // Abre uma conexão com o banco de dados
    const conn = await open();
    
    // Tenta executar a operação de deletar
    try {
        // Inicia uma transação manual que não faz commit automaticamente, para evitar que uma query seja executada antes da outr e haja leitura fantasma de valores, atrapalhando a execução da operação
        await conn.execute("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE");
        
        // Looping para a exclusão de mais de um aluno (se for o caso)
        for (i = 0; i < ra.length; i++){    
            // Deleta o estudante da tabela REGISTRATION
            await conn.execute(
                `DELETE FROM REGISTRATION WHERE ID_STUDENT = :ra AND ID_CLASS = :class`,
                {ra: ra[i], class: page_class}
            );
        }

        // Após a transação de TODAS as operações, faz commit, assim evita que, caso uma operação não funcione, não faça um commit incompleto das alterações
        await conn.commit();   
    }
    // Em caso de erro durante a operação de deletar
    catch(err) {
        // Log de erro no console
        console.error("Erro ao buscar notas da turma:", err); 
        throw err;
    }
}
/* ============================================================================================================================================================== */

/* ================================================================= Apagar aluno(s) ============================================================================ */

// Interface para representar uma turma
export interface Class {
    id_class: number
}

// Interface com as informações da turma necessárias para a composição do nome do arquivo de exportação
export interface ClassInfo {
    // Nome da turma
    className: string;
    // Sigla da disciplina
    subjectCode: string;
}    

// Função de obtenção do nome da turma e da sigla da disciplina com base no ID da turma
export async function getClassInfo(classId: number): Promise<ClassInfo[] | null> {
    // Abrindo a conexão com o banco de dados
    const conn = await open();
    try{
        // Executando a query que retorna os valores desejados (nome da turma e sigla da disciplina)
        const result = await conn.execute(
            `SELECT 
                C.NAME AS "className", 
                S.CODE AS "subjectCode"
            FROM 
                CLASS C
            JOIN 
                SUBJECT S ON C.ID_SUBJECT = S.ID
            WHERE 
                C.ID = :classId`,
            [classId]
        );
  
        // A query retornou informações, ou seja, conseguiu obter o nome e a sigla
        if (result.rows && result.rows.length > 0) {
            // Mapeia os resultados para o formato da interface ClassInfo
                const classInfo: ClassInfo[] = result.rows.map((row: any) => ({
                    className: row.className,     
                    subjectCode: row.subjectCode  
                }));
                // Retorna o array de estudantes
                return classInfo;
        }
        // Se ele não conseguiu obter nunhuma informação da query, retorna um array vazio
        return null;
    }
    // Se houver algum erro durante a execução, exibe uma mensagem e dispara um erro
    catch(err){
        console.error("Erro ao buscar informações da turma:", err);
        throw err;
    }finally{
        // Após as operações, fecha a conexão
        await close(conn);
    }
}

/* ============================================================================================================================================================== */
