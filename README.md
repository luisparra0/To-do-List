# TO-DO-LIST

## Descrição

Este é um projeto de uma aplicação de lista de tarefas, onde você pode adicionar, visualizar e deletar tarefas. A aplicação é construída com Node.js e utiliza MySQL para armazenar os dados.

## Tecnologias Utilizadas

- **Node.js**: Ambiente de execução para JavaScript no servidor.
- **Express**: Framework para construir aplicações web em Node.js.
- **MySQL**: Sistema de gerenciamento de banco de dados.
- **Visual Studio Code**: Editor de código fonte utilizado para o desenvolvimento.

## Pré-requisitos

Antes de começar, você precisará ter instalado em sua máquina:

1. [Node.js](https://nodejs.org/) (v14 ou superior)
2. [MySQL](https://www.mysql.com/) (v5.7 ou superior)
3. [Visual Studio Code](https://code.visualstudio.com/) para edição do código.

## Instalação

Siga os passos abaixo para instalar e executar o projeto em seu ambiente local.

1. **Clone o repositório:**

   ```bash
   git clone (https://github.com/luisparra0/To-do-List.git)
Navegue até o diretório do projeto:

bash
Copiar código
cd seu_repositorio
Instale as dependências do projeto:

bash
Copiar código
npm install
Configure o banco de dados MySQL:

Crie um banco de dados chamado TODOLIST.
Crie uma tabela chamada Lista_Tarefa com os seguintes campos:
sql
Copiar código
CREATE TABLE Lista_Tarefa (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL
);
Inicie o servidor:

bash
Copiar código
node server.js
O servidor estará rodando em http://localhost:3000.

Abra o projeto no Visual Studio Code:

bash
Copiar código
code .
Uso
Acesse a aplicação no seu navegador através do endereço http://localhost:3000.
Adicione novas tarefas utilizando o formulário disponível.
As tarefas serão armazenadas no banco de dados MySQL.
Contribuição
Se você gostaria de contribuir com este projeto, fique à vontade para fazer um fork do repositório e enviar suas pull requests.


Sinta-se à vontade para ajustar qualquer parte conforme necessário!
