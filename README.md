# Aristóteles

Sistema educacional de filosofia para leitura, análise e debate de textos filosóficos. Parte do ecossistema de projectos educacionais sob o handle [@LuddEvergard3n](https://github.com/LuddEvergard3n).

**Versão:** v1.19.0  
**Motor:** JavaScript ES2022 modular, sem frameworks  
**Deploy:** GitHub Pages (site estático)

---

## Sumário

- [Execução local](#execução-local)
- [Estrutura do projecto](#estrutura-do-projecto)
- [Módulos de conteúdo](#módulos-de-conteúdo)
- [Arquitectura de dados](#arquitectura-de-dados)
- [Motor de exercícios](#motor-de-exercícios)
- [Sistema de leitura](#sistema-de-leitura)
- [Testes](#testes)
- [Atalhos de teclado](#atalhos-de-teclado)

---

## Execução local

```bash
# Qualquer servidor HTTP estático serve. Exemplos:
python3 -m http.server 8080
# ou
npx serve .
# ou
npx http-server .
```

Abrir `http://localhost:8080`. **Não abrir `index.html` directamente como `file://`** — os módulos ES e os fetches de JSON falham sem servidor HTTP.

---

## Estrutura do projecto

```
aristoteles/
├── index.html              # Ponto de entrada único (SPA)
├── css/
│   ├── base.css            # Reset, tipografia, variáveis CSS
│   ├── theme.css           # Paleta: pergaminho, mármore, bronze
│   ├── layout.css          # Grid principal, header, footer
│   ├── components.css      # Cards, chips, tags, botões
│   └── mobile.css          # Breakpoints responsivos
├── js/
│   ├── main.js             # Ponto de entrada, views, init()
│   ├── router.js           # Roteador hash (#/module/id)
│   ├── state.js            # Estado global singleton (EventTarget)
│   ├── ui.js               # Utilitários DOM, loading, breadcrumb
│   └── accessibility.js    # Atalhos de teclado, skip-links, ARIA
├── engine/
│   ├── reading-engine.js   # Leitor de textos filosóficos com anotações
│   ├── logic-engine.js     # Verificação de argumentos e silogismos
│   ├── argument-engine.js  # Motor de exercícios (classify, reconstruct, compare)
│   ├── feedback-engine.js  # Comparação de autores e tabelas
│   ├── comparison-engine.js
│   ├── timeline-engine.js  # Renderização da linha do tempo
│   └── hint-system.js      # Sistema de dicas progressivas
├── data/
│   ├── modules.json        # 9 módulos activos
│   ├── lessons.json        # 42 lições com sections completas
│   ├── texts.json          # 37 textos filosóficos primários
│   ├── exercises.json      # 53 exercícios (classify/reconstruct/compare)
│   ├── authors.json        # 25 autores com biografia (~196w), método (~74w) e obras
│   ├── schools.json        # 12 escolas filosóficas
│   ├── concepts.json       # 52 conceitos com etimologia, extended (~144w) e related_concepts
│   ├── essays.json         # 42 ensaios explicativos (~29.335 palavras, 5 secções cada)
│   ├── timeline.json       # 56 entradas cronológicas
│   └── arguments.json      # Argumentos formalizados
├── tests/
│   ├── test-runner.js      # Runner minimalista (Node.js, sem dependências)
│   ├── data-tests.js       # Integridade referencial dos JSONs
│   ├── module-tests.js     # Consistência dos módulos e lições
│   └── engine-tests.js     # Testes dos motores
└── docs/
    ├── architecture.md     # Decisões de arquitectura e padrões
    ├── content-model.md    # Esquemas de todos os JSONs
    ├── modules.md          # Referência completa de todos os módulos
    ├── pedagogy.md         # Modelo pedagógico e progressão
    ├── reading-system.md   # Sistema de leitura guiada
    ├── logic-system.md     # Motor de lógica e silogismos
    └── development-guide.md # Guia para adicionar conteúdo
```

---

## Módulos de conteúdo

Nove módulos activos, ordenados por progressão pedagógica:

| # | ID | Título | Lições | Duração |
|---|-----|--------|--------|---------|
| 1 | `intro` | Introdução à Filosofia | 3 | 3–4h |
| 2 | `logic` | Lógica e Argumentação | 5 | 8–10h |
| 3 | `greek-philosophy` | Os Três Gregos | 5 | 8–10h |
| 4 | `schools` | Escolas Filosóficas | 4 | 6–8h |
| 5 | `currents` | Correntes Filosóficas | 5 | 15–18h |
| 6 | `ethics` | Ética | 5 | 8–10h |
| 7 | `epistemology` | Epistemologia | 4 | 6–8h |
| 8 | `medieval` | Filosofia Medieval | 4 | 6–8h |
| 9 | `modern` | Filosofia Moderna e Contemporânea | 7 | 10–12h |

**Total:** 42 lições, ~70–90 horas de conteúdo.

Cada lição contém:
- `introduction` — parágrafo introdutório (~200 palavras)
- `question` — pergunta filosófica central
- `problem` — situação concreta que motiva a questão
- `sections[]` — 4–5 seções de conteúdo (~300–500 palavras cada, média 698w/lição)
- `text_ids[]` — textos primários associados (de `texts.json`)
- `exercise_ids[]` — exercícios associados (de `exercises.json`)
- `authors[]` — autores relevantes
- `concepts[]` — conceitos introduzidos ou usados

---

## Arquitectura de dados

Todos os dados vivem em `data/*.json`. Não há backend nem base de dados. O carregamento é feito em `main.js` via `fetch()` em paralelo na inicialização.

### Referências entre entidades

```
modules.json
  └─ lessons[] (ids) ──→ lessons.json
       ├─ text_ids[]  ──→ texts.json
       ├─ exercise_ids[] ──→ exercises.json
       ├─ authors[]   ──→ authors.json
       └─ concepts[]  ──→ concepts.json

authors.json
  └─ school ──→ schools.json
  └─ related_authors[] ──→ authors.json

essays.json
  └─ entity_id ──→ [authors|schools|currents].json
```

A integridade referencial é verificada pelos testes (`data-tests.js`). Qualquer referência a um id inexistente falha os testes.

### Estado em memória

O estado global vive em `js/state.js` (singleton). Não usa `localStorage` — o estado é perdido ao fechar o browser, por decisão explícita (privacidade, simplicidade). O progresso do utilizador (lições completadas, exercícios resolvidos) existe apenas na sessão corrente.

---

## Motor de exercícios

`engine/argument-engine.js` trata três tipos de exercício:

**`classify`** — O aluno classifica itens numa de N categorias. Cada item tem `correct` (a resposta correcta) e `explanation` (explicação detalhada da resposta e das distratoras). Suporta `items[]` para exercícios de classificação múltipla.

**`reconstruct`** — O aluno reconstrói a ordem correcta de passos de um argumento (drag-and-drop ou selecção sequencial). Cada passo tem `prompt`, `model_answer` e `keywords`. O campo `correct_order` define a sequência canónica.

**`comparison`** — O aluno atribui posições filosóficas a autores. Cada `position` tem `author_hint` e `correct_author`. Útil para distinguir posições de filósofos sobre a mesma questão.

O `hint-system.js` oferece dicas progressivas: a primeira dica é genérica, as seguintes são mais específicas. O número de dicas usadas afecta a pontuação.

---

## Sistema de leitura

`engine/reading-engine.js` apresenta textos filosóficos com:

- Anotações marginais activadas por hover/click
- Modo de leitura lenta (one-paragraph-at-a-time)
- Dicionário de termos técnicos inline (ligado a `concepts.json`)
- Perguntas de compreensão intercaladas
- Modo professor (activo via `Alt+P`) que mostra `teacher_notes`

Os textos em `texts.json` têm estrutura `paragraphs[]`, onde cada parágrafo pode ter `annotations[]` e `questions[]`.

---

## Testes

```bash
node tests/test-runner.js
```

Requer Node.js ≥ 18. Sem dependências externas. Saída: `N passou, M falhou`.

**82 testes** em três suites:

- `data-tests.js` — Integridade referencial: todos os ids referenciados existem, campos obrigatórios presentes, formatos correctos.
- `module-tests.js` — Consistência dos módulos: lições existem, ordem correcta, duração preenchida.
- `engine-tests.js` — Lógica dos motores: silogismos classificados correctamente, exercícios com estrutura válida.

---

## Atalhos de teclado

| Atalho | Acção |
|--------|-------|
| `Alt+H` | Ir para a página inicial |
| `Alt+G` | Abrir o glossário |
| `Alt+T` | Abrir a linha do tempo |
| `Alt+R` | Abrir o mapa de relações |
| `Alt+P` | Activar/desactivar modo professor |
| `Alt++` | Aumentar tamanho de fonte |
| `Alt+-` | Diminuir tamanho de fonte |

---

## Páginas estáticas

Além da aplicação principal (`index.html`), o projecto inclui três páginas estáticas:

| Página | Template | Conteúdo |
|--------|----------|----------|
| `sobre.html` | Coluna única 860px | O que é o projecto, por que o nome, métricas, ecossistema |
| `guia-professor.html` | Sidebar 220px + conteúdo | 5 atividades prontas para sala, modos do sistema, mapa de módulos |
| `plano-aula.html` | Dois painéis 470px + 1fr | Gerador com BNCC-CHS, presets, geração e impressão/PDF |

---

## Ecossistema

Projectos educacionais com a mesma filosofia de design e deploy em GitHub Pages:

| Projecto | Disciplina | Repositório | Site |
|----------|------------|-------------|------|
| **Humboldt** | Geografia | [github.com/LuddEvergard3n/humboldt](https://github.com/LuddEvergard3n/humboldt) | [luddevergard3n.github.io/humboldt](https://luddevergard3n.github.io/humboldt/) |
| **Johnson** | Inglês | [github.com/LuddEvergard3n/johnson-english](https://github.com/LuddEvergard3n/johnson-english) | [luddevergard3n.github.io/johnson-english](https://luddevergard3n.github.io/johnson-english/) |
| **Aristóteles** | Filosofia | *(este repositório)* | — |

Os projectos partilham o mesmo sistema de variáveis CSS, tipografia (Cormorant Garamond / EB Garamond) e paleta de pergaminho, garantindo identidade visual consistente em todo o ecossistema.
