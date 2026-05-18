/* Autor: Beatriz Naomi Ferreira Sasaki  */

/* ============================================================= Importações de funções e módulos ================================================================= */

// Importa o módulo dotenv para carregar variáveis de ambiente
import dotenv from 'dotenv';
// Carrega as variáveis de ambiente do arquivo email.env
dotenv.config({ path: '../backend/email.env' }); 
// Importa funções de abertura e fechamento de conexão com o banco de dados
import {open, close} from "../config/db";
// Importa o módulo do OracleDB
import OracleDB from "oracledb";

/* ================================================================================================================================================================ */

/* =============================================================== Funções de cadastro de componente =============================================================== */

// Função para o cadastro de componentes de nota
export async function registerGradeComponent(name: string, code: string, description: string, weight: number, subjectId: number): Promise<number | null>{
    // Abre a conexão com o banco
    const conn = await open();

    // Define a variável para o ID de saída
    let newComponentId: number | null = null;

    try{
        // SQL modificado para retornar o ID gerado
        const sql = `INSERT INTO GRADE_COMPONENT
        (NAME, CODE, DESCRIPTION, WEIGHT, ID_SUBJECT)
        VALUES (:name, :code, :description, :weight, :subjectId)
        RETURNING ID INTO :newId`;

        // Executa a inserção no banco
        const result = await conn.execute(
            sql, {
                name,
                code,
                description,
                weight,
                subjectId,
                newId: { type: OracleDB.NUMBER, dir: OracleDB.BIND_OUT }
            }, // Combina binds de entrada e saída
            { autoCommit: true }
        );

        // Armazena id retornado pelo oracle
        const outBinds = result.outBinds as {newId?:number[]};

        // Pega o ID retornado
        if (outBinds && outBinds.newId) {
            newComponentId = outBinds.newId[0];
        }

        // Retorna o novo ID registrado
        return newComponentId;
    }
    // Em caso de erro durante a execução da consulta
    catch(error) {
        // Log do erro no console
        console.error("Erro ao cadastrar componente de nota: ", error); 
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

// Função para criar ou encontrar o componente de nota final
export async function findOrCreateFinalGradeComponent(subjectId: number): Promise<number | null> {
    // Abrindo a conexão com o banco de dados
    const conn = await open();

    // Define a sigla padrão dos componentes de nota
    const MF_CODE = 'MF';
    // Define o nome padrão dos componentes de nota
    const MF_NAME = 'Média Final';
    // Define a descrição padrão dos componentes de nota
    const MF_DESC = 'Média Final calculada pelo sistema.';
    // Define o peso padrão dos componentes de nota, que é 0 para não interferir nos cálculos
    const MF_WEIGHT = 0;

    try {
        // Faz a busca pelo componente de média final através da sigla fixa e do id da disciplina
        const result = await conn.execute(
            `SELECT ID FROM GRADE_COMPONENT 
             WHERE ID_SUBJECT = :subjectId AND CODE = :code`,
            { subjectId, code: MF_CODE }
        );
        // Verifica se a busca obteve resultados (se existe um componente MF para aquela disciplina)
        if (result.rows && result.rows.length > 0) {
            // Se encontrou, retorna o ID do componente
            const row = result.rows[0] as { ID: number };
            return row.ID;
        } else {
            // Se não encontrou, cadastra o componente no banco de dados
            // Mensagem de depuração
            console.log(`Componente '${MF_CODE}' não encontrado. Criando...`);
            // Chama a função de cadastro de componentes passando as informações padrões
            const newId = await registerGradeComponent(MF_NAME, MF_CODE, MF_DESC, MF_WEIGHT, subjectId);
            // Retorna o ID do novo componente  
            return newId; 
        }
    }
    // Se houver algum erro na execução, emite uma mensagem de erro e retorna null
    catch (err) {
        console.error("Erro ao procurar ou criar componente MF:", err);
        return null;
    }
    finally {
        // Fecha a conexão com o banco de dados
        await close(conn);
    }
}

/* ================================================================================================================================================================ */

/* ================================================================ Obtenção de informações dos componentes ======================================================= */

// Interface para representar um componente
export interface Component {
    id: number,
    code: string,
    weight: number
}
// Função para visualizar os componentes de nota de uma disciplina associada a uma turma
export async function viewComponents(classId: number): Promise <Component[] | null>{
    // Abre a conexão com o banco de dados
    const conn = await open();
    try {
        // Executa a consulta SQL para obter os componentes de nota
        const result = await conn.execute( 
            // Comando SQL para selecionar o ID, o nome e os pesos dos componentes de nota e ordená-los por ID, fixando A média final sempre por último
            // Ao ordenar, é feita uma verificação que define o componente cuja sigla é MF (o componente de média final) como 1 e o resto como 0, permitindo que ele sempre se fixe na última posição
            // A última ordenação é para ordenar aqueles com indicador repetido (0)
            `SELECT gc.id, gc.code, gc.weight
            FROM Grade_component gc
            JOIN Class c ON gc.id_subject = c.id_subject
            WHERE c.id = :classId
            ORDER BY CASE WHEN gc.CODE = 'MF' THEN 1 ELSE 0 END, gc.id`, 
            [classId]
        );
        // Verifica se há resultados na consulta
        if (result.rows && result.rows.length >0) {
            // Mapeia os resultados para a interface Component
            const verify: Component[] = result.rows.map((row: any) => ({
                    // Atribui o id do componente
                    id: row.ID,
                    // Atribui a sigla do componente
                    code: row.CODE,
                    // Atribui o peso do componente
                    weight: row.WEIGHT

            }));
            // Retorna o array de componentes
            return verify;
        } else {
            // Retorna null se não houver componentes encontrados
            return null;
        }
    // Em caso de erro durante a execução da consulta
    }catch(err) {
        // Log do erro no console
        console.log("Erro: ", err);
        throw err;
    } finally {
        // Fecha a conexão com o banco de dados
        await close(conn);
    }
}
/* ================================================================================================================================================================ */

