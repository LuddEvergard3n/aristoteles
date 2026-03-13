# Changelog

Todas as alterações relevantes deste projeto serão documentadas aqui.
Formato: [Versão] — Data — Descrição

---


## [1.10.0] — 2026-03-11

### Três novas páginas estáticas + links do ecossistema

**Novas páginas (padrões de design do Heródoto aplicados):**
- `sobre.html` — Coluna única 860px: o que é o projecto, por que o nome Aristóteles,
  métricas v1.10.0, filosofia do projecto, secção ecossistema com eco-cards
- `guia-professor.html` — Sidebar sticky 220px + flex:1: 5 atividades prontas para
  sala de aula (cards com header vermelho, meta-tags azuis, nível, duração, modo),
  tabela de modos do sistema, mapa de percursos, callouts aviso/nota
- `plano-aula.html` — Dois painéis 470px + 1fr: 16 habilidades BNCC-CHS para EM
  (sem segmentação por série, conforme BNCC), EF8/EF9, presets de objetivos /
  metodologia / recursos / avaliação, geração de documento, impressão/PDF via
  window.print() com @media print completo (print-color-adjust: exact)

**index.html:** 3 links adicionados ao header-nav (Guia do Professor, Plano de Aula, Sobre)

**README.md:** versão actualizada para v1.10.0, secção Páginas Estáticas adicionada,
secção Ecossistema com links para Humboldt (Geografia) e Johnson (Inglês)

**Ecossistema referenciado:**
- Humboldt — Geografia: https://github.com/LuddEvergard3n/humboldt
  — https://luddevergard3n.github.io/humboldt/
- Johnson — Inglês: https://github.com/LuddEvergard3n/johnson-english
  — https://luddevergard3n.github.io/johnson-english/

---
## [1.0.0] — 2025-03-09

### Adicionado

**Arquitetura**
- Estrutura completa do projeto: `css/`, `js/`, `engine/`, `data/`, `tests/`, `docs/`
- Roteamento client-side por hash (`router.js`) com suporte a 9 rotas: home, module, lesson, author, school, concept, timeline, glossary, problem
- Estado global de sessão em memória (`state.js`) com EventTarget para notificações
- Utilitários de interface: escape HTML, modais, notificações, breadcrumb, highlight de busca (`ui.js`)
- Acessibilidade: skip link, atalhos de teclado, aria-live, preferências de sistema operacional (`accessibility.js`)
- Entry point modular (`main.js`) com carregamento paralelo de todos os JSONs via `Promise.all`

**Motores**
- `reading-engine.js` — exibição de textos filosóficos, modo livre e modo guiado, destaque de termos, notas contextuais, navegação por segmento
- `logic-engine.js` — validação de argumentos, reconstrução de silogismos, catálogo de falácias formais e informais, detecção heurística de marcadores argumentativos, comparação de argumentos
- `argument-engine.js` — execução de 5 tipos de exercício: classify, mark-premises, reconstruct (drag & drop), mapping, comparison; avaliação automática com feedback estruturado
- `feedback-engine.js` — painéis de feedback por item, sistema de dicas progressivas
- `ComparisonEngine` — comparação tabular de autores e escolas em dimensões configuráveis
- `TimelineEngine` — linha do tempo por era, filtro dinâmico, painéis expandíveis por filósofo

