// ============================================
// SELETORES DO DOM
// ============================================
const html = document.querySelector('html');
const focoBt = document.querySelector('.app__card-button--foco');
const curtoBt = document.querySelector('.app__card-button--curto');
const longoBt = document.querySelector('.app__card-button--longo');
const banner = document.querySelector('.app__image');
const titulo = document.querySelector('.app__title');
const botoes = document.querySelectorAll('.app__card-button');
const startPauseBt = document.querySelector('#start-pause');
const musicaFocoInput = document.querySelector('#alternar-musica');
const tempoNaTela = document.querySelector('#timer');

// Elementos de Tarefas
const listaTarefas = document.querySelector('#lista-tarefas');
const btnAdicionarTarefa = document.querySelector('#btn-adicionar-tarefa');
const modalTarefa = document.querySelector('#modal-tarefa');
const inputTarefa = document.querySelector('#input-tarefa');
const btnCancelar = document.querySelector('#btn-cancelar');
const btnSalvar = document.querySelector('#btn-salvar');
const tarefaAtiva = document.querySelector('#tarefa-ativa');
const btnMenuTarefas = document.querySelector('#btn-menu-tarefas');
const dropdownTarefas = document.querySelector('#dropdown-tarefas');
const btnLimparConcluidas = document.querySelector('#btn-limpar-concluidas');
const btnLimparTodas = document.querySelector('#btn-limpar-todas');

// ============================================
// ÁUDIOS
// ============================================
const musica = new Audio('./sons/luna-rise-part-one.mp3');
const audioPlay = new Audio('./sons/play.wav');
const audioPausa = new Audio('./sons/pause.mp3');
const audioTempoFinalizado = new Audio('./sons/beep.mp3');

musica.loop = true;

// ============================================
// VARIÁVEIS DO TIMER
// ============================================
let tempoDecorridoEmSegundos = 1500;
let intervaloId = null;

// ============================================
// VARIÁVEIS DE TAREFAS
// ============================================
let tarefas = JSON.parse(localStorage.getItem('tarefas')) || [];
let tarefaSelecionada = null;
let tarefaEditando = null;

// ============================================
// FUNÇÕES DO TIMER
// ============================================
function alterarContexto(contexto) {
    mostrarTempo();
    botoes.forEach((btn) => btn.classList.remove('active'));
    html.setAttribute('data-contexto', contexto);
    banner.setAttribute('src', `./imagens/${contexto}.png`);
    
    switch (contexto) {
        case 'foco':
            titulo.innerHTML = `
                Otimize sua produtividade,<br>
                <strong class="app__title-strong">mergulhe no que importa.</strong>
            `;
            break;
        case 'descanso-curto':
            titulo.innerHTML = `
                Que tal dar uma respirada?<br>
                <strong class="app__title-strong">Faça uma pausa curta!</strong>
            `;
            break;
        case 'descanso-longo':
            titulo.innerHTML = `
                Hora de voltar à superfície.<br>
                <strong class="app__title-strong">Faça uma pausa longa.</strong>
            `;
            break;
    }
}

function contagemRegressiva() {
    if (tempoDecorridoEmSegundos <= 0) {
        audioTempoFinalizado.play();
        zerar();
        
        // Notificação visual
        if (Notification.permission === 'granted') {
            new Notification('Fokus', {
                body: 'Tempo finalizado! 🎉',
                icon: './imagens/favicon.ico'
            });
        }
        
        // Marca tarefa como concluída se houver uma ativa
        if (tarefaSelecionada) {
            tarefaSelecionada.concluida = true;
            salvarTarefas();
            renderizarTarefas();
            atualizarTarefaAtiva();
        }
        return;
    }
    tempoDecorridoEmSegundos -= 1;
    mostrarTempo();
}

function iniciarOuPausar() {
    if (intervaloId) {
        audioPausa.play();
        zerar();
        return;
    }
    audioPlay.play();
    intervaloId = setInterval(contagemRegressiva, 1000);
    startPauseBt.innerHTML = '<i class="fa-solid fa-pause"></i><span>Pausar</span>';
    startPauseBt.classList.add('timer-running');
    
    // Mostra a tarefa selecionada em andamento
    if (tarefaSelecionada && !tarefaSelecionada.concluida) {
        tarefaAtiva.textContent = tarefaSelecionada.descricao;
        tarefaAtiva.classList.add('em-andamento');
    }
}

