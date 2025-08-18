# Gerenciador de Tarefas (HTML, CSS e JavaScript)

Aplicação web simples e bonita para **criar e organizar tarefas diárias**.  
Inclui **adicionar/editar/excluir**, **marcar como concluída**, **descrição**, **data/hora de criação**, **prioridade** com cor, **filtros** (Pendentes/Concluídas), **ordenação** (data/prioridade) e **contador**.  
Todos os dados ficam salvos no **localStorage** do navegador.

## ✨ Funcionalidades
- **Adicionar, remover e editar tarefas**
- **Marcar como feita/pendente**
- **Descrição** da tarefa
- **Data e hora** de criação (automática)
- **Prioridade** (Alta | Média | Baixa), com **etiqueta colorida**
- **Filtros:** Pendentes (padrão) e Concluídas
- **Ordenação:** Mais recentes | Mais antigas | Prioridade (Alta → Baixa) | (Baixa → Alta)
- **Contador:** Total | Concluídas | Pendentes
- **Persistência:** localStorage

## 🖼️ Interface
Layout escuro, limpo e responsivo, com botões/etiquetas arredondados e feedback visual para tarefas concluídas (título riscado).

## 🚀 Como usar (localmente)
1. Baixe/clonar este repositório.
2. Abra o arquivo `index.html` no navegador (duplo clique).
3. Pronto. As tarefas já serão salvas no seu navegador.

## ⚙️ Detalhes técnicos
- **Manipulação do DOM:** criação/atualização dinâmica da lista, contadores e filtros.
- **Eventos:** submit, click, change.
- **Validação:** impede criar tarefa sem título.
- **Arrays/Objetos:** lista de tarefas é um array de objetos.
- **Funções, loops e condicionais:** organizam a lógica (render, filtros, ordenação, etc.).
- **Ordenação:** por data (`createdAt`) e prioridade (mapa Alta=3, Média=2, Baixa=1).
- **Filtro padrão:** `Pendentes`. Tarefas concluídas **não** aparecem em Pendentes.
