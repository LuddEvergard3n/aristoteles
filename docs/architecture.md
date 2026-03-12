# Arquitectura — Aristóteles

## Decisão de design fundamental

O projecto é deliberadamente **sem framework e sem bundler**. Cada decisão de arquitectura decorre desta premissa:

- **Deploy**: GitHub Pages — site estático puro. Sem servidor, sem CI/CD necessário.
- **Módulos**: ES2022 `import/export` nativos. O browser suporta sem transpilação.
- **Dados**: JSON carregados via `fetch()`. Sem ORM, sem base de dados.
- **Estado**: Singleton em memória (`state.js`). Sem `localStorage`, sem cookies.
- **Estilos**: CSS custom properties + Flexbox/Grid. Sem preprocessador.

A complexidade é mantida deliberadamente baixa. O projecto deve ser legível e modificável por qualquer pessoa com conhecimentos básicos de HTML/CSS/JS.

---

## Padrão de roteamento

Roteamento hash (`#/route/param`). O `router.js` lê `window.location.hash` e despacha para a função de render correspondente.

```
#/                          → renderHome()
#/module/:id                → renderModule({ moduleId })
#/module/:id/lesson/:lessonId → renderLesson({ moduleId, lessonId })
#/author/:id                → renderAuthor({ authorId })
#/school/:id                → renderSchool({ schoolId })
#/concept/:id               → renderConcept({ conceptId })
#/timeline                  → renderTimeline()
#/glossary                  → renderGlossary()
```

Cada rota é registada com `Router.on(name, handler)`. O handler recebe os parâmetros extraídos do hash. A navegação ocorre por `<a href="#/...">` — sem `pushState`, para compatibilidade com GitHub Pages sem configuração de rewrites.

---

## Padrão de estado

`state.js` exporta um singleton `State` com API explícita:

```js
State.get('ui.fontSize')           // lê por caminho de chaves
State.set('ui.teacherMode', true)  // escreve e emite evento
State.subscribe(handler, 'ui.teacherMode')  // observa mudança
State.cacheData('modules', data)   // armazena JSON carregado
State.getData('modules')           // recupera do cache
State.isDataReady()                // verifica se dados obrigatórios estão prontos
```

O bus de eventos é um `EventTarget` interno — não exposto. Os componentes subscrevem via `State.subscribe()` e recebem `{ path, value, prev }`. Não há Proxy, não há reactividade automática.

**Dados obrigatórios** (verificados por `isDataReady()`): `modules`, `authors`, `schools`, `concepts`, `texts`, `lessons`, `exercises`. Os dados opcionais (`arguments`, `timeline`, `essays`) carregam em paralelo mas falhas são silenciosas — as views degradam graciosamente.

---

## Padrão de views

Cada view é uma função pura em `main.js`:

```js
function renderLesson({ moduleId, lessonId }) {
  // 1. Ler dados do State
  // 2. Construir DOM com createElement (sem innerHTML para conteúdo variável)
  // 3. Montar no $main
}
```

Views não guardam estado próprio. Se precisam de estado local (ex: busca no glossário), usam closure. Não há componentes com ciclo de vida — o render é destrutivo (`$main.innerHTML = ''`) seguido de reconstrução.

O `UI.escape()` é chamado em **todos** os valores de dados antes de inserir no DOM — prevenção de XSS por convenção.

---

## Motores

Os motores em `engine/` são módulos com responsabilidade única:

| Motor | Responsabilidade |
|-------|-----------------|
| `reading-engine.js` | Apresentar textos filosóficos com anotações e perguntas intercaladas |
| `argument-engine.js` | Renderizar e verificar exercícios (classify, reconstruct, comparison) |
| `logic-engine.js` | Verificar silogismos categoricos e proposicionais |
| `feedback-engine.js` | Comparações tabulares entre autores |
| `timeline-engine.js` | Renderizar linha do tempo cronológica |
| `hint-system.js` | Dicas progressivas (afecta pontuação) |

Cada motor exporta um objecto com `init(container)` e métodos específicos. Não dependem de `State` directamente — recebem os dados como argumentos. Isso torna-os testáveis de forma independente.

---

## Estrutura de CSS

As folhas de estilo são ordenadas por especificidade crescente:

1. `base.css` — Reset e variáveis CSS (`--color-*`, `--font-*`, `--space-*`). Sem classes.
2. `theme.css` — Paleta completa: pergaminho (`#f5f0e8`), bronze (`#8b6914`), tinta escura (`#2c2416`). Animações GPU-aceleradas.
3. `layout.css` — Grid principal do site, header, footer, `site-main`. Usa `minmax(0, 1fr)` em todos os grids para prevenir overflow.
4. `components.css` — Cards, chips, tags, botões, breadcrumb. Classes reutilizáveis.
5. `mobile.css` — Media queries. Breakpoints: 768px (tablet), 480px (mobile).

**Convenção de overflow**: `overflow-x: clip` em `site-main` (não `overflow-x: hidden` — que cria stacking context e quebra `position: sticky`).

---

## Decisões de acessibilidade

- Skip-link para `#main-content` (visível no focus).
- Breadcrumb com `aria-label="Navegação estrutural"`.
- Todos os ícones decorativos têm `aria-hidden="true"`.
- Atalhos de teclado via `Alt+key` (não conflitam com atalhos de browser em Windows/Linux).
- Contraste mínimo 4.5:1 para texto normal, 3:1 para texto grande.
- Modo de alto contraste (`ui.highContrast`) inverte para fundo escuro com texto claro.

---

## Adicionando conteúdo

Ver `docs/development-guide.md` para instruções passo a passo.

O processo resumido:
1. Editar os JSONs em `data/`
2. Executar `node tests/test-runner.js` — todos os testes devem passar
3. Abrir o browser e verificar visualmente
4. Commit

Nunca editar ficheiros em `js/` ou `engine/` para adicionar conteúdo — os dados e o código são estritamente separados.
