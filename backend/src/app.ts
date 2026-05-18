/* Autor: Beatriz Naomi Ferreira Sasaki */

/* =============================================================== Importação de pacotes e funções ================================================================ */
// Importando o dotenv para carregar as variáveis de ambiente do arquivo .env
import dotenv from 'dotenv';
// Configurando o dotenv para usar o arquivo de variáveis de ambiente específico
dotenv.config({ path: '../backend/email.env' });
// Importando o express para criar o servidor web
import express, {Request, Response} from "express";
// Adicionando o CORS
import cors from "cors";
// Adicionando o bodyParser para converter o corpo das requisições
import bodyParser from "body-parser";
// Adicionando o JWT para manipulação de tokens
import jwt from 'jsonwebtoken';
// Import do middleware de autenticação
import { verifyToken, AuthenticatedRequest } from './middlewares/authMiddleware';
// Import das funções da manipulação do banco de dados
import {
    getProfessorById,
    getProfessorByEmail,
    getProfessorByPhone,
    getProfessorByEmailAndPassword,
    addProfessor,
    sendEmailLink,
    updatePassword,
    getPersonByEmail
} from "./db/registration";
// Importação das funções de gerenciamento
import { addClass, addCourse, addInstitution, addSubject, canRemoveClass, canRemoveCourse, canRemoveInstitution, canRemoveSubject, getInstituitionByProfessor, getProfessorHierarchy, removeClass, removeCourse, removeInstitution, removeSubject } from './db/managment';
// Importação do Multer (middleware) que faz principalmente o upload de arquivos
import multer from 'multer'; 
// Importação das funções de alunos
import { process_csv_import, professorOwnsClass, viewStudents, updateStudents,  getClassInfo, deleteStudent} from './db/students';
// Importação das funções de componente de nota
import { registerGradeComponent, viewComponents } from './db/gradeComponent';
import {calculateAndSaveFinalGrades, getGradesByClass, updateOrInsertGrade} from './db/grades';
/* ================================================================================================================================================================ */


/* =================================================================== Configuração do servidor =================================================================== */
// Criando uma instância do express
const app = express();
// Habilitando o CORS para todas as rotas
app.use(cors());
// Configurando o bodyParser para interpretar requisições JSON
app.use(bodyParser.json());
// Definindo o token secreto para JWT
const JWT_SECRET = 'qwertuioplkjhgfdsa'
// Definindo a porta do servidor (diferente para cada membro do grupo)
const port = 3030; // 3030 - Noemi | 3000 - Outros
/* ================================================================================================================================================================ */


/* ======================================================================= Criação de rotas ======================================================================= */

/* ======================================================================== Rotas de teste ======================================================================== */

// Rota para testar se o servidor está funcionando (rota default) -> Testes
app.get('/', (req: Request, res: Response) => {
    // Envia uma resposta simples para indicar que o servidor está rodando
    res.send('Servidor rodando com Express e TypeScript!');
});

// Rota para obter os dados professor através de seu ID na rota
app.get('/professor/:id', async ( req: Request, res: Response ) => {
    // Informa que o servidor entrou corretamente na rota
    console.log("Requisição recebida para buscar professor por ID");
    try {
        // Obtém o ID do professor a partir do parâmetro id da requisição
        const id = Number(req.params.id);
        // Chama a função para obter os dados do professor pelo ID
        const professor = await getProfessorById(id);
        // Se o professor for encontrado, retorna os dados em formato JSON
        if(professor) {
            res.json(professor);
        // Caso o professor não seja encontrado, retorna uma mensagem de que ele não foi encontrado
        } else {
            res.json({message: "Professor nao encontrado"});
        } 
    // Em caso de erro na busca
    } catch(error) {
    // Imprime o erro no console
    console.error(error);
    // Retorna uma resposta de erro ao cliente
    res.status(500).json({error: "Erro ao buscar professor"});
    }               
});

/* ================================================================================================================================================================ */

/* ====================================================================== Rotas de autenticação =================================================================== */

// Rota para buscar professor por e-mail
app.post('/professor-email', async (req: Request, res: Response) => {
    // Informa que o servidor entrou corretamente na rota
    console.log('Requisição recebida para buscar professor por email');
    // Tenta executar o código
    try {
        // Constante que armazena o e-mail enviado no body da requisição
        const email = String(req.body.email);
        // Chama a função para obter os dados do professor pelo e-mail
        const professor = await getProfessorByEmail(email);
        // Se o professor for encontrado (não for nulo)
        if(professor) {
            // Retorna o id do professor encontrado
            return res.json({idProfessor: professor.id});
        // Caso o professor não seja encontrado
        } else {
            // Retorna id=0, indicando que não foi encontrado
            return res.json({idProfessor: 0});
        }
    // No caso de erro na busca
    } catch(error){
        // Imprime o erro no console
        console.error(error);
        // Retorna uma resposta de erro ao cliente
        res.status(500).json({error: "Erro ao buscar professor por email"});
    }
});

// Rota para buscar professor por celular
app.post('/professor-phone', async (req: Request, res: Response) => {
    // Informa que o servidor entrou corretamente na rota
    console.log('Requisição recebida para buscar professor por celular');
    // Tenta executar o código
    try {
        // Constante que armazena o celular enviado no body da requisição
        const phone = String(req.body.cell_number);
        // Chama a função para obter os dados do professor pelo celular
        const professor = await getProfessorByPhone(phone);
        // Se o professor for encontrado (não for nulo)
        if(professor) {
            // Retorna o id do professor encontrado
            return res.json({idProfessor: professor.id});
        } else {
            // Retorna id=0, indicando que não foi encontrado
            return res.json({idProfessor: 0});
        }
    // No caso de erro na busca
    } catch(error){
        // Imprime o erro no console
        console.error(error);
        // Retorna uma resposta de erro ao cliente
        return res.status(500).json({error: "Erro ao buscar professor por celular"});
    }
});