**Dados (conteúdo inicial)**
- `authors.json` — 10 autores completos: Sócrates, Platão, Aristóteles, Heráclito, Parmênides, Descartes, Hume, Kant, Tomás de Aquino, Agostinho (com biografia, método, ideias centrais, obras)
- `schools.json` — 12 escolas: pré-socrática, sofistas, socrática, platonismo, aristotelismo, estoicismo, epicurismo, ceticismo, escolástica, racionalismo, empirismo, existencialismo
- `concepts.json` — 22 conceitos com etimologia, definição, extensão, exemplos e relações
- `texts.json` — 7 excertos filosóficos com leitura guiada: Aristóteles (admiração, Nicômaco, virtude), Platão (caverna, missão de Sócrates), Descartes (Meditação I, Meditação II — cogito)
- `lessons.json` — 9 lições estruturadas com pergunta, problema, conceitos, autores, exercícios, notas do professor e aplicação contemporânea
- `exercises.json` — 8 exercícios de 5 tipos distintos com gabarito e dicas
- `arguments.json` — 6 argumentos filosóficos formalizados: silogismo de Sócrates, eudaimonia, cogito, Teoria das Ideias, Primeira Via, Hume sobre causalidade
- `modules.json` — 9 módulos (5 ativos, 4 planejados)
- `timeline.json` — 31 filósofos com ano, era, escola e significado histórico

**Interface**
- Design: paleta pergaminho/mármore/bronze/tinta escura; tipografia serifada (EB Garamond + Cormorant Garamond)
- CSS modular: `base.css`, `theme.css`, `layout.css`, `components.css`, `mobile.css`
- Mobile-first responsivo: breakpoints em 900px e 600px
- Modo professor (Alt+P) com notas pedagógicas ocultas por padrão
- Controles de acessibilidade: tamanho de fonte (3 níveis), alto contraste, skip link
- Ornamentos tipográficos, capitular drop, animações de entrada com `prefers-reduced-motion`
- Suporte a impressão via `@media print`

**Testes**
- Runner Node.js (`test-runner.js`) com 75 testes
- `data-tests.js` — integridade de todos os JSONs e referências cruzadas
- `module-tests.js` — consistência entre módulos, presença de conteúdo obrigatório
- `engine-tests.js` — testes unitários de LogicEngine, ArgumentEngine, State, Router, UI

**Documentação**
- `README.md` com instruções de execução, estrutura, módulos ativos e atalhos
- `docs/architecture.md`, `docs/pedagogy.md`, `docs/modules.md`, `docs/reading-system.md`, `docs/logic-system.md`, `docs/content-model.md`, `docs/development-guide.md`
- `CHANGELOG.md`
- `package.json` com script `npm test`

---

## [1.1.0] — 2026-03-09

### Módulo Escolas Filosóficas (`schools`) — ativo

**4 novas lições**
- `pre-socratic-arche` — Os primeiros filósofos: a questão do arché (Tales, Anaximandro, Anaxímenes, Heráclito)
- `sophists-relativism` — Os Sofistas: a verdade é de cada um? (Protágoras, Górgias)
- `stoicism-control` — O Estoicismo: o que está em nosso poder? (Zenão, Epicteto, Marco Aurélio)
- `epicureanism-pleasure` — O Epicurismo: o prazer como guia de vida (Epicuro)

**9 novos autores**
- Pré-socráticos: Tales de Mileto, Anaximandro, Anaxímenes
- Sofistas: Protágoras de Abdera, Górgias de Leontinos
- Estoicos: Zenão de Cítio, Epicteto, Marco Aurélio
- Epicuristas: Epicuro de Samos

**5 novos textos com leitura guiada**
- Aristóteles sobre o arché dos milésios (Metafísica I, 3)
- O homem como medida de todas as coisas (Platão, Teeteto 152a–b)
- Sobre o Não-Ser: os três argumentos de Górgias (Sexto Empírico)
- O que depende de nós — abertura do Enchiridion (Epicteto)
- Carta a Meneceu — sobre a morte e o prazer (Epicuro)

**6 novos exercícios**
- Classificar o arché de cada pré-socrático (tipo: classify, dif. 1)
- Relativismo ou objetivismo? (tipo: classify, dif. 2)
- Protágoras e Platão sobre o conhecimento (tipo: comparison, dif. 3)
- O que depende de nós? — dicotomia estóica (tipo: classify, dif. 2)
- Tipos de desejo e prazer em Epicuro (tipo: classify, dif. 3)
- O argumento de Epicuro sobre a morte (tipo: reconstruct, dif. 3)

