<h1 align= center>
<img src="frontend/img/notadez_logo.png" width="750">
Projeto Integrador - Nota 10
</h1>

# Sobre o Projeto 📚
<div style="text-align: justify">
O Projeto Nota 10 é uma plataforma desenvolvida para professores, focada em oferecer uma gestão acadêmica simples e completa. Ela permite que o docente cadastre as instituições as quais leciona, bem como suas disciplinas, turmas e respectivos alunos e tem seu principal foco em armazenar as notas de cada estudante e realizar o cálculo da média final de forma totalmente personalizada, permitindo configurar pesos diferentes e diversos tipos de avaliação. O sistema também conta com um mecanismo de auditoria, que registra qualquer alteração realizada nas notas, incluindo o valor anterior e a data da modificação.
</div>

## Time 14 🤝
+ [Beatriz Naomi Ferreira Sasaki](https://github.com/beatrizsasaki1114)
+ [Caio Marion](https://github.com/caiomarionpb)
+ [Enzo Olivato Pazian](https://github.com/EnzoOP1402)
+ [Gabriela Sichiroli Ferrari](https://github.com/GabSichiroli)
+ [Noemi Kayama](https://github.com/noemikayama)

# Como foi realizado o projeto 👨‍💻

<div style="text-align: justify">
O desenvolvimento do Projeto Nota10 foi realizado de forma colaborativa, durante reuniões, sem divisão fixa de tarefas. Priorizamos o entendimento coletivo da equipe sobre todas as etapas da construção, garantindo que todos os integrantes contribuíssem na idealização, no frontend e no backend. Essa abordagem proporcionou maior absorção de conhecimento geral e melhor conscientização sobre o andamento do projeto.

# Arquivos sobre o desenvolvimento do projeto 📎

- **Requistos**
     - [Funcionais](https://docs.google.com/document/d/1qVR7MZ_EW_GMCF-aQakKxOFwYSjWrWYXLvD7ctj6M5E/edit?usp=sharing) 
     - [Stakeholders](https://docs.google.com/document/d/1ozTeAnssBi62Owbxe5OOu_d1hnLnULFGD4xWmnEtX_Q/edit?usp=sharing)
     - [Não Funcionais](https://docs.google.com/document/d/1ECpN3YeCfJvV6o-a3sx8qTUdmvdQcsffLEqcbAQBG4s/edit?usp=sharing)
- **MER**
     - [Modelo Físico](https://app.brmodeloweb.com/#!/publicview/690b5f05c9a295152fa2a9f4)
     - [Modelo Lógico](https://app.brmodeloweb.com/#!/publicview/690b8c54c9a295152fa2b330)
     - [Mapa Mental](https://www.canva.com/design/DAGx9dDClLk/arxdMVgQka1FGBNEMjFgXQ/edit?utm_content=DAGx9dDClLk&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)
- **Design**
     - [Design de logos](https://www.figma.com/proto/OpQgal45bkADxD9lidyqFP/NotaDez?node-id=10-205&t=z4BmBhWk0VpaLNge-1)
     - [Design de telas](https://www.figma.com/design/OpQgal45bkADxD9lidyqFP/NotaDez?node-id=0-1&t=PH8C2ssbzx8fcKnr-1)


# Feramentas 🛠️
- [**Node.js**](https://nodejs.org/pt)
- [**Oracle Database**](https://www.oracle.com/br/database/free/get-started/)
- [**Oracle Instant Client**](https://www.oracle.com/database/technologies/instant-client/downloads.html)
     - Instale o Basic Package(.ZIP)
     - Instale o SQL*Plus Package(.ZIP)
- [**Wallet**](https://drive.google.com/file/d/1GwHFWaeISRc2xdenc7nb9oc8UJh94D8o/view?usp=sharing)


# Como iniciar o projeto Nota 10 💡
## 1. Preparando o ambiente backend 

- No terminal, entre no diretorio (pasta) responsavel pelo backend com o seguinte comando (No Windons);


```
cd backend
```

- Como temos os arquivo _package-lock.json_ apenas coloque o comando a baixo para realizar a instalações das dependências do ambiente backend;


```
npm install
```

## 2. Vincule o banco de Dados (Windows)
### Instalações nescessarias: 
> Todos os arquivos estão no topico Ferramentas
- Realize o a instalação do **Oracle Database**, caso não tenha;

- Realize a instalação dos zips **Basic Package(.ZIP)** e **SQL*Plus Package(.ZIP)**, caso não tenha;

- Realize o download **Wallet**.

### Como fazer a interface: 

1. Crie a diretorio "oracle" na raiz do computador dando o seguinte comando:

```
mkdir C:\Oracle
```

2. Dentro desta pasta, crie o diretorio "instantclient":

```
mkdir C:\oracle\instantclient
```

3. Extraia os aquivos zips (Basic Package e SQL*Plus Package) dentro de "instantclient" com o comando "Extrair arquivos...", sem manter a pasta, e coloque o seguinte caminho:

```
C:\oracle\instantclient
```

4. Para configurar a variavel de ambiente PATH, configurando o Oracle Batabase de o seguinte comando no terminal:

```
setx PATH "%PATH% C:\oracle\instantclient\instantclient_23_9"
```

5. Crie dentro diretorio "oracle" uma nova pasta essa que vai ser o nosso wallet, use o seguine comando:

```
mkdir C:\oracle\wallet
```

6. Extraia o aquivo zip do Wallet dentro de "wallet" com o comando "Extrair arquivos...", sem manter a pasta, e coloque o seguinte caminho:

```
C:\oracle\wallet
```

7. Para configurar a variavel de ambiente TNS_ADMIN, configurando o Wallet de o seguinte comando no terminal:

```
setx TNS_ADMIN "C:\oracle\wallet"
```

8. Para Finalizar, dentro do diretorio wallet temos um arquivo chamado _sqlnet.ora_, o abra pelo bloco de notas e altere somente o seguinte:

```
DIRECTORY="C:\\oracle\\wallet_time14"
```

> [!NOTE]\
> Adicione uma segunda barra para funcionar.

### ** Inserindo os caminhos: **

1. Para o banco de dados funcionar, insira em _db.ts_ no dentro de caminhos pessoais, o seu caminho, para isso comente, delete ou substitua qualquer caminho ativo trocando o para o seu:

- Caminho do Instant Client:

```
const libDir = "C:/oracle/instantclient/instantclient_23_9"
```
- Caminho do Instant Client:
```
const configDir = "C:/oracle/wallet_time14";
```
> [!NOTE]\
> Para funcionar precisamos usar a barra "/".

### ** 3. Iniciando o Servidor **

1. No terminal, entre no diretorio (pasta) responsavel pelo backend com o seguinte comando;


```
cd backend
```

2. Para iniciar o server dê o comando

```
npm start
```