// Rota para buscar professor por email e senha -> Login
app.post('/login', async (req: Request, res: Response) => {
    // Informa que o servidor entrou corretamente na rota
    console.log("Requisição recebida para login do professor");
    // Tenta executar o código
    try{
        // Variável para armazenar o email enviado no body da requisição
        const email = String(req.body.email);
        // Variável para armazenar a senha enviada no body da requisição
        const password = String(req.body.password);
        console.log("Aguardando autenticação...");
        // Realizando a busca da conta do Professor
        const professor = await getProfessorByEmailAndPassword(email, password);
        console.log("Autenticação realizada.");
        // Se o professor for encontrado (não for nulo)
        if(professor){
            // Cria o payload com as informações do professor essenciais para o token
            const payload = {
                userId: professor.id.toString(),
                email: professor.email
            }
            console.log('Criou o payload do token...');
            // Gera o token JWT com o payload e o segredo
            const token = jwt.sign(
                payload,
                JWT_SECRET,
                { expiresIn: '2h' } // Token válido por 2 horas
            );
            console.log('Gerando token JWT...');
            // Retorna o token gerado em formato JSON
            return res.json({ 
                token: token 
            });
        // Caso o professor não seja encontrado
        } else {
            console.log("Professor nao encontrado.");
            // Retorna id=0, indicando que não foi encontrado
            return res.status(401).json({message: "Email ou senha incorretos"});
        }
    // Em caso de erro na realização do login
    } catch(error){
        // Caso erro na realização do login, será enviado um alerta de erro
        console.error(error);
        // Retorna uma resposta de erro ao cliente
        return res.status(500).json({error: "Erro ao realizar login"});
    }
});

//Rota para cadastro de um docente
app.post('/register-professor', async (req:Request, res:Response)=>{
    // Informa que o servidor entrou corretamente na rota
    console.log('Entrou na rota de cadastro de docente');
    // Tenta executar o código
    try{
        // Armazena os dados da requisição
        const{name, email, cell_number, password}=req.body;
        // Caso os campos venham nulos, retorna alerta de erro
        if(!name || !email || !password || !cell_number){
            return res.status(400).json({error:"Campos Obrigatórios"});
        }
        // Inserindo dados recebidos no banco 
        const id = await addProfessor(name, email, cell_number, password);
        // Se o id for criado - cadastro bem sucedido
        if(id){
            // Cria o payload com as informações do professor essenciais para o token
            const payload = {
                userId: id.toString(),
                email: email
            }
            console.log('Criou o payload do token...');
            // Gera o token JWT com o payload e o segredo
            const token = jwt.sign(
                payload,
                JWT_SECRET,
                { expiresIn: '2h' } // Token válido por 2 horas
            );
            console.log('Gerando token JWT...');
            // Retorna o token gerado em formato JSON
            return res.json({ 
                token: token 
            });
        }
    // Em caso de erro na inserção
    }catch(error){
        // Caso erro na inserção, será enviado um alerta de erro
        console.error(error);
        // Retorna uma resposta de erro ao cliente
        return res.status(500).json({error: "Erro ao cadastrar professor"});
    }
});

// Rota para envio do link de redefinição de senha
app.post('/conf-link', async (req: Request, res: Response) => {
    // Informa que o servidor entrou corretamente na rota
    console.log('Entrou na rota de envio do link de redefinição de senha');
    // Tenta executar o código
    try { 
        // Constante que armazena o email passado pelo body da requisição
        const email = String(req.body.email);
        // Chama a função de verificação de existência do professor por email e guarda seu resultado numa variável
        const professor = await getPersonByEmail(email);
        // Se o professor for encontrado
        if (professor) {
            // Informa que o usuário foi encontrado
            console.log('Usuário encontrado:');
            // Chama a função para envio do email com o link de redefinição de senha
            const passLink = await sendEmailLink(email);
            // Verifica se o envio do email foi bem-sucedido
            if (passLink === 0) {
                // Retorna em json o id do professor (professor) se o e-mail foi enviado com sucesso
                return res.json({id: professor.id});
            } else {
                // Retorna em json o id=0, indicando que não foi enviado o email
                return res.json({ id: 0});
            }
        }
        // Caso o professor não for encontrado (nulo)
        else {
            // Informa que o usuário não foi encontrado
            console.log('Usuário não encontrado');
            // Retorna em json o id=0, indicando que não foi encontrado
            return res.json({ id: 0});
        }
    // Em caso de erro no procedimento
    } catch (error) {
        // Caso der erro no procedimento, é enviado uma mensagem de erro
        console.error(error);
        // Retorna uma resposta de erro ao cliente
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }

});