**4 novos conceitos no glossário**
- `arché` — princípio originário e constitutivo de todas as coisas
- `physis` — natureza como totalidade dinâmica
- `ataraxia` — tranquilidade da alma como bem supremo
- `relativismo` — verdade relativa ao sujeito ou cultura

**9 novas entradas na linha do tempo** (Tales a Marco Aurélio)

---

## [1.2.0] — 2026-03-09

### Módulo Epistemologia (`epistemology`) — ativo

**4 novas lições**
- `epistemology-what-is-knowledge` — O que é conhecimento? JTB e o problema de Gettier (Platão, Teeteto)
- `epistemology-hume-induction` — Hume e o problema da indução: por que o passado não garante o futuro
- `epistemology-kant-copernican` — A virada copernicana de Kant: o sujeito estrutura o objeto
- `epistemology-limits` — Os limites do conhecimento: síntese comparativa (Descartes, Hume, Kant)

**5 novos textos com leitura guiada**
- O que é conhecimento? — Teeteto (Platão, 200d–201c)
- O problema de Gettier (apresentação do artigo de 1963)
- Causalidade, costume e o problema da indução (Hume, Investigação IV e VII)
- A revolução copernicana de Kant (Crítica da Razão Pura, Prefácio B xvi)
- Fenômeno e coisa-em-si (Kant, Crítica da Razão Pura)

**6 novos exercícios**
- Crença verdadeira justificada — ou não? Casos Gettier (tipo: classify, dif. 3)
- A priori ou a posteriori? (tipo: classify, dif. 2)
- Indução ou dedução? (tipo: classify, dif. 2)
- O argumento de Hume sobre causalidade (tipo: reconstruct, dif. 3)
- Fenômeno e coisa-em-si em Kant (tipo: mapping, dif. 3)
- Hume e Kant sobre o fundamento do conhecimento (tipo: comparison, dif. 4)

**6 novos conceitos no glossário**
- `justificação` — o que torna uma crença racionalmente sustentável
- `ceticismo` — questionamento da possibilidade ou alcance do conhecimento
- `fenômeno` — objetos tal como aparecem ao sujeito cognoscente (Kant)
- `noumenon` — coisa-em-si, além do alcance do conhecimento possível
- `a priori / a posteriori` — distinção kantiana: independente vs. dependente da experiência
- `indução` — raciocínio do particular para o geral; problema formulado por Hume

---

## [1.3.0] — 2026-03-09

### Módulo Ética (`ethics`) — ativo

**5 novas lições**
- `ethics-what-is-ethics` — O que é ética? Mapeamento das três tradições
- `ethics-kant-deontology` — A ética do dever: Kant e o imperativo categórico
- `ethics-utilitarianism` — A ética das consequências: Mill e o princípio da maior felicidade
- `ethics-virtue` — A ética do caráter: Aristóteles e a vida virtuosa
- `ethics-applied-comparison` — Ética aplicada: as três teorias diante de dilemas reais

**1 novo autor**
- John Stuart Mill (1806–1873) — utilitarismo, princípio da utilidade, qualidade dos prazeres

**5 novos textos com leitura guiada**
- A boa vontade — o único bem incondicional (Kant, Fundamentação I)
- O imperativo categórico (Kant, Fundamentação II)
- O princípio da utilidade (Mill, Utilitarismo cap. II)
- A prova do princípio da utilidade (Mill, Utilitarismo cap. IV)
- A prudência e o agir bem (Aristóteles, Ética a Nicômaco VI)

**6 novos exercícios**
- Qual teoria moral está em ação? (tipo: classify, dif. 2)
- Reconstruindo o imperativo categórico (tipo: reconstruct, dif. 3)
- O dilema do bonde — variantes (tipo: classify, dif. 3)
- Kant versus Mill — o fundamento da moral (tipo: comparison, dif. 3)
- A virtude é suficiente para a ação correta? (tipo: classify, dif. 3)
- O argumento utilitarista de Mill (tipo: reconstruct, dif. 2)

