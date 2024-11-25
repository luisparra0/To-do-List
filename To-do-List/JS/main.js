// Selectors
const toDoInput = document.querySelector('.todo-input');
const toDoBtn = document.querySelector('.todo-btn');
const toDoList = document.querySelector('.todo-list');
const standardTheme = document.querySelector('.standard-theme');
const lightTheme = document.querySelector('.light-theme');
const darkerTheme = document.querySelector('.darker-theme');
const oceanTheme = document.querySelector('.ocean-theme');
const sunsetTheme = document.querySelector('.sunset-theme');

// Event Listeners
toDoBtn.addEventListener('click', addToDo);
toDoList.addEventListener('click', deletecheck);
document.addEventListener("DOMContentLoaded", getTodos);
standardTheme.addEventListener('click', () => changeTheme('standard'));
lightTheme.addEventListener('click', () => changeTheme('light'));
darkerTheme.addEventListener('click', () => changeTheme('darker'));
oceanTheme.addEventListener('click', () => changeTheme('ocean'))
sunsetTheme.addEventListener('click', () => changeTheme('sunset'))
// Check if one theme has been set previously and apply it (or std theme if not found):
let savedTheme = localStorage.getItem('savedTheme');
savedTheme === null ? changeTheme('standard') : changeTheme(savedTheme);

// Functions
function addToDo(event) {
    // Previne o comportamento padrão do formulário
    event.preventDefault();

    const titulo = toDoInput.value;  // Pega o valor do input

    if (titulo === '') {
        alert('Você tem que escrever algo!');
        return;
    }

    // Envia os dados para o back-end
    fetch('http://34.227.143.202:3000/add-tarefa', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ titulo }) // Envia apenas o título por enquanto
    })
    .then(response => response.text())
    .then(data => {
        console.log(data);
        // Sucesso: atualiza a UI com a nova tarefa
        displayTask(titulo);
        alert('Tarefa salva com sucesso!');  // Exibe alerta de sucesso
    })
    .catch(error => {
        console.error('Erro na requisição:', error);
    });

    // Limpa o input após salvar
    toDoInput.value = '';
}

function showEditForm(id, titulo) {
    let formContainer = document.querySelector('#editFormContainer');

    // Remover formulário anterior, se existir
    if (formContainer) {
        formContainer.remove();
    }

    // Criar um novo contêiner para o formulário
    formContainer = document.createElement('div');
    formContainer.id = 'editFormContainer';

    formContainer.innerHTML = `
        <form id="editForm">
            <label for="descricao">Descrição:</label>
            <input type="text" id="descricao" name="descricao" placeholder="Adicione uma descrição">

            <label for="prazo">Prazo:</label>
            <input type="date" id="prazo" name="prazo">

            <label for="finalizadora">Finalizado:</label>
            <input type="checkbox" id="finalizadora" name="finalizadora">

            <button type="button" id="saveButton">Salvar</button>
            <button type="button" id="cancelButton">Cancelar</button>
        </form>
    `;

    // Adicionar o formulário ao corpo da página
    document.body.appendChild(formContainer);

    // Resetar os campos do formulário
    document.querySelector('#descricao').value = '';
    document.querySelector('#prazo').value = '';
    document.querySelector('#finalizadora').checked = false;

    // Buscar dados existentes, se houver
    fetch(`http://34.227.143.202:3000/tarefa/${id}`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                console.log('Nenhuma tarefa existente para este item.');
                return null; // Não preencher os campos
            }
        })
        .then(data => {
            if (data) {
                // Preencher os campos se houver dados
                document.querySelector('#descricao').value = data.descricao || '';
                document.querySelector('#prazo').value = data.prazo || '';
                document.querySelector('#finalizadora').checked = !!data.finalizadora;
            }
        })
        .catch(err => console.error('Erro ao carregar tarefa:', err));

    // Botão cancelar
    document.querySelector('#cancelButton').onclick = () => {
        formContainer.remove(); // Remove o formulário
    };

    // Botão salvar
    document.querySelector('#saveButton').onclick = () => {
        const descricao = document.querySelector('#descricao').value;
        const prazo = document.querySelector('#prazo').value;
        const finalizadora = document.querySelector('#finalizadora').checked ? 1 : 0;

        fetch(`http://34.227.143.202:3000/atualizar-tarefa/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ descricao, prazo, finalizadora }),
        })
            .then(response => {
                if (response.ok) {
                    alert('Tarefa salva com sucesso!');
                    formContainer.remove();
                    location.reload(); // Atualiza a lista
                } else {
                    alert('Erro ao salvar a tarefa.');
                }
            })
            .catch(err => {
                console.error('Erro ao salvar tarefa:', err);
                alert('Erro inesperado ao salvar a tarefa.');
            });
    };
}

function deletecheck(event) {
    const item = event.target;

    // Delete
    if (item.classList[0] === 'delete-btn') {
        const tarefaId = item.parentElement.getAttribute("data-id"); // Pega o ID da tarefa
        item.parentElement.classList.add("fall");
        removeLocalTodos(item.parentElement);

        // Enviar requisição DELETE para o backend
        fetch(`http://34.227.143.202:3000/deletar/${tarefaId}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (response.ok) {
                console.log(`Tarefa ${tarefaId} deletada com sucesso!`);
                // Remover o item da lista no frontend após a resposta do backend
                item.parentElement.addEventListener('transitionend', function() {
                    item.parentElement.remove();
                });
            } else {
                console.error('Erro ao deletar a tarefa no banco de dados');
            }
        })
        .catch(error => {
            console.error('Erro ao conectar com o servidor:', error);
        });
    }

    // Check
    if (item.classList[0] === 'check-btn') {
        item.parentElement.classList.toggle("completed");
    }

    // Show form on click
    if (item.tagName === 'LI') { // Detecta clique na tarefa
        showEditForm(item.innerText); // Passa o título da tarefa
    }
}