// Rota para redefinição de senha
app.post('/new-password', async (req: Request, res: Response) => {
    // Informa que o servidor entrou corretamente na rota
    console.log('Entrou na rota de envio do link de redefinição de senha');
    // Tenta executar o código
    try {
        // Constante que armazena a senha passada pelo body da requisição
        const newPassword = String(req.body.password);
        // Constante que armazena o email passado pelo body da requisição
        const email = String(req.body.email);
        // Chama a função de verifição de existência do professor por email e guarda seu resultado numa variável
        const professorEmail = await getProfessorByEmail(email);
        // Chama a função de atualização da senha e guarda seu resultado numa variável
        const professorPass = await updatePassword(newPassword, email);
        // Condição para verificação se as duas variáveis não são nulas
        if(professorEmail && professorPass) {
            // Alerta de sucesso
            console.log(`Atualizando senha para o email: ${professorPass.email}`);
            // Retorna em json o id do professor
            return res.json({ id: professorPass.id});   
        } else {
            // Caso não for achado a existencia do professor no Banco de Dados, é retornado o id 0 que não pertence a ninguém
            return res.json({ id: 0});
        }
    } catch (error) {
        // Caso der erro no procedimento, é enviado uma mensagem de erro
        console.error(error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

/* ================================================================================================================================================================ */

/* ========================================================== Rotas de gerenciamento de dados do docente ========================================================== */

// Rota para obter os dados de instituições, disciplinas, cursos e turmas de um professor a partir do ID
app.get('/professor-hierarchy', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
    // Obtendo o id do docente contido no token de autenticação
    const professorId = req.userId as string;
    try {
        // Obtendo o array com os resultados da query
        const flatResults = await getProfessorHierarchy(professorId);
        // Estruturando o array em um JSON estruturado para possibilitar a exibição correta dos dados no frontend
        const hierarchy = structureDataAsTree(flatResults);
        // Retornando os dados estruturados para o frontend
        res.json(hierarchy);
    } catch (error) {
        console.error(`Erro ao buscar hierarquia do professor:${error}`);
        return res.status(500).json({ error: 'Erro ao buscar dados da hierarquia.' });
    }
});

// Função para converter o array de dados obtidos pela função getProfessorHierarchy em um JSON estruturado que facilita a exibição e o carregamento de informação no frontend
function structureDataAsTree(rows: any[]) {
    // Delcarando o Mapa de valores principal, que armazenará todas as instituições encontradas e separará seus dados usando como chave (key) o Id da instituição e como valor associado a ela, o objeto da instituição { id, name, courses: (outro Map) }
    const institutions = new Map();

    // Percorrendo cada linha retornada do banco de daods
    for (const row of rows) {

        // Nível 1: Instituição (Institution)
        // Verifica se o map criado não possui essa institução em seus registros e se o id atual está definido, para que possa continuar a preencher o objeto
        if (!institutions.has(row.institution_id) && row.institution_id) {
            // Se a verificação foi bem sucedida, criamos um conjunto de dados para o nosso mapa, definindo o id da instituição da iteração atual como a chave e criando um objeto com os dados relacionados a ela (id, nome e um Map de cursos)
            institutions.set(
                // Chave do item
                row.institution_id, {
                // Atributo id da instituição
                id: row.institution_id,
                // Atributo nome da instituição
                name: row.institution_name,
                // Declarando um novo Map para armazenar os dados estruturados dos cursos
                courses: new Map() 
            });
        }

        // Criamos uma referência para a instituição atual declarada
        const currentInstitution = institutions.get(row.institution_id);
        
        // Nível 2: Cursos (Courses)
        // Repetindo o modelo da verificação, agora para cursos
        // Se a instituição atual estiver definida, possuir cursos e estes estiverem definidos, cadastra um novo objeto de curso associado ao Map de cursos da instituição atual com suas respectivas informações e o Map para suas disciplinas
        if (currentInstitution && !currentInstitution.courses.has(row.course_id) && row.course_id) { 
            // Se a verificação foi bem sucedida, criamos um conjunto de dados para o nosso mapa, definindo o id do curso da iteração atual como a chave e criando um objeto com os dados relacionados a ele (id, nome e um Map de disciplinas)
            currentInstitution.courses.set(
                // Chave do item
                row.course_id, { 
                // Atributo id do curso
                id: row.course_id,
                // Atributo nome do curso
                name: row.course_name,
                // Criando o novo Map para as disciplinas associadas a esse curso
                subjects: new Map()
            });
        }

        // Criamos uma referência para o curso atual declarado, que pode ser nulo caso nenhum curso tenha sido criado
        const currentCourse = currentInstitution?.courses.get(row.course_id); 

        // Nível 3: Disciplina (Subject)
        // Repetindo o modelo da verificação, agora para disciplinas
        // Se o curso atual estiver definido, possuir disciplinas e estes estiverem definidos, cadastra um novo objeto de disicplina associado ao Map de disciplinas do curso atual com suas respectivas informações e o Map para suas turmas
        if (currentCourse && !currentCourse.subjects.has(row.subject_id) && row.subject_id) { 
            // Se a verificação foi bem sucedida, criamos um conjunto de dados para o nosso mapa, definindo o id da disciplina da iteração atual como a chave e criando um objeto com os dados relacionados a ela (id, nome e um Map de turmas)
            currentCourse.subjects.set(
                // Chave do item
                row.subject_id, { 
                // Atributo id da disciplina
                id: row.subject_id,
                // Atributo nome da disciplina
                name: row.subject_name,
                // Criando o novo Map para as turmas associadas a essa disciplina
                classes: new Map()
            });
        }
        
        // Criamos uma referência para a disciplina atual declarada, que pode ser nula caso nenhuma disciplina tenha sido criada
        const currentSubject = currentCourse?.subjects.get(row.subject_id); 
        
        // Nível 4: Turma (Class)
        // Repetindo o modelo da verificação, agora para turmas
        // Se a disciplina atual estiver definida, possuir turmas e estas estiverem definidas, cadastra um novo objeto de turma associada ao Map de disciplinas da disciplina atual com suas respectivas informações, mas sem um Map, já que não possui dados de itens associados a elas
        if (currentSubject && !currentSubject.classes.has(row.class_id) && row.class_id) { 
            // Se a verificação foi bem sucedida, criamos um conjunto de dados para o nosso mapa, definindo o id da turma da iteração atual como a chave e criando um objeto com os dados relacionados a ela (id e nome)
            currentSubject.classes.set(
                // Chave do item
                row.class_id, { 
                // Atributo id da turma
                id: row.class_id,
                // Atributo nome da turma
                name: row.class_name 
            });
        }
    }
    // Iniciando a conversão dos objetos estruturados para Arrays de objetos, que são mais facilmente lidos pelo front
    // Declarando a variável que receberá a estrutura completa convertida para um Array de objetos estruturado
    // Usamos o 'institutions.values()' usará os dados apenas dos objetos de instituição e ignora as chaves/IDs do map
    // E usamos 'Array.from(...)' para transformar o resultado obtido do institution.values() em um array. Ex.: [ { inst 1 }, { inst 2 }, ... ]

    // Nível 1 (Instituições estruturadas)
    const finalHierarchy = Array.from(institutions.values()).map((inst: any) => {
        
        // Nível 2 (Cursos estruturados)
        const coursesArray = Array.from(inst.courses.values()).map((course: any) => {

            // Nível 3 (Disciplinas estruturadas)
            const subjectsArray = Array.from(course.subjects.values()).map((subject: any) => {

                // Nível 4 (Turmas) -> Como turmas não possui dados associados, obtemos apenas seu Array
                const classesArray = Array.from(subject.classes.values());
                
                // Início da cascata de retornos para finalizar cada iteração

                // Retornando o objeto reestruturado de Disciplina
                return {
                    id: subject.id,
                    name: subject.name,
                    classes: classesArray
                };
            });
            
            // Retornando o objeto reestruturado de Curso
            return {
                id: course.id,
                name: course.name,
                subjects: subjectsArray 
            };
        });
        
        // Retornando o objeto reestruturado de Instituição
        return {
            id: inst.id,
            name: inst.name,
            courses: coursesArray
        };
    });

    // Após reestruturar todos os objetos, retorna o objeto final e encerra a função
    return finalHierarchy;
}

/* ================================================================================================================================================================ */

/* ====================================================== Rotas para a criação de dados atrelados ao docente ====================================================== */

// Rota para verificar se o docente possui instituções cadastradas atreladas a ele (primeiro acesso à plataforma)
app.get('/first-access', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
    // Obtém o id do docente salvo no token de verificação
    const professorId = req.userId as string;
    // Exibe uma mensagem para a depuração
    console. log(`Entrou na rota de primeiro acesso para o docente com o id ${professorId}`);
    try{
        // Obtém o resultado da busca de pelo menos uma instituição relacionada ao docente
        const existsInstitution = await getInstituitionByProfessor(professorId);
        // Verifica se o retorno é diferente de null
        if (existsInstitution !== null){
            // Se existir alguma instituição, quer dizer que esse não é o primeiro acesso -> retorna false para firstAccess
            res.status(200).json({firstAccess: false});
        }
        else{
            // Se não existir nenhuma instituição, quer dizer que esse é o primeiro acesso -> retorna true para firstAccess
            res.status(200).json({firstAccess: true});
        }
    } catch(error){
        // Emite uma mensagem de erro e retorna o erro para o cliente
        console.error("Erro ao verificar o primeiro acesso do usuário:", error);
        return res.status(500).json({ error: 'Erro ao verificar o primeiro acesso do usuário.' });
    }
});

// Rota para cadastrar a primeira instituição e o primeiro curso do docente
app.post('/register-first-access', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
    // Obtém o id do docente salvo no token de verificação
    const professorId = req.userId as string;
    // Exibe uma mensagem para a depuração
    console. log(`Entrou na rota de primeiro acesso para o docente com o id ${professorId}`);
    try{
        // Armazena os dados da requisição
        const {nameInst, nameCourse} = req.body;
        // Caso os campos venham nulos, retorna alerta de erro
        if(!nameInst || !nameCourse){
            return res.status(400).json({error:"Campos Obrigatórios"});
        }
        // Inserindo os dados da instituição recebidos no banco
        const registredInstId = await addInstitution(nameInst, Number(professorId));
        if(registredInstId){
            console.log('Instituição cadastrada...');
            // Inserindo os dados do curso recebidos no banco
            const registredCourse = await addCourse(nameCourse, Number(registredInstId));
            console.log('Curso cadastrado...');
            // Se ambas as operações estiverem definidas -> cadastro bem sucedido
            if((registredInstId && registredCourse) && registredCourse === true){
                // Retorna um indicativo de sucesso
                return res.status(200).json({success: true});
            }
            // Se pelo menos uma verificação falhar...
            else{
                // Retorna um indicativo de falha
                return res.status(500).json({success: false});
            }
        }
    }
    catch(error){
        // Emite uma mensagem de erro e retorna o erro para o cliente
        console.error("Erro ao cadastrar instituição:", error);
        return res.status(500).json({ error: 'Erro ao cadastrar instituição.' });
    }
});

// Rota para cadastrar uma nova Instituição
app.post('/register-institution', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
    // Obtém o id do docente salvo no token de verificação
    const professorId = req.userId as string;
    // Exibe uma mensagem para a depuração
    console. log(`Entrou na rota de cadastro de instituição para o docente com o id ${professorId}`);
    try{
        // Obtém o nome da instituição do corpo da requisição
        const {name} = req.body;
        // Se o nome não estiver definido
        if (!name) {
            // Retorna uma mensagem de erro
            return res.status(400).json({ error: "Os campos são obrigatórios." });
        }
        // Registra a nova instituição e obtém o id retornado
        const newId = await addInstitution(name, Number(professorId));
        // Retorna um indicativo de sucesso e o id obtido, caso o cadastro tenha sido bem sucedido
        res.status(200).json({ success: true, id: newId });
    }
    catch(error){
        // Emite uma mensagem de erro e retorna o erro para o cliente
        console.error("Erro ao cadastrar instituição:", error);
        return res.status(500).json({ error: 'Erro ao cadastrar instituição.' });
    }
});

