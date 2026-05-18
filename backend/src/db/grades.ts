/* Autor: Beatriz Naomi Ferreira Sasaki */

/* ============================================================= Importações de funções e módulos ================================================================= */

// Importa funções de abertura e fechamento de conexão com o banco de dados
import {open, close} from "../config/db";
// Importando funções necessárias para a atribuição de notas à média final
import { findOrCreateFinalGradeComponent, viewComponents } from "./gradeComponent";
import { viewStudents } from "./students";

// Interface para representar uma nota
export interface Grade {
    studentId: string;
    componentId: number;
    value: number;
}

/* ================================================================================================================================================================ */

/* ============================================================ Função de inserção/atualização de notas =========================================================== */

// Função para a atualização ou inserção de notas
export async function updateOrInsertGrade(grades: Grade[]): Promise<boolean>{
    // Abrindo a conexão com o banco de dados
    const conn = await open();
    try{
        // Inicia uma transação manual que não faz commit automaticamente, para evitar que uma query seja executada antes da outr e haja leitura fantasma de valores, atrapalhando a execução da operação
        await conn.execute("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE");

        // Percorrendo o array de notas para executar a operação de verificação e inserção ou atualização um por um
        for (const grade of grades) {

            // Se o valor recebido de uma das notas do array for nulo ou indefinido, emite uma mensagem de erro e cancela a operação da função, retornando false
            if(grade.value === null || grade.value === undefined){
                console.log('ERRO: Nota passada com valor nulo ou indeifnido. Cancelando operação...');
                return false;
            }
            
            // Verificação para identificar se a nota já foi lançada no sistema
            const checkResult = await conn.execute(
                `SELECT GRADE FROM GRADE 
                 WHERE ID_STUDENT = :studentId AND ID_GRADE_COMPONENT = :componentId`,
                { studentId: grade.studentId, componentId: grade.componentId }
            );

            // Se o select retornou resultados e a nota já existe no banco
            if (checkResult.rows && checkResult.rows.length > 0) {
                // Caso a nota exista, será feito um UPDATE nos valores no banco usando os valores trazidos na iteração atual do array de Grades
                await conn.execute(
                    `UPDATE GRADE SET GRADE = :gradeValue 
                     WHERE ID_STUDENT = :studentId AND ID_GRADE_COMPONENT = :componentId`,
                    {
                        gradeValue: grade.value,
                        studentId: grade.studentId,
                        componentId: grade.componentId
                    }
                );
            }
            // Se a nota não existe, faz um INSERT no banco usando os valores trazidos na iteração atual do array de Grades
            else {
                await conn.execute(
                    `INSERT INTO GRADE (ID_STUDENT, ID_GRADE_COMPONENT, GRADE)
                     VALUES (:studentId, :componentId, :gradeValue)`,
                    {
                        studentId: grade.studentId,
                        componentId: grade.componentId,
                        gradeValue: grade.value
                    }
                );
            }
        }
        // Após a transação de TODAS as operações, faz commit, assim evita que, caso uma operação não funcione, não faça um commit incompleto das alterações
        await conn.commit();
        // Retorna true se a operação for bem sucedida (se não estourar nenhum erro, chega nessa etapa do código e retorna true)
        return true;    
    }
    // Se houver algum erro 
    catch(err){
        // Log do erro no console
        console.log("Erro ao adicionar nota ", err);
        throw err;
    }
    finally{
        // Encerra a conexão com o banco de dados
        await close (conn);
    }
}

/* ================================================================================================================================================================ */

/* =========================================================== Função de obtenção de notas de uma turma =========================================================== */

// Função para obter todas as notas de uma determinada turma
export async function getGradesByClass(classId: number): Promise<Grade[]> {
    // Abrindo a conexão com o banco
    const conn = await open();
    try {
        // Busca os dados da nota através do id da turma, com base no id do aluno relacionado à sua matrícula
        const result = await conn.execute(
            `SELECT g.ID_STUDENT, g.ID_GRADE_COMPONENT, g.GRADE
             FROM GRADE g
             JOIN REGISTRATION r ON g.ID_STUDENT = r.ID_STUDENT
             WHERE r.ID_CLASS = :classId`,
            { classId }
        );
        // Se houver resultados registrados 
        if (result.rows && result.rows.length > 0) {
            // Usa o map para gerar um array de objetos com base nos dados retornados pela query
            const grades: Grade[] = result.rows.map((row: any) => ({
                studentId: row.ID_STUDENT,
                componentId: row.ID_GRADE_COMPONENT,
                value: row.GRADE
            }));
            // Retorna o Array definido
            return grades;
        }
        // Retorna array vazio se não houver notas
        return []; 
    }
    // Se houver algum erro durante a execução
    catch (err) {
        // Emite uma mensagem de erro
        console.error("Erro ao buscar notas:", err);
        throw err;
    }
    finally {
        // Fecha a conexão com o banco de dados
        await close(conn);
    }
}