**5 novos conceitos no glossário**
- `dever` — obrigação moral kantiana independente de consequências
- `imperativo categórico` — princípio moral supremo de Kant
- `deontologia` — teoria ética centrada em regras e deveres
- `consequencialismo` — teoria ética centrada nos resultados das ações
- `utilidade` — propriedade de ações que produzem felicidade agregada

---

## [1.4.0] — 2026-03-09

### Módulo Filosofia Medieval (`medieval`) — ativo

**4 novas lições**
- `medieval-augustine` — Agostinho e a virada para o interior: iluminação divina e o problema do tempo
- `medieval-universals` — O debate dos universais: realismo, nominalismo, conceitualismo
- `medieval-anselm-ontological` — Anselmo e o argumento ontológico: pode-se provar Deus pelo conceito de Deus?
- `medieval-aquinas-synthesis` — Tomás e a síntese escolástica: Atenas e Jerusalém

**1 novo autor**
- Anselmo de Cantuária (1033–1109) — argumento ontológico, fides quaerens intellectum

**5 novos textos com leitura guiada**
- O que é o tempo? — Confissões (Agostinho, Livro XI)
- A iluminação divina e o conhecimento da verdade (Agostinho, Sobre o Mestre)
- O argumento ontológico (Anselmo, Proslógio II–III)
- As cinco vias para a existência de Deus (Tomás, Suma Teológica I, q.2, a.3)
- Fé e razão — a distinção dos domínios (Tomás, Suma Contra os Gentios I)

**5 novos exercícios**
- O debate dos universais: realismo ou nominalismo? (tipo: classify, dif. 3)
- A primeira via de Tomás: reconstrução (tipo: reconstruct, dif. 3)
- O argumento ontológico — objeções e respostas (tipo: classify, dif. 4)
- Fé e razão — posições medievais (tipo: classify, dif. 2)
- Agostinho e Tomás: dois estilos de síntese (tipo: comparison, dif. 3)

**4 novos conceitos no glossário**
- `universais` — realismo vs. nominalismo; o debate central da metafísica medieval
- `argumento ontológico` — prova a priori da existência de Deus; de Anselmo a Plantinga
- `iluminação` — teoria agostiniana: verdades eternas requerem iluminação divina
- `lei natural` — participação da razão na lei eterna; base da ética tomista

---

## [1.5.0] — 2026-03-09

### Módulo Lógica (`logic`) — ativo

**5 novas lições** (com camadas entry/intermediate/advanced por lição)
- `logic-what-is-argument` — O que é um argumento? Premissas, conclusões, opinião vs. prova
- `logic-validity-soundness` — Validade e solidez: um argumento pode ser válido e falso simultaneamente
- `logic-fallacies` — Falácias: os erros que parecem argumentos (ad hominem, espantalho, post hoc, etc.)
- `logic-syllogism` — O silogismo: a máquina de inferência de Aristóteles
- `logic-propositional` — Lógica proposicional: conectivos, tabelas-verdade e validade formal

**4 novos textos com leitura guiada e seção avançada**
- O que é um silogismo (Aristóteles, Analíticos Anteriores I, 1)
- Proposição, sujeito e predicado (Aristóteles, Sobre a Interpretação)
- Falácias: os erros mais comuns no raciocínio (tradição desde Refutações Sofísticas)
- Lógica proposicional — conectivos e validade formal (tradição Frege-Russell)

**6 novos exercícios**
- Válido, sólido ou nenhum dos dois? (tipo: classify, dif. 2)
- Identifique a falácia — 5 casos (tipo: classify, dif. 2)
- Construa o silogismo válido (tipo: reconstruct, dif. 3)
- Validade formal por tabela-verdade: MP, MT, AC, NA (tipo: classify, dif. 4)
- Mapeie a estrutura do argumento (tipo: mapping, dif. 3)
- Conectivos e valores de verdade (tipo: classify, dif. 4)

**4 novos conceitos no glossário**
- `validade` — propriedade formal: conclusão necessária dado premissas verdadeiras
- `falácia` — argumento que parece válido mas contém erro lógico
- `proposição` — enunciado declarativo com valor de verdade
- `inferência` — processo de passagem de premissas à conclusão