// Rota para cadastrar um novo Curso
app.post('/register-course', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
    // Obtém o id do docente salvo no token de verificação - apenas para depuração, nesse caso
    const professorId = req.userId as string;
    // Exibe uma mensagem para a depuração
    console. log(`Entrou na rota de cadastro de curso para o docente com o id ${professorId}`);
    try{
        // Obtém o nome do curso e o Id da instituição do corpo da requisição
        const { name, idInstitution } = req.body;
        // Se o nome ou o ID da instituição não estiver definido
        if (!name || !idInstitution) {
            // Retorna uma mensagem de erro
            return res.status(400).json({ error: "Os campos são obrigatórios." });
        }
        // Aguarda o cadastro do curso
        await addCourse(name, Number(idInstitution));
        // Returna um indicativo de sucesso
        res.status(200).json({ success: true });
    }
    catch(error){
        // Emite uma mensagem de erro e retorna o erro para o cliente
        console.error("Erro ao cadastrar curso:", error);
        return res.status(500).json({ error: 'Erro ao cadastrar instituição.' });
    }
});

// Rota para cadastrar uma nova Disciplina
app.post('/register-subject', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
    // Obtém o id do docente salvo no token de verificação - apenas para depuração, nesse caso
    const professorId = req.userId as string;
    // Exibe uma mensagem para a depuração
    console. log(`Entrou na rota de cadastro de disciplina para o docente com o id ${professorId}`);
    try {
        // Obtém o nome, a sigla, o período e o ID do curso do corpo da requisição
        const { name, code, term, idCourse } = req.body;
        // Se nome, sigla, período ou id do curso não estiver definido
        if (!name || !code || !term || !idCourse) {
            // Retorna uma mensagem de erro
            return res.status(400).json({ error: "Os campos são obrigatórios." });
        }
        // Aguarda o cadastro da disciplina
        await addSubject(name, code, term, Number(idCourse));
        // Retorna um indicativo de sucesso
        res.status(200).json({ success: true });
    } catch (error) {
        // Emite uma mensagem de erro e retorna o erro para o cliente
        console.error("Erro ao cadastrar disciplina:", error);
        res.status(500).json({ error: "Erro ao cadastrar disciplina." });
    }
});

