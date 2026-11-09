'use strict';

// Dados iniciais demonstrativos. As alterações ficam salvas no localStorage do navegador.
const CHAVE_PETS = 'petmatch_pets_v1';
const CHAVE_SOLICITACOES = 'petmatch_solicitacoes_v1';

const petsIniciais = [
  { id: 1, nome: 'Mel', especie: 'Cão', raca: 'SRD', idade: '2 anos', porte: 'Médio', emoji: '🐶', descricao: 'Carinhosa, brincalhona e adora passeios.', status: 'Disponível' },
  { id: 2, nome: 'Luna', especie: 'Gato', raca: 'SRD', idade: '1 ano', porte: 'Pequeno', emoji: '🐱', descricao: 'Curiosa e tranquila, gosta de ambientes acolhedores.', status: 'Disponível' },
  { id: 3, nome: 'Thor', especie: 'Cão', raca: 'SRD', idade: '4 anos', porte: 'Grande', emoji: '🐕', descricao: 'Companheiro e cheio de energia.', status: 'Disponível' },
  { id: 4, nome: 'Nina', especie: 'Gato', raca: 'SRD', idade: '8 meses', porte: 'Pequeno', emoji: '🐈', descricao: 'Dócil e sociável, gosta de brincar.', status: 'Disponível' },
  { id: 5, nome: 'Pingo', especie: 'Cão', raca: 'SRD', idade: '3 anos', porte: 'Pequeno', emoji: '🐕‍🦺', descricao: 'Pequeno no tamanho e enorme no carinho.', status: 'Disponível' },
  { id: 6, nome: 'Amora', especie: 'Gato', raca: 'SRD', idade: '2 anos', porte: 'Médio', emoji: '🐈‍⬛', descricao: 'Independente, calma e muito companheira.', status: 'Disponível' }
];

let pets = carregar(CHAVE_PETS, petsIniciais);
let solicitacoes = carregar(CHAVE_SOLICITACOES, []);

const listaPets = document.getElementById('lista-pets');
const petsVazio = document.getElementById('pets-vazio');
const petsCount = document.getElementById('pets-count');
const selectPet = document.getElementById('pet-escolhido');
const tabelaSolicitacoes = document.getElementById('tabela-solicitacoes');
const formAdocao = document.getElementById('form-adocao');

function carregar(chave, padrao) {
  try {
    const salvo = localStorage.getItem(chave);
    return salvo ? JSON.parse(salvo) : padrao;
  } catch (erro) {
    console.error('Não foi possível ler os dados salvos:', erro);
    return padrao;
  }
}

function salvar() {
  localStorage.setItem(CHAVE_PETS, JSON.stringify(pets));
  localStorage.setItem(CHAVE_SOLICITACOES, JSON.stringify(solicitacoes));
}

