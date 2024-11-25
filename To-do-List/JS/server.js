const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); // Importar o pacote cors
const app = express();
const port = 3000;

// Middleware
app.use(cors()); // Permitir CORS para todas as rotas
app.use(express.json());

// Conexão com o banco de dados MySQL
// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '1234',
//     database: 'TODOLIST'
// });

// Conexão com o banco de dados usando credenciais diretas
const db = mysql.createConnection({
    host: 'todolist.cduewaimen75.us-east-1.rds.amazonaws.com',
    user: 'admin',
    password: 'Naruto2010',
    database: 'TODOLIST',
    port: 3306,
    connectTimeout: 10000 // Ajuste o tempo de conexão se necessário
});


// Conexão
db.connect((err) => {
    if (err) {
        console.log('Erro ao conectar no banco de dados:', err);
        return;
    }
    console.log('Conectado ao banco de dados MySQL!');
});

// Rota para adicionar uma tarefa na tabela lista_tarefa
app.post('/add-lista-tarefa', (req, res) => {
    const { titulo } = req.body;
    console.log(req.body); // Verifique o conteúdo da requisição

    if (!titulo) {
        return res.status(400).send('Título da tarefa é obrigatório');
    }

    const sql = 'INSERT INTO lista_tarefa (titulo) VALUES (?)';
    db.query(sql, [titulo], (err, result) => {
        if (err) {
            return res.status(500).send('Erro ao inserir a tarefa na lista_tarefa');
        }
        const listaTarefaId = result.insertId;
        res.status(200).json({ id: listaTarefaId, titulo });
    });
});


// Rota para obter dados de uma tarefa existente
app.get('/tarefa/:id', (req, res) => {
    const tarefaId = req.params.id;

    const sql = `
        SELECT t.descricao, t.prazo, t.finalizadora 
        FROM tarefa t 
        INNER JOIN lista_tarefa lt ON t.id = lt.id
        WHERE t.id = ? OR lt.titulo = ?
    `;

    db.query(sql, [tarefaId, tarefaId], (err, results) => {
        if (err) {
            console.error('Erro ao buscar a tarefa:', err);
            return res.status(500).send('Erro ao buscar a tarefa');
        }

        if (results.length === 0) {
            return res.status(404).send('Nenhuma tarefa encontrada para este item.');
        }

        res.status(200).json(results[0]);
    });
});


// Rota para adicionar uma tarefa na tabela tarefa (com ID da lista_tarefa)
app.post('/add-tarefa', (req, res) => {
    const { titulo } = req.body;

    if (!titulo) {
        return res.status(400).send('Título é obrigatório');
    }

    const query = 'INSERT INTO lista_tarefa (titulo) VALUES (?)';
    db.query(query, [titulo], (err, result) => {
        if (err) {
            console.error('Erro ao inserir tarefa:', err);
            return res.status(500).send('Erro ao inserir tarefa');
        }

        // Retornar o ID da nova tarefa
        res.status(200).json({ id: result.insertId, titulo });
    });
});


// Rota para obter todas as tarefas
app.get('/todos', (req, res) => {
    const sql = 'SELECT * FROM lista_tarefa';
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).send('Erro ao buscar tarefas no banco de dados');
        }
        res.json(results);
    });
});

// Rota para atualizar/editar tarefa
app.put('/atualizar-tarefa/:id', (req, res) => {
    const tarefaId = req.params.id; // Pode ser ID ou Título
    const { descricao, prazo, finalizadora } = req.body;

    // Determinar se `tarefaId` é um número (ID) ou texto (Título)
    let sqlGetTitulo;
    let param;

    if (isNaN(tarefaId)) { // Não é um número, então é título
        sqlGetTitulo = 'SELECT id FROM lista_tarefa WHERE titulo = ?';
        param = tarefaId;
    } else { // É numérico, então é ID
        sqlGetTitulo = 'SELECT titulo FROM lista_tarefa WHERE id = ?';
        param = tarefaId;
    }

    // Buscar o título ou ID correspondente
    db.query(sqlGetTitulo, [param], (err, results) => {
        if (err) {
            console.error('Erro ao buscar tarefa:', err);
            return res.status(500).send('Erro ao buscar tarefa no banco de dados');
        }

        if (results.length === 0) {
            return res.status(404).send('Tarefa não encontrada na tabela lista_tarefa');
        }

        // Obter título e ID correspondentes
        const titulo = isNaN(tarefaId) ? tarefaId : results[0].titulo;
        const id = isNaN(tarefaId) ? results[0].id : tarefaId;

        // Continuar com a lógica de salvar na tabela `tarefa`
        const sqlUpdateTarefa = `
            INSERT INTO tarefa (id, titulo, descricao, prazo, finalizadora)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE descricao = ?, prazo = ?, finalizadora = ?
        `;

        db.query(
            sqlUpdateTarefa,
            [id, titulo, descricao, prazo, finalizadora, descricao, prazo, finalizadora],
            (err, result) => {
                if (err) {
                    console.error('Erro ao salvar tarefa:', err);
                    return res.status(500).send('Erro ao salvar a tarefa');
                }

                res.status(200).send('Tarefa salva com sucesso!');
            }
        );
    });
});


// Rota para deletar uma tarefa
app.delete('/deletar/:id', (req, res) => {
    const tarefaId = req.params.id; // Pega o ID da tarefa a partir da URL
    const sqlDeleteTarefa = 'DELETE FROM lista_tarefa WHERE id = ?';
    const sqlDeleteTarefaDetalhada = 'DELETE FROM tarefa WHERE id = ?';

    // Deletar da tabela Lista_Tarefa
    db.query(sqlDeleteTarefa, [tarefaId], (err, result) => {
        if (err) {
            return res.status(500).send('Erro ao deletar a tarefa na tabela Lista_Tarefa');
        }

        // Deletar da tabela tarefa
        db.query(sqlDeleteTarefaDetalhada, [tarefaId], (err, result) => {
            if (err) {
                return res.status(500).send('Erro ao deletar a tarefa na tabela tarefa');
            }

            res.status(200).send('Tarefa deletada com sucesso!');
        });
    });
});



// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