// Rota para cadastrar uma nova Turma
app.post('/register-class', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
    // Obtém o id do docente salvo no token de verificação - apenas para depuração, nesse caso
    const professorId = req.userId as string;
    // Exibe uma mensagem para a depuração
    console. log(`Entrou na rota de cadastro de disciplina para o docente com o id ${professorId}`);
    try {
        // Obtém nome, dia, horário, prédio, sala e id da disciplina do corpo da requisição
        const { name, day, time, building, classroom, idSubject } = req.body;
        // Se o nome, dia, horário, prédio, sala ou id da disciplina não estiver definido
        if (!name || !day || !time || !building || !classroom || !idSubject) {
            // Os campos são obrigatórios
            return res.status(400).json({ error: "Os campos são obrigatórios." });
        }
        // Aguarda o cadastro da turma
        await addClass(name, day, time, building, classroom, Number(idSubject));
        // Retorna um indicativo de sucesso
        res.status(200).json({ success: true });
    } catch (error) {
        // Emite uma mensagem de erro e retorna o erro para o cliente
        console.error("Erro ao cadastrar turma:", error);
        res.status(500).json({ error: "Erro ao cadastrar turma." });
    }
});

/* ================================================================================================================================================================ */

/* ====================================================== Rotas para a exclusão de dados atrelados ao docente ====================================================== */

// Rota para excluir instituição
app.delete('/delete-institution', async (req: AuthenticatedRequest, res: Response)=>{
    // Obtém o id do docente salvo no token de verificação - apenas para depuração, nesse caso
    const professorId = req.userId as string;
    // Exibe uma mensagem para a depuração
    console. log(`Entrou na rota de exclusão de instituição para o docente com o id ${professorId}`);
    try{
        // Obtém o ID da instituição do corpo da requisição
        const idInst:number = Number(req.body.id);
        // Se o ID estiver indefinido ou não for numérico
        if(!idInst || isNaN(idInst)){
            // Retorna uma mensagem de erro
            res.status(400).json({error: 'Informação ausente ou incorreta'});
        }
        // Recebe o retorno da função de exclusão de instituição
        const removed:boolean = await removeInstitution(idInst);
        // Se removeu (removed === true)
        if(removed){
            // Envia uma mensagem de sucesso
            res.json({success: true});
        }
        // Se não conseguiu remover (removed !== true)
        else{
            // Envia uma mensagem de erro
            res.status(500).json({ error: "Erro ao excluir instituição." });
        }
    } catch (error) {
        // Emite uma mensagem de erro e retorna o erro para o cliente
        console.error("Erro ao excluir instituição:", error);
        res.status(500).json({ error: "Erro ao excluir instituição." });
    }
});

// Rota para excluir curso
app.delete('/delete-course', async (req: AuthenticatedRequest, res: Response)=>{
    try{
        // Obtém o ID do curso do corpo da requisição
        const idCourse:number = Number(req.body.id);
        // Se o ID estiver indefinido ou não for numérico
        if(!idCourse || isNaN(idCourse)){
            // Retorna uma mensagem de erro
            res.status(400).json({error: 'Informação ausente ou incorreta'});
        }
        // Recebe o retorno da função de exclusão de curso
        const removed:boolean = await removeCourse(idCourse);
        // Se removeu (removed === true)
        if(removed){
            // Envia uma mensagem de sucesso
            res.json({success: true});
        }
        // Se não conseguiu remover (removed !== true)
        else{
            // Envia uma mensagem de erro
            res.status(500).json({ error: "Erro ao excluir curso." });
        }
    } catch (error) {
        // Emite uma mensagem de erro e retorna o erro para o cliente
        console.error("Erro ao excluir curso:", error);
        res.status(500).json({ error: "Erro ao excluir curso." });
    }
});

// Rota para excluir disciplina
app.delete('/delete-subject', async (req: AuthenticatedRequest, res: Response)=>{
    try{
        // Obtém o ID da disciplina do corpo da requisição
        const idSubject:number = Number(req.body.id);
        // Se o ID estiver indefinido ou não for numérico
        if(!idSubject || isNaN(idSubject)){
            // Retorna uma mensagem de erro
            res.status(400).json({error: 'Informação ausente ou incorreta'});
        }
        // Recebe o retorno da função de exclusão de disciplina
        const removed:boolean = await removeSubject(idSubject);
        // Se removeu (removed === true)
        if(removed){
            // Envia uma mensagem de sucesso
            res.json({success: true});
        }
        // Se não conseguiu remover (removed !== true)
        else{
            // Envia uma mensagem de erro
            res.status(500).json({ error: "Erro ao excluir disciplina." });
        }
    } catch (error) {
        // Emite uma mensagem de erro e retorna o erro para o cliente
        console.error("Erro ao excluir disciplina:", error);
        res.status(500).json({ error: "Erro ao excluir disciplina." });
    }
});

// Rota para excluir turma
app.delete('/delete-class', async (req: AuthenticatedRequest, res: Response)=>{
    try{
        // Obtém o ID da turma do corpo da requisição
        const idInst:number = Number(req.body.id);
        // Se o ID estiver indefinido ou não for numérico
        if(!idInst || isNaN(idInst)){
            // Retorna uma mensagem de erro
            res.status(400).json({error: 'Informação ausente ou incorreta'});
        }
        // Recebe o retorno da função de exclusão de turma
        const removed:boolean = await removeClass(idInst);
        // Se removeu (removed === true)
        if(removed){
            // Envia uma mensagem de sucesso
            res.json({success: true});
        }
        // Se não conseguiu remover (removed !== true)
        else{
            // Envia uma mensagem de erro
            res.status(500).json({ error: "Erro ao excluir turma." });
        }
    } catch (error) {
        // Emite uma mensagem de erro e retorna o erro para o cliente
        console.error("Erro ao excluir turma:", error);
        res.status(500).json({ error: "Erro ao excluir turma." });
    }
});
/* ================================================================================================================================================================ */