**Design pedagógico:** cada lição tem três camadas explícitas (entry / intermediate / advanced) para acomodar público de criança interessada a PhD.

---

## [1.10.0] — 2026-03-11

### Três novas páginas estáticas — Guia do Professor, Sobre, Plano de Aula

Implementadas a partir dos padrões de design do ecossistema (Heródoto), adaptados
para o vocabulário filosófico e para as variáveis CSS já definidas no Aristóteles.

**Novas páginas:**
- `sobre.html` — Coluna única 860px + content-card + métricas + ecossistema section
- `guia-professor.html` — Sidebar sticky 220px + 5 atividades + tabela de modos
- `plano-aula.html` — Dois painéis: BNCC-CHS, presets, geração + impressão PDF

**index.html:** 3 links adicionados ao header-nav

**Testes: 82/82 passando**

---

## [1.9.0] — 2026-03-11

### Expansão de conteúdo — todas as lições completadas + documentação reescrita

**42 lições com conteúdo completo** (antes: 11 com sections, 31 sem)

Modules expandidos:
- `intro` — 3 lições: sections + introduction em todas
- `greek-philosophy` — 5 lições: sections + introduction em todas
- `schools` — 4 lições: sections + introduction em todas
- `epistemology` — 4 lições: sections + introduction em todas
- `ethics` — 5 lições: sections + introduction em todas
- `medieval` — 4 lições: sections + introduction em todas
- `logic` — 5 lições: sections + introduction em todas
- `modern` — descartes-doubt: sections; 6 lições: campo problem adicionado

Cada lição contém 4 secções de prosa argumentativa (300–500 palavras/secção).

**Documentação completamente reescrita** (7 ficheiros)
- README.md — 205 linhas: estrutura completa, módulos, arquitectura, testes, atalhos
- docs/architecture.md — 125 linhas: padrões de roteamento, estado, views, CSS
- docs/content-model.md — 305 linhas: esquemas JSON completos com todos os campos
- docs/modules.md — 156 linhas: referência de todos os 9 módulos + percursos
- docs/pedagogy.md — 78 linhas: modelo pedagógico e tipos de exercício
- docs/reading-system.md — 77 linhas: sistema de leitura e anotações
- docs/logic-system.md — 66 linhas: motor de lógica e regras implementadas
- docs/development-guide.md — 167 linhas: checklist + instruções para adicionar conteúdo

**Total de testes: 82/82**

---

## [1.8.0] — 2026-03-10

### Módulo Correntes Filosóficas expandido — de 1 para 5 lições

**5 lições com conteúdo completo** (total: 42)
- `rationalism-vs-empiricism` — expandida: 5 seções densas, 5 textos, 4 exercícios
- `current-idealism` — Idealismo: Berkeley, Kant, Hegel — do filtro subjetivo ao Absoluto
- `current-materialism` — Materialismo: base/superestrutura, alienação, ideologia
- `current-existentialism` — Existencialismo: Kierkegaard, Nietzsche, Heidegger, Sartre
- `current-analytic-continental` — O grande cisma: origens, diferenças metodológicas, pontes

**Cada lição contém:**
- 5 seções de prosa densa (800–1200 palavras por lição)
- Problema introdutório e questão central
- 2–4 exercícios pequenos e focados com explicações detalhadas
- 2–5 textos primários referenciados (todos existentes, sem duplicação)

**11 novos exercícios** (total: 53)
- classify: identify-the-current, base-vs-superestrutura, autêntico/inautêntico, analítica/continental, formas de idealismo, objeções ao idealismo, fontes do conhecimento
- reconstruct: síntese kantiana em 4 etapas, alienação em 3 dimensões, liberdade radical e objeções
- comparison: Kant vs. Hegel — continuidade e ruptura

**5 ensaios de correntes** (total: 42)
- Racionalismo vs. Empirismo (já existia), Idealismo, Materialismo, Existencialismo, Analítica/Continental