function criarElemento(tag, classe, texto) {
  const elemento = document.createElement(tag);
  if (classe) elemento.className = classe;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

function obterPet(id) {
  return pets.find((pet) => pet.id === Number(id));
}

function renderizarPets() {
  listaPets.replaceChildren();
  const termo = document.getElementById('busca').value.trim().toLocaleLowerCase('pt-BR');
  const especie = document.getElementById('filtro-especie').value;
  const porte = document.getElementById('filtro-porte').value;

  const filtrados = pets.filter((pet) => {
    const nomeCorresponde = pet.nome.toLocaleLowerCase('pt-BR').includes(termo);
    const especieCorresponde = especie === 'todas' || pet.especie === especie;
    const porteCorresponde = porte === 'todos' || pet.porte === porte;
    return nomeCorresponde && especieCorresponde && porteCorresponde;
  });

  filtrados.forEach((pet) => {
    const card = criarElemento('article', 'pet-card');
    const visual = criarElemento('div', 'pet-visual', pet.emoji);
    visual.setAttribute('aria-label', `Representação ilustrativa de ${pet.especie.toLowerCase()}`);
    visual.setAttribute('role', 'img');
    const conteudo = criarElemento('div', 'pet-content');
    const status = criarElemento('span', `status ${pet.status === 'Adotado' ? 'adopted' : ''}`, pet.status);
    const nome = criarElemento('h3', '', pet.nome);
    const meta = criarElemento('p', 'pet-meta', `${pet.especie} · ${pet.raca} · ${pet.idade} · Porte ${pet.porte}`);
    const descricao = criarElemento('p', 'pet-description', pet.descricao);
    const botao = criarElemento('button', 'button button-primary', pet.status === 'Disponível' ? 'Quero adotar' : 'Indisponível');
    botao.type = 'button';
    botao.disabled = pet.status !== 'Disponível';
    botao.addEventListener('click', () => {
      selectPet.value = String(pet.id);
      document.getElementById('adocao').scrollIntoView({ behavior: 'smooth' });
      selectPet.focus();
    });
    conteudo.append(status, nome, meta, descricao, botao);
    card.append(visual, conteudo);
    listaPets.append(card);
  });

  petsVazio.hidden = filtrados.length !== 0;
  petsCount.textContent = `${filtrados.length} ${filtrados.length === 1 ? 'animal encontrado' : 'animais encontrados'}`;
  renderizarOpcoesPets();
}

function renderizarOpcoesPets() {
  const valorAtual = selectPet.value;
  selectPet.replaceChildren();
  const inicial = criarElemento('option', '', 'Selecione um animal');
  inicial.value = '';
  selectPet.append(inicial);
  pets.filter((pet) => pet.status === 'Disponível').forEach((pet) => {
    const opcao = criarElemento('option', '', `${pet.nome} — ${pet.especie}`);
    opcao.value = String(pet.id);
    selectPet.append(opcao);
  });
  if ([...selectPet.options].some((opcao) => opcao.value === valorAtual)) selectPet.value = valorAtual;
}

function renderizarSolicitacoes() {
  tabelaSolicitacoes.replaceChildren();
  if (solicitacoes.length === 0) {
    const linha = criarElemento('tr');
    const celula = criarElemento('td', '', 'Nenhuma solicitação cadastrada.');
    celula.colSpan = 5;
    linha.append(celula);
    tabelaSolicitacoes.append(linha);
    return;
  }

  solicitacoes.forEach((solicitacao) => {
    const linha = criarElemento('tr');
    const pet = obterPet(solicitacao.petId);
    linha.append(
      criarElemento('td', '', solicitacao.nome),
      criarElemento('td', '', pet ? pet.nome : 'Pet removido'),
      criarElemento('td', '', solicitacao.data),
      criarElemento('td', '', solicitacao.status)
    );
    const acoes = criarElemento('td');
    const grupo = criarElemento('div', 'action-group');
    const aprovar = criarElemento('button', 'small-button', 'Aprovar');
    aprovar.type = 'button';
    aprovar.disabled = solicitacao.status !== 'Em análise' || !pet || pet.status !== 'Disponível';
    aprovar.addEventListener('click', () => atualizarSolicitacao(solicitacao.id, 'Aprovada'));
    const recusar = criarElemento('button', 'small-button reject', 'Recusar');
    recusar.type = 'button';
    recusar.disabled = solicitacao.status !== 'Em análise';
    recusar.addEventListener('click', () => atualizarSolicitacao(solicitacao.id, 'Recusada'));
    grupo.append(aprovar, recusar);
    acoes.append(grupo);
    linha.append(acoes);
    tabelaSolicitacoes.append(linha);
  });
}

function renderizar() {
  renderizarPets();
  renderizarSolicitacoes();
}

function atualizarSolicitacao(id, novoStatus) {
  const solicitacao = solicitacoes.find((item) => item.id === id);
  if (!solicitacao || solicitacao.status !== 'Em análise') return;
  const pet = obterPet(solicitacao.petId);

  if (novoStatus === 'Aprovada') {
    if (!pet || pet.status !== 'Em processo') {
      alert('Este pet não está mais disponível para esta solicitação.');
      return;
    }
    pet.status = 'Adotado';
    solicitacao.status = novoStatus; // Mantém no histórico se for aprovada
  } else if (novoStatus === 'Recusada') {
    if (pet && pet.status === 'Em processo') {
      pet.status = 'Disponível';
    }
    // Remove a solicitação do array de solicitações para ela sumir do histórico
    solicitacoes = solicitacoes.filter((item) => item.id !== id);
  }

  salvar();
  renderizar();
}

function mostrarErro(campo, mensagem) {
  const entrada = document.getElementById(campo);
  const erro = document.getElementById(`${campo}-erro`);
  if (entrada) entrada.setAttribute('aria-invalid', mensagem ? 'true' : 'false');
  if (erro) {
    erro.textContent = mensagem;
    erro.hidden = !mensagem;
  }
}

function validar(dados) {
  const erros = {};
  if (dados.nome.trim().length < 3) erros.adotante = 'Informe um nome com pelo menos 3 caracteres.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) erros.email = 'Informe um e-mail válido.';
  const pet = obterPet(dados.petId);
  // Correção: alterado de 'pet-escolhido' para 'pet' para coincidir com o ID do span de erro no HTML (pet-erro)
  if (!pet || pet.status !== 'Disponível') erros['pet'] = 'Selecione um pet que ainda esteja disponível.';
  if (dados.motivo.trim().length < 5) erros.motivo = 'Conte um pouco mais: escreva pelo menos 5 caracteres.';
  return erros;
}

formAdocao.addEventListener('submit', (evento) => {
  evento.preventDefault();
  const dados = {
    nome: document.getElementById('adotante').value,
    email: document.getElementById('email').value.trim(),
    petId: Number(selectPet.value),
    motivo: document.getElementById('motivo').value
  };
  const erros = validar(dados);
  // Correção: ajustado o nome do campo para 'pet' correspondendo ao elemento de erro corrigido acima
  ['adotante', 'email', 'pet', 'motivo'].forEach((campo) => mostrarErro(campo, erros[campo] || ''));
  const feedback = document.getElementById('form-feedback');
  if (Object.keys(erros).length > 0) {
    feedback.textContent = 'Revise os campos indicados antes de enviar.';
    feedback.style.color = 'var(--danger)';
    const primeiroErro = Object.keys(erros)[0];
    const elementoFoco = document.getElementById(primeiroErro);
    if (elementoFoco) elementoFoco.focus();
    return;
  }

  const pet = obterPet(dados.petId);
  // Regra de negócio: um pet só pode ter uma solicitação ativa por vez.
  const jaExisteAtiva = solicitacoes.some((item) => item.petId === dados.petId && item.status === 'Em análise');
  if (jaExisteAtiva) {
    feedback.textContent = 'Este pet já possui uma solicitação em análise.';
    feedback.style.color = 'var(--danger)';
    return;
  }
  if (!pet || pet.status !== 'Disponível') {
    feedback.textContent = 'Este pet não está disponível para adoção.';
    feedback.style.color = 'var(--danger)';
    return;
  }

  solicitacoes.push({
    id: Date.now(),
    nome: dados.nome.trim(),
    email: dados.email,
    petId: dados.petId,
    motivo: dados.motivo.trim(),
    data: new Date().toLocaleDateString('pt-BR'),
    status: 'Em análise'
  });
  pet.status = 'Em processo';
  salvar();
  renderizar();
  formAdocao.reset();
  feedback.textContent = 'Solicitação registrada! A equipe poderá analisar o pedido.';
  feedback.style.color = 'var(--green-dark)';
});

document.getElementById('filtro-form').addEventListener('submit', (evento) => {
  evento.preventDefault();
  renderizarPets();
});
document.getElementById('busca').addEventListener('input', renderizarPets);
document.getElementById('filtro-especie').addEventListener('change', renderizarPets);
document.getElementById('filtro-porte').addEventListener('change', renderizarPets);

renderizar();