/* ================================================ Rotas para a verificação da exclusão de dados atrelados ao docente ============================================= */

// Rota para verificar se uma instituição pode ser excluída
app.get('/can-delete-institution/:id', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
    try{
        // Obtém o ID da instituição do parâmetro da requisição
        const idInst:number = Number(req.params.id);
        // Se o ID estiver indefinido ou não for numérico
        if(!idInst || isNaN(idInst)){
            // Retorna uma mensagem de erro
            res.status(400).json({error: 'Informação ausente ou incorreta'});
        }
        // Recebe o retorno da função de verificação de exclusão de instituição
        const canRemove:boolean = await canRemoveInstitution(idInst);
        // Se puder remover (canRemove === true)
        if(canRemove){
            // Envia uma mensagem de sucesso
            res.json({success: true});
        }
        // Se não puder remover (canRemove !== true)
        else{
            // Envia uma mensagem de falha para indicar a impossibilidade de exclusão
            res.json({success: false});
        }
    } catch (error) {
        // Emite uma mensagem de erro e retorna o erro para o cliente
        console.error("Erro ao verificar dados para a exclusão de instituição:", error);
        res.status(500).json({ error: "Erro ao verificar dados para a exclusão de instituição." });
    }
});

// Rota para verificar se um curso pode ser excluído
app.get('/can-delete-course/:id', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
    try{
        // Obtém o ID do curso do parâmetro da requisição
        const idCourse:number = Number(req.params.id);
        // Se o ID estiver indefinido ou não for numérico
        if(!idCourse || isNaN(idCourse)){
            // Retorna uma mensagem de erro
            res.status(400).json({error: 'Informação ausente ou incorreta'});
        }
        // Recebe o retorno da função de verificação exclusão de curso
        const canRemove:boolean = await canRemoveCourse(idCourse);
        // Se puder remover (canRemove === true)
        if(canRemove){
            // Envia uma mensagem de sucesso
            res.json({success: true});
        }
        // Se não puder remover (canRemove !== true)
        else{
            // Envia uma mensagem de falha para indicar a impossibilidade de exclusão
            res.json({success: false});
        }
    } catch (error) {
        // Emite uma mensagem de erro e retorna o erro para o cliente
        console.error("Erro ao verificar dados para a exclusão de curso:", error);
        res.status(500).json({ error: "Erro ao verificar dados para a exclusão de curso." });
    }
});

// Rota para verificar se uma disciplina pode ser excluída
app.get('/can-delete-subject/:id', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
    try{
        // Obtém o ID da disciplina do parâmetro da requisição
        const idSubject:number = Number(req.params.id);
        // Se o ID estiver indefinido ou não for numérico
        if(!idSubject || isNaN(idSubject)){
            // Retorna uma mensagem de erro
            res.status(400).json({error: 'Informação ausente ou incorreta'});
        }
        // Recebe o retorno da função de verificação exclusão de disciplina
        const canRemove:boolean = await canRemoveSubject(idSubject);
        // Se puder remover (canRemove === true)
        if(canRemove){
            // Envia uma mensagem de sucesso
            res.json({success: true});
        }
        // Se não puder remover (canRemove !== true)
        else{
            // Envia uma mensagem de falha para indicar a impossibilidade de exclusão
            res.json({success: false});
        }
    } catch (error) {
        // Emite uma mensagem de erro e retorna o erro para o cliente
        console.error("Erro ao verificar dados para a exclusão de disciplina:", error);
        res.status(500).json({ error: "Erro ao verificar dados para a exclusão de disciplina." });
    }
});

// Rota para verificar se uma turma pode ser excluída
app.get('/can-delete-class/:id', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
    try{
        // Obtém o ID da turma do parâmetro da requisição
        const idClass:number = Number(req.params.id);
        // Se o ID estiver indefinido ou não for numérico
        if(!idClass || isNaN(idClass)){
            // Retorna uma mensagem de erro
            res.status(400).json({error: 'Informação ausente ou incorreta'});
        }
        // Recebe o retorno da função de verificação exclusão de turma
        const canRemove:boolean = await canRemoveClass(idClass);
        // Se puder remover (canRemove === true)
        if(canRemove){
            // Envia uma mensagem de sucesso
            res.json({success: true});
        }
        // Se não puder remover (canRemove !== true)
        else{
            // Envia uma mensagem de falha para indicar a impossibilidade de exclusão
            res.json({success: false});
        }
    } catch (error) {
        // Emite uma mensagem de erro e retorna o erro para o cliente
        console.error("Erro ao verificar dados para a exclusão de turma:", error);
        res.status(500).json({ error: "Erro ao verificar dados para a exclusão de turma." });
    }
});
/* ================================================================================================================================================================ */

/* ======================================================= Rota para o gerenciamento de turmas de um professor =================================================== */

// Rota para verificar se um professor é o dono de uma turma específica
app.get('/professor-owns-class/:classId', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
    // Obtém o id do docente salvo no token de verificação - docente logado
    const professorId = req.userId as string;
    // Exibe uma mensagem para a depuração
    console. log(`Entrou na rota de verificação de posse de turma para o docente com o id ${professorId}`);
    try {
        const classId:number = Number(req.params.classId);
        // Se o ID estiver indefinido ou não for numérico
        if(!classId || isNaN(classId) || isNaN(Number(professorId))){
            // Retorna uma mensagem de erro
            res.status(400).json({error: 'Informação ausente ou incorreta'});
        }
        // Aguarda a verificação de posse
        const ownership = await professorOwnsClass(Number(professorId), classId);
        console.log(ownership);
        // Se a posse for verdadeira, retorna um indicativo de sucesso
        if(ownership === true){
            res.status(200).json({ owns: true });
        }
        else{
            res.status(200).json({ owns: false });
        }
    } catch (error) {
        // Emite uma mensagem de erro e retorna o erro para o cliente
        console.error("Erro ao verificar posse de turma:", error);
        res.status(500).json({ error: "Erro ao verificar posse de turma." });
    }
});

