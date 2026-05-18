// Autor: Beatriz Naomi Ferreira Sasaki

/* =========================================================== Importação de pacotes e funções =========================================================== */
// Importa o módulo do OracleDB
import OracleDB from "oracledb";
/* ======================================================================================================================================================= */


/* ===================================================== Caminhos pessoais para os recursos do Oracle ==================================================== */

// --- Caminhos Noemi ---
// Caminho para o PROGRAMA Instant Client (onde está libclntsh.dylib) // Noemi
const libDir = "/Users/noemi/opt/oracle/instantclient_23_3";

// Caminho para a CARTEIRA (Wallet) // Noemi
const configDir = "/Users/noemi/oracle";

// --- Caminhos Enzo --- 
// // Caminho para o PROGRAMA Instant Client (onde está libclntsh.dylib) // - Enzo
// const libDir = "D:/Oracle/instantclient/instantclient_23_9";

// // Caminho para a CARTEIRA (Wallet) // - Enzo
// const configDir = "D:/Oracle/wallet_noemi";

// // --- Caminhos Beatriz ---
// // Caminho para o PROGRAMA Instant Client (onde está libclntsh.dylib) 
// const libDir = "C:/Users/Usuario/Downloads/instantclient/instantclient2/instantclient_23_9_basic"; // Beatriz 

// // Caminho para a CARTEIRA (Wallet)
// const configDir = "C:/Users/Usuario/Downloads/Wallet_freedb"; // Beatriz 
/* ======================================================================================================================================================= */


/* ==================================================================== Configurações ==================================================================== */
// Inicializar
try {
    // Inicializa o Oracle Client com os diretórios especificados
  OracleDB.initOracleClient({
    libDir: libDir,
    configDir: configDir  // Diz ao Node onde encontrar o tnsnames.ora e o Wallet
  });
} catch (err) {
    // Log do erro ocorrido
    console.error("Erro ao inicializar o Oracle Client:", err);
    process.exit(1);
}

// Formato de saída
OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

// Configurações de conexão com o banco de dados
const dbConfig = {
    user: "WEBAPP",
    password: "NoemiMali123",
    connectString: "freedb_high"
}
/* ======================================================================================================================================================= */


/* ============================================================ Funções assíncronas exportadas =========================================================== */
// Função para abrir a conexão
export async function open() {
    try {
        // Abre a conexão com o banco de dados
        const connection = await OracleDB.getConnection(dbConfig);
        console.log("Conexao OCI - aberta");
        return connection;
    } catch(err) {
        // Log do erro ocorrido ao abrir a conexão
        console.error("Erro ao abrir a conexao Oracle: ", err);
        throw err;
    }
}

// Função para fechar a conexão
export async function close(connection: OracleDB.Connection) {
    try {
        // Fecha a conexão com o banco de dados
        await connection.close();
        console.log("Conexao OCI - Fechada");
    } catch(err) {
        // Log do erro ocorrido ao fechar a conexão
        console.error("Erro ao fechar a conexao com o Oracle: ", err);
    }
}