**2 novos conceitos** (total: 52)
- `idealismo`, `fenomenologia`

**Módulo atualizado:**
- Duração: 15–18 horas (antes: 8–10)
- Pré-requisitos mantidos

**Total de testes: 82/82**

---

## [1.7.0] — 2026-03-10

### Módulo Filosofia Moderna expandido — de 2 para 8 lições

O módulo `modern` cobre agora o período completo de Descartes a Wittgenstein.

**4 novos autores** (total: 25)
- Georg Wilhelm Friedrich Hegel (1770–1831)
- Karl Marx (1818–1883)
- Friedrich Nietzsche (1844–1900)
- Ludwig Wittgenstein (1889–1951)

**6 novas lições** (total: 38)
- `modern-hume-empiricism` — Hume: ceticismo empírico, causalidade como hábito, problema da indução
- `modern-kant-synthesis` — Kant: revolução copernicana, fenômeno/coisa-em-si, imperativo categórico
- `modern-hegel` — Hegel: dialética, Aufhebung, senhor e escravo, filosofia da história
- `modern-marx` — Marx: materialismo histórico, alienação, ideologia, Teses sobre Feuerbach
- `modern-nietzsche` — Nietzsche: morte de Deus, genealogia da moral, vontade de potência
- `modern-wittgenstein` — Wittgenstein: Tractatus vs. Investigações, jogos de linguagem, filosofia como terapia

**6 novos textos primários com leitura guiada** (total: 37)
- Hegel: Fenomenologia do Espírito (Prefácio) + Dialética do Senhor e do Escravo
- Marx: Teses sobre Feuerbach
- Nietzsche: A Gaia Ciência § 125 (Morte de Deus) + Genealogia da Moral
- Wittgenstein: Investigações Filosóficas (jogos de linguagem)

**5 novos conceitos** (total: 50)
- `dialética`, `geist`, `ideologia`, `vontade-de-potência`, `jogos-de-linguagem`

**6 novos exercícios** (total: 43)
- Classificação, comparação e contextualização para cada lição nova

**4 novos ensaios explicativos** (total: 38)
- Hegel, Marx, Nietzsche, Wittgenstein — cobertura de ensaios 100% mantida

**15 novas entradas na timeline** (total: 56)
- Nascimentos, obras e mortes dos 4 novos autores

**Módulo atualizado**
- Título: "Filosofia Moderna e Contemporânea"
- Subtítulo: "Da dúvida ao além-do-homem"
- Duração estimada: 20–25 horas (antes: 8–10)

**Total de testes: 82/82**

---

## [1.6.0] — 2026-03-10

### Ensaios explicativos — novo arquivo `data/essays.json`

Adicionado sistema de textos explicativos para todas as entidades do projeto. 34 ensaios, ~15.700 palavras, ~3h 46min de leitura total.

**12 ensaios de escolas filosóficas**
- Pré-Socrática, Sofistas, Escola Socrática, Platonismo, Aristotelismo
- Estoicismo, Epicurismo, Ceticismo, Escolástica, Racionalismo, Empirismo, Existencialismo

**21 ensaios de autores** (cobertura completa dos 21 autores do projeto)
- Pré-socráticos: Tales, Anaximandro, Anaxímenes, Heráclito, Parmênides
- Sofistas: Protágoras, Górgias
- Clássicos: Sócrates, Platão, Aristóteles
- Helenísticos: Epicuro, Zenão de Cítio, Epicteto, Marco Aurélio
- Medievais: Agostinho, Anselmo, Tomás de Aquino
- Modernos: Descartes, Hume, Kant, Mill

**1 ensaio de corrente filosófica**
- Racionalismo versus Empirismo — o grande debate sobre a origem do conhecimento

**Estrutura de cada ensaio**
- 4–5 seções com títulos e prosa contínua
- Tempo de leitura estimado (4–9 minutos por ensaio)
- Conceitos-chave referenciados
- Autores-chave vinculados