/* ================================================================================================================================================================ */

/* ===================================================================== Rotas de alunos ========================================================================== */



// Rota para mostrar os alunos em uma tabela
app.get('/students/:id_class', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const idClass:number = Number(req.params.id_class);
        // Chama a função que busca no banco de dados as informações (RA e nome) dos alunos
        const data = await viewStudents(idClass); 

        // Se a função retornar um array de informações sobre alunos
        if (data) {
            // Retorna um status de 200 se a operação for concluída com sucesso
            res.status(200).json(data);
        } else {
            // Retorna um status de erro 404 caso o array de alunos não estiver preenchido
            res.status(404).json({ message: 'Nenhum aluno encontrado.' });
        }
    // Caso encontre um erro
    } catch (error) {
        // Imprimir um erro no console que não foi possível conectar ao servidor
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// Cria uma constante para o destino de armazenamento, onde o arquivo fica salvo no buffer do servidor
const storage = multer.memoryStorage();
// Cria uma constante que cria uma instância de middleware do Multer, que utiliza o armazenamento "storage"
const upload = multer({ storage: storage });

// Rota para a importação de um arquivo .csv no servidor
// "upload.single('file')" é o método para conter apenas um arquivo, que será utilizado posteriormente
app.post('/csvimport/:id_class', upload.single('file'), verifyToken, async (req: AuthenticatedRequest, res: Response) => {
    // Constante para pegar o número da turma no parâmetro da requisição
    const classId = Number(req.params.id_class);

    // Se o arquivo da requisição for nulo
    if (!req.file) {
    // Retorna um status de 400, indicando que o arquivo não foi encontrado
    return res.status(400).json({ message: 'Nenhum arquivo foi enviado.' });
    }

    try {
    // Executa a função de importar o arqquivo que está na requisição, caso ele não seja nulo
    const report = await process_csv_import(req.file, classId);
    // Se ele não for nulo e for importado com sucesso, retorna uma mensagem de sucesso
    res.status(200).json({
        // Mensagem
        message: 'Importação concluída com sucesso!',
        // Dados
        data: report
    });
    // Caso ele não consiga executar a importação, ou seja, dê erro nela
    } catch (error: any) {
    // Exibe no console uma mensagem de erro durante a importação do arquivo .csv
    console.error('Erro durante a importação do arquivo CSV:', error.message);
    // Retorna um status 400 com a respectiva mensagem de erro
    res.status(400).json(error.message);
    }
});

// Rota para atualizar/adicionar aluno
app.post('/addStudents/:id_class', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
    // Declaração e inicialização das variáveis que vêm do corpo da requisição e que serão passadas como parâmetros futuramente
    const ra: string = req.body.ra;
    const name: string = req.body.name;
    const page_class: number = Number(req.params.id_class);

    try {
        // Chamada da função void que executa a atualização/adição de novos alunos em uma determinada turma
        await updateStudents(ra, name, page_class);
        // Retorna um status de sucesso (200) com uma mensagem 
        res.status(200).json({message: "Aluno atualizado com sucesso!"});
    }
    // Caso ocorra um erro no servidor
    catch(err) {
        // Exibição do erro no console
        console.error(err);
        // Retorna o status 500 de erro no servidor com um JSON que contém o erro
        res.status(500).json({err});
    }

}) 

// Rota para apagar aluno(s)
app.delete('/deleteStudent', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
    // Declaração e inicialização das variáveis que irão servir de parâmetros para a função deletar
    const id: string = req.body.id;
    const name: string = req.body.name;
    
})

/* ================================================================================================================================================================ */

/* =================================================================== Rotas de componentes de nota =============================================================== */

// Rota para adicionar componente de nota
app.post('/addComponent/:subjectId', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
    // Constantes que recebem dados do corpo da requisição
    const name: string = String(req.body.name);
    const code: string = String(req.body.code);
    const description: string = String(req.body.description);
    const weight: number = Number(req.body.weight);
    // Constante que recebe dados do parâmetro da requisição
    const subjectId: number = Number(req.params.subjectId);

    // Tenta registrar o componente
    try{
        // Espera a função de registrar componente de nota
        await registerGradeComponent(name, code, description, weight, subjectId);
        // Status 200 se a requisição ocorrer com sucesso
        res.status(200).json({success: true});
    // Caso ocorra um erro no servidor
    } catch(err) {
        // Exibição do erro no console
        console.error("Erro: ", err);
        res.status(500).json({err});
    }
})


// Rota para mostrar a tabela de componentes
app.get('/viewComponents/:id_class', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
    // Pega o id da turma a partir dos parâmetros da requisição
    const classId = Number(req.params.id_class);
    try {
        // Chama a função que busca no banco de dados as informações dos componentes de nota
        const data = await viewComponents(classId);
        // Se a função retornar um array de informações sobre os componentes
        if (data) {
            // Retorna um status de 200 se a operação for concluída com sucesso
            res.status(200).json(data);

        } else {
            // Retorna um status de erro 404 caso o array de alunos não estiver preenchido
            res.status(404).json({ message: 'Nenhum aluno encontrado.' });
        }
    // Caso encontre um erro
    } catch (error) {
        // Imprimir um erro no console que não foi possível conectar ao servidor
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
})

/* ================================================================================================================================================================ */

/* ======================================================================== Rotas de nota ========================================================================= */