function displayTask(titulo, id) {
    const toDoDiv = document.createElement("div");
    toDoDiv.classList.add('todo', `${savedTheme}-todo`);
    toDoDiv.setAttribute('data-id', id); // Adiciona o ID como um atributo

    const newToDo = document.createElement('li');
    newToDo.innerText = titulo;
    newToDo.classList.add('todo-item');
    toDoDiv.appendChild(newToDo);

    // Check button
    const checked = document.createElement('button');
    checked.innerHTML = '<i class="fas fa-check"></i>';
    checked.classList.add('check-btn', `${savedTheme}-button`);
    toDoDiv.appendChild(checked);

    // Delete button
    const deleted = document.createElement('button');
    deleted.innerHTML = '<i class="fas fa-trash"></i>';
    deleted.classList.add('delete-btn', `${savedTheme}-button`);
    toDoDiv.appendChild(deleted);

    // **Evento para exibir o formulário ao clicar**
    newToDo.addEventListener('click', () => showEditForm(id, titulo));

    // Append to list
    toDoList.appendChild(toDoDiv);
}


function showEditForm(id, titulo) {
    // Cria ou exibe o formulário de edição
    let formContainer = document.querySelector('#editFormContainer');

    if (!formContainer) {
        formContainer = document.createElement('div');
        formContainer.id = 'editFormContainer';

        formContainer.innerHTML = `
            <form id="editForm">
                <label for="descricao">Descrição:</label>
                <input type="text" id="descricao" name="descricao" placeholder="Adicione uma descrição">

                <label for="prazo">Prazo:</label>
                <input type="date" id="prazo" name="prazo">

                <label for="finalizadora">Finalizado:</label>
                <input type="checkbox" id="finalizadora" name="finalizadora">

                <button type="button" id="saveButton">Salvar</button>
                <button type="button" id="cancelButton">Cancelar</button>
            </form>
        `;
        document.body.appendChild(formContainer);
    }

    // Preenche o formulário com os dados da tarefa
    document.querySelector('#descricao').value = '';
    document.querySelector('#prazo').value = '';
    document.querySelector('#finalizadora').checked = false;

    // Evento para o botão de cancelar
    document.querySelector('#cancelButton').onclick = () => {
        formContainer.remove(); // Remove o formulário ao cancelar
    };

    // Evento para o botão "Salvar"
    document.querySelector('#saveButton').onclick = () => {
        const descricao = document.querySelector('#descricao').value;
        const prazo = document.querySelector('#prazo').value;
        const finalizadora = document.querySelector('#finalizadora').checked ? 1 : 0;

        // Envia os dados de atualização para o servidor
        fetch(`http://34.227.143.202:3000/atualizar-tarefa/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ descricao, prazo, finalizadora })
        })
        .then(response => {
            if (response.ok) {
                alert('Salvo com sucesso!'); // Mensagem de sucesso
                formContainer.remove(); // Fecha o formulário
                location.reload(); // Recarrega a lista
            } else {
                alert('Erro ao salvar a tarefa.'); // Mensagem de erro
            }
        })
        .catch(error => {
            console.error('Erro na requisição:', error);
            alert('Erro inesperado ao salvar a tarefa.');
        });
    };
}


// Saving to local storage (not used here since tasks are sent to the server)
function savelocal(todo) {
    let todos = localStorage.getItem('todos') ? JSON.parse(localStorage.getItem('todos')) : [];
    todos.push(todo);
    localStorage.setItem('todos', JSON.stringify(todos));
}

function getTodos() {
    fetch('http://34.227.143.202:3000/todos')
        .then(response => response.json())
        .then(data => {
            data.forEach(todo => {
                displayTask(todo.titulo); // Use the correct field from your database
            });
        })
        .catch(error => {
            console.error('Erro ao buscar tarefas:', error);
        });
}

function removeLocalTodos(todo) {
    let todos = localStorage.getItem('todos') ? JSON.parse(localStorage.getItem('todos')) : [];
    const todoIndex = todos.indexOf(todo.children[0].innerText);
    todos.splice(todoIndex, 1);
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Change theme function
function changeTheme(color) {
    localStorage.setItem('savedTheme', color);
    savedTheme = localStorage.getItem('savedTheme');
    document.body.className = color;

    color === 'darker' ? document.getElementById('title').classList.add('darker-title') : document.getElementById('title').classList.remove('darker-title');

    document.querySelector('input').className = `${color}-input`;
    document.querySelectorAll('.todo').forEach(todo => {
        Array.from(todo.classList).some(item => item === 'completed') ?
            todo.className = `todo ${color}-todo completed` :
            todo.className = `todo ${color}-todo`;
    });
    document.querySelectorAll('button').forEach(button => {
        Array.from(button.classList).some(item => {
            if (item === 'check-btn') {
                button.className = `check-btn ${color}-button`;
            } else if (item === 'delete-btn') {
                button.className = `delete-btn ${color}-button`;
            } else if (item === 'todo-btn') {
                button.className = `todo-btn ${color}-button`;
            } else if (item === 'edit-btn') {
                button.className = `edit-btn ${color}-button`;
            }
        });
    });
}