function zerar() {
    clearInterval(intervaloId);
    startPauseBt.innerHTML = '<i class="fa-solid fa-play"></i><span>Começar</span>';
    startPauseBt.classList.remove('timer-running');
    tarefaAtiva.classList.remove('em-andamento');
    intervaloId = null;
}

function mostrarTempo() {
    const tempo = new Date(tempoDecorridoEmSegundos * 1000);
    const tempoFormatado = tempo.toLocaleTimeString('pt-BR', { minute: '2-digit', second: '2-digit' });
    tempoNaTela.textContent = tempoFormatado;
}

// ============================================
// FUNÇÕES DE TAREFAS
// ============================================
function salvarTarefas() {
    localStorage.setItem('tarefas', JSON.stringify(tarefas));
}

function criarElementoTarefa(tarefa) {
    const li = document.createElement('li');
    li.classList.add('app__task-item');
    li.dataset.id = tarefa.id;
    
    if (tarefa.concluida) {
        li.classList.add('completed');
    }
    
    if (tarefaSelecionada && tarefaSelecionada.id === tarefa.id) {
        li.classList.add('active');
    }
    
    li.innerHTML = `
        <div class="app__task-checkbox">
            <i class="fa-solid fa-check"></i>
        </div>
        <p class="app__task-text">${tarefa.descricao}</p>
        <div class="app__task-actions">
            <button class="app__task-edit-btn" title="Editar tarefa">
                <i class="fa-solid fa-pen"></i>
            </button>
            <button class="app__task-delete-btn" title="Remover tarefa">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;
    
    // Evento para selecionar tarefa
    li.addEventListener('click', (e) => {
        if (!e.target.closest('.app__task-checkbox') && !e.target.closest('.app__task-actions')) {
            selecionarTarefa(tarefa, li);
        }
    });
    
    // Evento para marcar como concluída
    const checkbox = li.querySelector('.app__task-checkbox');
    checkbox.addEventListener('click', () => {
        tarefa.concluida = !tarefa.concluida;
        salvarTarefas();
        renderizarTarefas();
        if (tarefaSelecionada && tarefaSelecionada.id === tarefa.id) {
            atualizarTarefaAtiva();
        }
    });
    
    // Evento para editar
    const btnEditar = li.querySelector('.app__task-edit-btn');
    btnEditar.addEventListener('click', () => {
        tarefaEditando = tarefa;
        inputTarefa.value = tarefa.descricao;
        modalTarefa.classList.add('active');
        inputTarefa.focus();
    });
    
    // Evento para deletar
    const btnDeletar = li.querySelector('.app__task-delete-btn');
    btnDeletar.addEventListener('click', () => {
        removerTarefa(tarefa.id);
    });
    
    return li;
}

function selecionarTarefa(tarefa, elemento) {
    document.querySelectorAll('.app__task-item').forEach(item => item.classList.remove('active'));
    
    if (tarefaSelecionada && tarefaSelecionada.id === tarefa.id) {
        tarefaSelecionada = null;
    } else {
        tarefaSelecionada = tarefa;
        elemento.classList.add('active');
    }
    
    atualizarTarefaAtiva();
}

function atualizarTarefaAtiva() {
    if (tarefaSelecionada && !tarefaSelecionada.concluida) {
        tarefaAtiva.textContent = tarefaSelecionada.descricao;
    } else {
        tarefaAtiva.textContent = 'Selecione uma tarefa';
        tarefaSelecionada = null;
    }
}

function renderizarTarefas() {
    listaTarefas.innerHTML = '';
    tarefas.forEach(tarefa => {
        const elemento = criarElementoTarefa(tarefa);
        listaTarefas.appendChild(elemento);
    });
}

function adicionarTarefa(descricao) {
    const novaTarefa = {
        id: Date.now(),
        descricao: descricao.trim(),
        concluida: false
    };
    tarefas.push(novaTarefa);
    salvarTarefas();
    renderizarTarefas();
}

function editarTarefa(descricao) {
    const index = tarefas.findIndex(t => t.id === tarefaEditando.id);
    if (index !== -1) {
        tarefas[index].descricao = descricao.trim();
        salvarTarefas();
        renderizarTarefas();
        if (tarefaSelecionada && tarefaSelecionada.id === tarefaEditando.id) {
            tarefaSelecionada.descricao = descricao.trim();
            atualizarTarefaAtiva();
        }
    }
    tarefaEditando = null;
}

function removerTarefa(id) {
    if (confirm('Deseja remover esta tarefa?')) {
        tarefas = tarefas.filter(t => t.id !== id);
        if (tarefaSelecionada && tarefaSelecionada.id === id) {
            tarefaSelecionada = null;
        }
        salvarTarefas();
        renderizarTarefas();
        atualizarTarefaAtiva();
    }
}

function limparTarefasConcluidas() {
    tarefas = tarefas.filter(t => !t.concluida);
    salvarTarefas();
    renderizarTarefas();
    atualizarTarefaAtiva();
}

function limparTodasTarefas() {
    if (confirm('Tem certeza que deseja excluir todas as tarefas?')) {
        tarefas = [];
        tarefaSelecionada = null;
        salvarTarefas();
        renderizarTarefas();
        atualizarTarefaAtiva();
    }
}

// ============================================
// EVENT LISTENERS - TIMER
// ============================================
musicaFocoInput.addEventListener('change', () => {
    if (musica.paused) {
        musica.play();
    } else {
        musica.pause();
    }
});

focoBt.addEventListener('click', () => {
    tempoDecorridoEmSegundos = 1500;
    alterarContexto('foco');
    focoBt.classList.add('active');
});

curtoBt.addEventListener('click', () => {
    tempoDecorridoEmSegundos = 300;
    alterarContexto('descanso-curto');
    curtoBt.classList.add('active');
});

longoBt.addEventListener('click', () => {
    tempoDecorridoEmSegundos = 900;
    alterarContexto('descanso-longo');
    longoBt.classList.add('active');
});

startPauseBt.addEventListener('click', iniciarOuPausar);

// ============================================
// EVENT LISTENERS - TAREFAS
// ============================================
btnAdicionarTarefa.addEventListener('click', () => {
    tarefaEditando = null;
    inputTarefa.value = '';
    modalTarefa.classList.add('active');
    inputTarefa.focus();
});

btnCancelar.addEventListener('click', () => {
    modalTarefa.classList.remove('active');
    tarefaEditando = null;
});

btnSalvar.addEventListener('click', () => {
    const descricao = inputTarefa.value.trim();
    if (descricao) {
        if (tarefaEditando) {
            editarTarefa(descricao);
        } else {
            adicionarTarefa(descricao);
        }
        modalTarefa.classList.remove('active');
    }
});

inputTarefa.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        btnSalvar.click();
    }
});

// Fechar modal ao clicar fora
modalTarefa.addEventListener('click', (e) => {
    if (e.target === modalTarefa) {
        modalTarefa.classList.remove('active');
        tarefaEditando = null;
    }
});

// Menu dropdown
btnMenuTarefas.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownTarefas.classList.toggle('active');
});

document.addEventListener('click', () => {
    dropdownTarefas.classList.remove('active');
});

btnLimparConcluidas.addEventListener('click', () => {
    limparTarefasConcluidas();
    dropdownTarefas.classList.remove('active');
});

btnLimparTodas.addEventListener('click', () => {
    limparTodasTarefas();
    dropdownTarefas.classList.remove('active');
});

// ============================================
// INICIALIZAÇÃO
// ============================================
// Solicitar permissão para notificações
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Renderizar tarefas salvas
renderizarTarefas();

// Mostrar tempo inicial
mostrarTempo();

// Atalhos de teclado
document.addEventListener('keydown', (e) => {
    // Espaço para iniciar/pausar (quando não estiver no input)
    if (e.code === 'Space' && document.activeElement !== inputTarefa) {
        e.preventDefault();
        iniciarOuPausar();
    }
    
    // Escape para fechar modal
    if (e.key === 'Escape' && modalTarefa.classList.contains('active')) {
        modalTarefa.classList.remove('active');
        tarefaEditando = null;
    }
});