// Rota para salvar (inserir/atualizar) notas
app.post('/grades-update-insert', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
    // Cria uma constante grades do array que vem do corpo da requisição
    const grades = req.body;
    
    // Validação básica para conferir se a constante é um array ou se ela não existe
    if (!Array.isArray(grades) || grades.length === 0) {
        return res.status(400).json({ error: 'Formato de dados inválido.' });
    }
    // Tenta inserir ou atualizar nota
    try {
        const success = await updateOrInsertGrade(grades);
        // Se a constante de sucesso retornada for verdadeira, ou seja, se conseguir inserir/atualizar no banco
        if (success) {
            // Envia o status 200, de sucesso, junto com uma mensagem de que as notas foram salvas com sucesso
            res.status(200).json({ success: true, message: 'Notas salvas com sucesso!' });
        // Caso não obtenha-se sucesso ao inserir/atualizar uma nota (success = false)
        } else {
            // Envia um status 500, de erro, junto com uma mensagem de que houve um erro ao tentar salvar notas
            res.status(500).json({ error: 'Erro ao salvar as notas.' });
        }
    // Na ocorrência de um erro
    } catch (error) {
        // Emite uma mensagem de erro no console com o erro que ocorreu
        console.error("Erro ao salvar notas (rota):", error);
        // Envia um status 500 e acusa um erro no servidor
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// Rota para obter as notas de uma turma com base no ID da turma
app.get('/grades/:classId', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
    // Obtém o id da classe pelo corpo da requisição
    const classId = Number(req.params.classId);
    // Se o id não for numérico, retorna um erro
    if (isNaN(classId)) {
        return res.status(400).json({ error: 'ID da turma inválido.' });
    }

    try {
        // Obtém o Array de notas de uma turma trazido pela função
        const data = await getGradesByClass(classId);
        // Se data estiver definido
        if (data) {
            // Retorna o array com as notas
            res.status(200).json(data);
        } else {
            // Se o Array estiver vazio, retorna uma mensagem de erro
            res.status(404).json({ message: 'Nenhuma nota encontrada.' });
        }
    }
    // Se ocorrer um erro durante o processo
    catch (error) {
        // Imprime no console o erro ocorrido
        console.error("Erro ao buscar notas:", error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

/* ================================================================================================================================================================ */

/* ==================================================================== Rotas de média final ====================================================================== */

// Rota para o cálculo de média final
app.post('/grades/calculate-final', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
    
    // Busca o ID da turma e da disciplina no corpo da requisição
    const classId = Number(req.body.classId);
    const subjectId = Number(req.body.subjectId);

    // Se algum dos IDs forem NaN (Not a Number), retorna uma resposta de erro e indica que os IDs são inválidos
    if (isNaN(classId) || isNaN(subjectId)) {
        return res.status(400).json({ error: 'IDs de turma ou disciplina inválidos.' });
    }

    // Tenta calcular a média final
    try {
        const result = await calculateAndSaveFinalGrades(classId, subjectId);
        
        // Se o "success" (sucesso) do resultado for verdadeiro
        if (result.success) {
            // Envia um status 200 de operação consluída com sucesso e um JSON com o resultado obtido no cálculo da média final
            res.status(200).json(result);
        } else {
            // Se a operação não tiver sucesso, emite um erro
            res.status(400).json(result); 
        }

    // Captura um erro, se ele ocorrer
    } catch (error: any) {
        // Imprime uma mensagem no console que mostra qual foi o erro que ocorreu
        console.error("Erro ao calcular médias finais (rota):", error);
        // Envia um status 500, indicando erro no servidor, em formato JSON, informando que não se obteve sucesso (juntamente da mensagem de erro)
        res.status(500).json({ success: false, message: `Erro interno do servidor: ${error.message}` });
    }
});

/* ================================================================================================================================================================ */

/* ======================================================================== Rotas de nota ========================================================================= */

// Rota para pegar as informações da turma
app.get('/class_info/:classId',verifyToken, async (req: AuthenticatedRequest, res: Response) => {
    
    // O ID da classe é passado por parâmetro da requisição
    const classId = Number(req.params.classId);
    // Se der NaN (Not a Number) para o classId
    if (isNaN(classId)) {
        // Envia o status da resposta de 400 e diz que a turma é inválida
        return res.status(400).json({ error: 'ID da turma inválido.' });
    }
    // Tenta executar a função que pega as informações da turma
    try {
        // Atribui a uma constate o retorno da função de obter as informações da turma
        const data = await getClassInfo(classId);
        // Se houver retorno não nulo
        if (data) {
            // Envia uma resposta de sucesso com as informações de data em um JSON
            res.status(200).json(data);
        // Caso não exista nenhuma informação retornada
        } else {
            // Envia o status 404 com a mensagem que nenhuma turma foi encontrada
            res.status(404).json({ message: 'Informações da turma não encontradas.' });
        }
    // Captura a ocorrência de um erro
    } catch (error) {
        // Caso capturado um erro, aparecerá um erro no console
        console.error("Erro ao buscar informações da turma (rota):", error);
        // Enviará status de resposta 500 com uma mensagem alertando erro interno no servidor
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

/* ================================================================================================================================================================ */

/* ======================================================================= Apagar aluno(s) ======================================================================== */

// Rota DELETE para apagar alunos de uma turma
app.delete('/deleteStudent/:classId', verifyToken, async(req: AuthenticatedRequest, res: Response) => {
    // Obtém o ID da turma através do parâmetro da requisição (URL)
    const classId = Number(req.params.classId);
    // Obtém o RA do aluno através do corpo (body) da requisição
    const ra: string[] = req.body as string[];
    // Se der NaN (Not a Number) para o classId
    if (isNaN(classId)) {
        // Envia o status da resposta de 400 e diz que a turma é inválida
        return res.status(400).json({ error: 'ID da turma inválido.' });
    }
    // Verificando se o array com os RAs recebidos é valido e não está vazio
    if (!Array.isArray(ra) || ra.length === 0) {
        // Envia o status da resposta de 400 e diz que o formato de dados recebido é inválido
        return res.status(400).json({ error: 'Formato de dados inválido.' });
    }
    // Tenta executar a função que apaga os alunos selecionados
    try {
        // Por essa função ser void, só é necessário chamá-la com o await, por ser assíncrona
        await deleteStudent(ra, classId);
        // Executa a tarefa acima e emite uma mensagem de sucesso com o status 200
        res.status(200).json({message: "Aluno(s) deletado(s) com sucesso!"});
    // Captura o erro, caso ele ocorra
    } catch (err) {
        // Envia um status de 500 e emite uma mensagem de erro ao se conectar com o servidor
        res.status(500).json({ message: "Erro de conectar com o servidor"})
    }
});
/* ================================================================================================================================================================ */

/* ==================================================================== Inicializar o servidor ==================================================================== */

// Rota para inicializar o servidor
app.listen(port, () => {
    // Imprime no console que o servidor está funcionando na porta definida
    console.log(`Servidor funcionando na porta ${port}.`);
});