/* ================================================================================================================================================================ */

/* =========================================================== Função de atribuição e cálculo de média final ====================================================== */

// Retorna um objeto com o estado e a mensagem referente ao erro
export async function calculateAndSaveFinalGrades(classId: number, subjectId: number): Promise<{ success: boolean; message: string; }> {
    
    // Verifica se existem componentes de nota cadastrados para além do componente de média final (que pode também não existir)
    const allComponents = await viewComponents(classId);
    // Se o array retornado pela função que devolve o array estruturado das informações dos componentes estiver vazio, retorna uma mensagem de erro
    if (!allComponents || allComponents.length === 0) {
        return { success: false, message: "Nenhum componente de nota cadastrado. Cadastre componentes antes de calcular a média." };
    }

    // Se existirem componentes, verifica a existência ou a criação bem sucedida do componente de nota final, que retorna seu ID
    const finalGradeComponentId = await findOrCreateFinalGradeComponent(subjectId);
    // Se o id retornado não estiver definido, retorna uma mensagem de erro
    if (!finalGradeComponentId) {
        return { success: false, message: "Erro ao criar o componente de Média Final." };
    }

    // Calculando a soma total dos pesos para o cálculo da média através de reduce
    // O método reduce faz a soma dos valores dos pesos do array percorrido, atribuindo seu valor ao acumulador s, inicializado com 0, que recebe a soma dos pesos
    const totalWeight = allComponents.reduce((sum, c) => sum + (c.weight || 0), 0);
    // Se a soma dos pesos for menor que 0, retorna uma mensagem de erro (precaução)
    if (totalWeight <= 0) {
        return { success: false, message: `A soma dos pesos dos componentes é ${totalWeight}. Deve ser maior que zero para calcular a média.` };
    }

    // Após validar as informações referentes aos componentes, faz uma busca aos alunos daquela turma
    const allStudents = await viewStudents(classId);
    // Se nenhum aluno for encontrado, emite outra mensagem de erro
    if (!allStudents || allStudents.length === 0) {
        return { success: false, message: "Nenhum aluno encontrado na turma." };
    }

    // Após validar a existência de alunos naquela turma, busca o array com todas as notas daquela turma
    const allGrades = await getGradesByClass(classId);

    // Cria um array para armazenar as novas notas finais que serão atribuídas
    const finalGradesToUpsert: Grade[] = [];

    // Percorre o array de alunos para atribuir as notas
    for (const student of allStudents) {
        // Inicializa o valor que receberá a soma das notas com 0 
        let weightedSum = 0;
        // Percorre o array de componentes de nota retornados para obter o peso de cada um e aplicar no cálculo
        for (const comp of allComponents) {
            // Busca o valor da nota que corresponde ao id do estudante atual e o id do componente atual na lista de notas
            const grade = allGrades.find(g => g.studentId === student.ra && g.componentId === comp.id);
            // Se o valor obtido estiver definido e não for nulo
            if (grade && grade.value !== null) {
                // Incrementa a soma da média final
                weightedSum += grade.value * comp.weight;
            }
            // Se a nota não existir ou for nula, ela não entra na soma (equivale a 0)
        }

        // Calcula a média final com base na soma das notas calculadas multiplicadas por seus pesos e na divisão pela soma de seus pesos (evita divisão por zero, embora já verificado)
        const finalGrade = (totalWeight > 0) ? (weightedSum / totalWeight) : 0;

        // Preenche o array das notas finais com um objeto com as informações necessárias e a nota final calculada
        finalGradesToUpsert.push({
            // Atribui ao id do aluno da nota o RA do aluno atual
            studentId: student.ra,
            // 
            componentId: finalGradeComponentId,
            // Atribui ao valor da nota a conversão do cálculo para float com duas casas decimais de precisão
            value: parseFloat(finalGrade.toFixed(2))
        });
    }

    // Após efetuar todos os cálculos, faz a inserção no banco de dados
    try {
        // Insere o array com as notas finais no banco através da função de inserção
        await updateOrInsertGrade(finalGradesToUpsert);
        // Retorna a mensagem de sucesso
        return { success: true, message: "Médias calculadas e salvas com sucesso!" };
    }
    // Se houver algum erro ao tentar salvar as médias, retorna uma mensagem de sucesso
    // Erro deve ser any para permitir a exibição da mensagem
    catch (error: any) {
        return { success: false, message: `Erro ao salvar médias no banco: ${error.message}` };
    }
}