**Testes adicionados:** 7 novos testes em `data-tests.js` (cobertura, integridade, referências cruzadas)

**Total de testes: 82/82**

---

## [1.14.0] — 2026-03-12

### Expansão de autores — biografias e método completos

**25/25 autores com biografia e método expandidos:**

- `biography`: expandido de 31–81 palavras (média 51w) para 177–209 palavras (média 196w). Cada biografia cobre origem e formação, trajectória de vida, contexto histórico, relações pessoais e filosóficas relevantes, e circunstâncias da morte.
- `method`: expandido de 25–56 palavras (média 33w) para 55–97 palavras (média 74w). Cada campo descreve o procedimento filosófico específico do autor — não o tema, mas o modo de filosofar.

**Autores cobertos:**
- Pré-socráticos: Tales, Anaximandro, Anaxímenes, Heráclito, Parmênides
- Sofistas: Protágoras, Górgias
- Clássicos: Sócrates, Platão, Aristóteles
- Helenísticos: Epicuro, Zenão de Cítio, Epicteto, Marco Aurélio
- Medievais: Agostinho, Anselmo, Tomás de Aquino
- Modernos: Descartes, Hume, Kant, Mill, Hegel, Marx, Nietzsche, Wittgenstein

**Total de testes: 82/82**

---

## [1.13.0] — 2026-03-12

### Expansão de conceitos — extended e related_concepts

**52/52 conceitos expandidos:**

- `extended`: expandido de 31–117 palavras (média 61w) para 108–175 palavras (média 144w). Cada campo cobre: contexto histórico, distinções relevantes, debate activo e aplicação contemporânea.
- `related_concepts`: preenchido em todos os 52 conceitos (antes: 3 sem o campo). Cada conceito referencia 3–7 conceitos relacionados, activando a navegação temática do motor.

**Métricas:**
- Total de palavras nos conceitos: ~3.200 → ~7.500
- Conceitos abaixo de 100 palavras em `extended`: 50 → 0
- Conceitos sem `related_concepts`: 3 → 0

**Total de testes: 82/82**

---

## [1.12.0] — 2026-03-12

### Expansão de ensaios — todos os 42 com conteúdo completo

**42/42 ensaios expandidos com prosa argumentativa real:**

- Total de palavras: ~22 → 29.335
- Média por ensaio: ~1 palavra (placeholders) → 698 palavras
- Ensaios abaixo de 600 palavras: 29 → 0
- Estrutura uniforme: 5 secções × ~140 palavras cada

**Grupos cobertos:**
- 12 ensaios de escolas: pré-socrática, sofistas, socrática, platonismo, aristotelismo, estoicismo, epicurismo, ceticismo, escolástica, racionalismo, empirismo, existencialismo
- 25 ensaios de autores: todos os 25 autores do projecto
- 4 ensaios de correntes: idealismo, materialismo, existencialismo-corrente, analítica/continental, racionalismo-empirismo

**Schema:** `id, entity_type, entity_id, title, subtitle, era, reading_time_minutes, key_figures[], key_concepts[], sections[{heading, content}], bibliography[]`

**Total de testes: 82/82**

---

## [1.11.0] — 2026-03-12

### Expansão de textos primários

**37/37 textos expandidos:**

- Total de palavras: ~9.420
- Segmentos de leitura guiada por texto: 4–6
- Perguntas por texto: 5

**Schema:** `id, title, source, author, period, language, type, text, guided_reading[{segment, note, highlight}], key_terms[], questions[]`

**Total de testes: 82/82**

---

## [Próximas versões — planejado]

### Conteúdo pendente
- Exercícios: adicionar `explanation` a 45 dos 53 exercícios (actualmente 8/53 com explanation)
- Autores: adicionar `related_authors` onde ausente

### Funcionalidades
- Mapa visual de relações entre filósofos (Canvas 2D ou SVG)
- Sistema de progresso persistente via IndexedDB (opcional)
- Busca full-text em conceitos, autores e textos
