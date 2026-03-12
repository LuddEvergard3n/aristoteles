/**
 * main.js
 * Ponto de entrada da aplicação Aristóteles.
 * Responsável por: carregar dados, registrar rotas e montar a interface.
 *
 * Dependências: router.js, state.js, ui.js, accessibility.js
 * e todos os módulos de componentes.
 */

import { Router }        from './router.js';
import { State }         from './state.js';
import { UI }            from './ui.js';
import { Accessibility } from './accessibility.js';

import { ReadingEngine }    from '../engine/reading-engine.js';
import { LogicEngine }      from '../engine/logic-engine.js';
import { ArgumentEngine }   from '../engine/argument-engine.js';
import { ComparisonEngine, TimelineEngine } from '../engine/feedback-engine.js';

/* ------------------------------------------------------------------
 * Contêiners DOM
 * ------------------------------------------------------------------ */
const $main       = document.getElementById('main-content');
const $breadcrumb = document.getElementById('breadcrumb');

/* ------------------------------------------------------------------
 * Carregamento de dados
 * ------------------------------------------------------------------ */

const DATA_FILES = [
  'modules', 'authors', 'schools', 'concepts',
  'texts',   'lessons', 'exercises', 'arguments', 'timeline'
];

async function loadAllData() {
  UI.showLoading($main, 'Carregando Aristóteles...');

  try {
    const results = await Promise.all(
      DATA_FILES.map(name =>
        fetch(`data/${name}.json`)
          .then(r => {
            if (!r.ok) throw new Error(`Falha ao carregar data/${name}.json`);
            return r.json();
          })
          .then(data => ({ name, data }))
      )
    );

    results.forEach(({ name, data }) => State.cacheData(name, data));
    UI.hideLoading($main);
    return true;

  } catch (err) {
    $main.innerHTML = `<div class="error-state">
      <h2>Erro ao carregar dados</h2>
      <p>${UI.escape(err.message)}</p>
      <p>Verifique se todos os arquivos JSON estão presentes em <code>/data/</code>.</p>
    </div>`;
    return false;
  }
}

/* ------------------------------------------------------------------
 * Views
 * ------------------------------------------------------------------ */

function renderHome() {
  const modules = State.getData('modules') || [];

  UI.renderBreadcrumb([{ label: 'Início' }], $breadcrumb);

  $main.innerHTML = '';

  const hero = document.createElement('section');
  hero.className = 'hero';
  hero.innerHTML = `
    <div class="hero-inner">
      <h1 class="hero-title">Aristóteles</h1>
      <p class="hero-subtitle">Um laboratório de pensamento filosófico</p>
      <p class="hero-description">
        Aprenda a ler filosofia. Identifique conceitos. Reconheça argumentos.
        Distinga opinião de raciocínio. Percorra dois milênios de pensamento humano.
      </p>
    </div>
  `;
  $main.appendChild(hero);

  // Entradas de navegação
  const navSection = document.createElement('section');
  navSection.className = 'home-nav';
  navSection.innerHTML = `<h2 class="section-title">Entrar por</h2>`;

  const entryPoints = [
    { label: 'Problema filosófico', href: '#/problem/o-que-e-verdade',    icon: '?' },
    { label: 'Autor',               href: '#/author/aristotle',            icon: 'A' },
    { label: 'Escola',              href: '#/school/platonismo',           icon: 'E' },
    { label: 'Época',               href: '#/timeline',                   icon: 'T' },
    { label: 'Glossário',           href: '#/glossary',                   icon: 'G' }
  ];

  const entryGrid = document.createElement('div');
  entryGrid.className = 'entry-grid';

  entryPoints.forEach(ep => {
    const card = document.createElement('a');
    card.className = 'entry-card';
    card.href = ep.href;
    card.innerHTML = `
      <span class="entry-icon" aria-hidden="true">${ep.icon}</span>
      <span class="entry-label">${ep.label}</span>
    `;
    entryGrid.appendChild(card);
  });

  navSection.appendChild(entryGrid);
  $main.appendChild(navSection);

  // Módulos ativos
  const modulesSection = document.createElement('section');
  modulesSection.className = 'modules-section';
  modulesSection.innerHTML = `<h2 class="section-title">Módulos</h2>`;

  const activeModules = modules.filter(m => m.status === 'active');
  const grid = document.createElement('div');
  grid.className = 'modules-grid';

  activeModules.forEach(mod => {
    const card = document.createElement('a');
    card.className = 'module-card';
    card.href = Router.moduleHref(mod.id);

    card.innerHTML = `
      <div class="module-card-header">
        <h3 class="module-card-title">${UI.escape(mod.title)}</h3>
        <span class="module-card-stage">${UI.escape(mod.stage)}</span>
      </div>
      <p class="module-card-subtitle">${UI.escape(mod.subtitle)}</p>
      <p class="module-card-description">${UI.escape(mod.description)}</p>
      <span class="module-card-duration">${UI.escape(mod.duration_estimate)}</span>
    `;
    grid.appendChild(card);
  });

  modulesSection.appendChild(grid);

  // Módulos planejados
  const plannedModules = modules.filter(m => m.status === 'planned');
  if (plannedModules.length > 0) {
    const plannedSection = document.createElement('section');
    plannedSection.className = 'modules-planned';
    plannedSection.innerHTML = `<h3 class="section-title section-title--minor">Em desenvolvimento</h3>`;
    const plannedGrid = document.createElement('div');
    plannedGrid.className = 'modules-grid modules-grid--planned';

    plannedModules.forEach(mod => {
      const card = document.createElement('div');
      card.className = 'module-card module-card--planned';
      card.innerHTML = `
        <div class="module-card-header">
          <h3 class="module-card-title">${UI.escape(mod.title)}</h3>
          <span class="module-card-badge">Em breve</span>
        </div>
        <p class="module-card-subtitle">${UI.escape(mod.subtitle)}</p>
      `;
      plannedGrid.appendChild(card);
    });
    plannedSection.appendChild(plannedGrid);
    modulesSection.appendChild(plannedSection);
  }

  $main.appendChild(modulesSection);
}

function renderModule({ moduleId }) {
  const modules = State.getData('modules') || [];
  const lessons = State.getData('lessons') || [];
  const mod     = modules.find(m => m.id === moduleId);

  if (!mod) {
    $main.innerHTML = `<p class="error-state">Módulo "${UI.escape(moduleId)}" não encontrado.</p>`;
    return;
  }

  UI.renderBreadcrumb([
    { label: 'Início', href: '#/' },
    { label: mod.title }
  ], $breadcrumb);

  $main.innerHTML = '';

  const header = document.createElement('header');
  header.className = 'view-header';
  header.innerHTML = `
    <div class="view-header-meta">
      <span class="view-stage">${UI.escape(mod.stage)}</span>
      <span class="view-duration">${UI.escape(mod.duration_estimate)}</span>
    </div>
    <h1 class="view-title">${UI.escape(mod.title)}</h1>
    <p class="view-subtitle">${UI.escape(mod.subtitle)}</p>
    <p class="view-description">${UI.escape(mod.description)}</p>
  `;
  $main.appendChild(header);

  // Lista de lições do módulo
  const moduleLessons = mod.lessons
    .map(id => lessons.find(l => l.id === id))
    .filter(Boolean);

  if (moduleLessons.length > 0) {
    const lessonsSection = document.createElement('section');
    lessonsSection.className = 'lessons-list';
    lessonsSection.innerHTML = `<h2 class="section-title">Lições</h2>`;

    moduleLessons.forEach((lesson, idx) => {
      const item = document.createElement('a');
      item.className = 'lesson-item';
      item.href = Router.lessonHref(moduleId, lesson.id);

      item.innerHTML = `
        <span class="lesson-number">${idx + 1}</span>
        <div class="lesson-info">
          <h3 class="lesson-title">${UI.escape(lesson.title)}</h3>
          <p class="lesson-subtitle">${UI.escape(lesson.subtitle || '')}</p>
          <p class="lesson-question">${UI.escape(lesson.question)}</p>
        </div>
        <span class="lesson-duration">${lesson.duration_minutes} min</span>
      `;
      lessonsSection.appendChild(item);
    });

    $main.appendChild(lessonsSection);
  }

  // Conceitos introduzidos
  if (mod.concepts_introduced && mod.concepts_introduced.length > 0) {
    const conceptsDiv = document.createElement('div');
    conceptsDiv.className = 'module-concepts';
    conceptsDiv.innerHTML = `<h3 class="section-title section-title--minor">Conceitos neste módulo</h3>`;
    const tags = document.createElement('div');
    tags.className = 'concept-tags';
    mod.concepts_introduced.forEach(c => {
      const tag = document.createElement('a');
      tag.className = 'concept-tag';
      tag.href      = Router.conceptHref(c);
      tag.textContent = c;
      tags.appendChild(tag);
    });
    conceptsDiv.appendChild(tags);
    $main.appendChild(conceptsDiv);
  }
}

function renderLesson({ moduleId, lessonId }) {
  const lessons   = State.getData('lessons')   || [];
  const modules   = State.getData('modules')   || [];
  const texts     = State.getData('texts')     || [];
  const exercises = State.getData('exercises') || [];
  const authors   = State.getData('authors')   || [];

  const lesson = lessons.find(l => l.id === lessonId);
  const mod    = modules.find(m => m.id === moduleId);

  if (!lesson) {
    $main.innerHTML = `<p class="error-state">Lição não encontrada.</p>`;
    return;
  }

  UI.renderBreadcrumb([
    { label: 'Início',    href: '#/' },
    { label: mod?.title || moduleId, href: Router.moduleHref(moduleId) },
    { label: lesson.title }
  ], $breadcrumb);

  $main.innerHTML = '';

  // Cabeçalho da lição
  const header = document.createElement('header');
  header.className = 'lesson-header';
  header.innerHTML = `
    <div class="lesson-meta">
      <span class="lesson-stage">${UI.escape(lesson.stage)}</span>
      <span class="lesson-difficulty">Nível ${lesson.difficulty}</span>
      <span class="lesson-duration">${lesson.duration_minutes} min</span>
    </div>
    <h1 class="lesson-title">${UI.escape(lesson.title)}</h1>
    <p class="lesson-subtitle">${UI.escape(lesson.subtitle || '')}</p>
  `;
  $main.appendChild(header);

  // Pergunta filosófica e problema
  const questionBlock = document.createElement('section');
  questionBlock.className = 'lesson-question-block';
  questionBlock.innerHTML = `
    <h2 class="lesson-question">${UI.escape(lesson.question)}</h2>
    <p class="lesson-problem">${UI.escape(lesson.problem)}</p>
  `;
  $main.appendChild(questionBlock);

  // Autores relacionados
  if (lesson.authors && lesson.authors.length > 0) {
    const authorsDiv = document.createElement('div');
    authorsDiv.className = 'lesson-authors';
    authorsDiv.innerHTML = '<h3 class="section-title section-title--minor">Filósofos</h3>';
    const authorList = document.createElement('div');
    authorList.className = 'author-chips';
    lesson.authors.forEach(aId => {
      const author = authors.find(a => a.id === aId);
      if (!author) return;
      const chip = document.createElement('a');
      chip.className   = 'author-chip';
      chip.href        = Router.authorHref(aId);
      chip.textContent = author.name;
      authorList.appendChild(chip);
    });
    authorsDiv.appendChild(authorList);
    $main.appendChild(authorsDiv);
  }

  // Textos filosóficos
  if (lesson.text_ids && lesson.text_ids.length > 0) {
    const textsSection = document.createElement('section');
    textsSection.className = 'lesson-texts';
    textsSection.innerHTML = '<h2 class="section-title">Textos</h2>';

    lesson.text_ids.forEach(textId => {
      const container = document.createElement('div');
      container.className = 'text-container';
      textsSection.appendChild(container);

      ReadingEngine.init(container);
      ReadingEngine.loadText(textId, texts);
    });

    $main.appendChild(textsSection);
  }

  // Conceitos centrais
  if (lesson.concepts && lesson.concepts.length > 0) {
    const conceptsDiv = document.createElement('div');
    conceptsDiv.className = 'lesson-concepts';
    conceptsDiv.innerHTML = '<h3 class="section-title section-title--minor">Conceitos centrais</h3>';
    const tags = document.createElement('div');
    tags.className = 'concept-tags';
    lesson.concepts.forEach(c => {
      const tag = document.createElement('a');
      tag.className   = 'concept-tag';
      tag.href        = Router.conceptHref(c);
      tag.textContent = c;
      tags.appendChild(tag);
    });
    conceptsDiv.appendChild(tags);
    $main.appendChild(conceptsDiv);
  }

  // Exercícios
  if (lesson.exercise_ids && lesson.exercise_ids.length > 0) {
    const exSection = document.createElement('section');
    exSection.className = 'lesson-exercises';
    exSection.innerHTML = '<h2 class="section-title">Exercícios</h2>';

    lesson.exercise_ids.forEach(exId => {
      const container = document.createElement('div');
      container.className = 'exercise-container';
      exSection.appendChild(container);

      ArgumentEngine.init(container);
      ArgumentEngine.loadExercise(exId, exercises);
    });

    $main.appendChild(exSection);
  }

  // Aplicação contemporânea
  if (lesson.contemporary_application) {
    const appDiv = document.createElement('div');
    appDiv.className = 'lesson-application';
    appDiv.innerHTML = `
      <h3 class="section-title section-title--minor">Hoje</h3>
      <p>${UI.escape(lesson.contemporary_application)}</p>
    `;
    $main.appendChild(appDiv);
  }

  // Modo professor
  const isTeacher = State.get('ui.teacherMode');
  if (isTeacher && lesson.teacher_notes) {
    $main.appendChild(_buildTeacherPanel(lesson.teacher_notes));
  }

  // Navegação entre lições
  $main.appendChild(_buildLessonNav(moduleId, lessonId));
}

function _buildTeacherPanel(notes) {
  const panel = document.createElement('aside');
  panel.className = 'teacher-panel';
  panel.setAttribute('role', 'complementary');
  panel.setAttribute('aria-label', 'Notas para o professor');

  panel.innerHTML = `
    <h2 class="teacher-panel-title">Modo Professor</h2>
    <dl class="teacher-notes">
      <dt>Objetivo</dt>       <dd>${UI.escape(notes.objective || '')}</dd>
      <dt>Conceito central</dt><dd>${UI.escape(notes.core_concept || '')}</dd>
      <dt>Dificuldade prevista</dt><dd>${UI.escape(notes.predicted_difficulty || '')}</dd>
      <dt>Mediação sugerida</dt><dd>${UI.escape(notes.suggested_mediation || '')}</dd>
      <dt>Critério de resposta</dt><dd>${UI.escape(notes.answer_criteria || '')}</dd>
      <dt>Tempo estimado</dt>  <dd>${UI.escape(notes.estimated_time || '')}</dd>
    </dl>
  `;
  return panel;
}

function _buildLessonNav(moduleId, lessonId) {
  const modules = State.getData('modules') || [];
  const lessons = State.getData('lessons') || [];
  const mod     = modules.find(m => m.id === moduleId);
  if (!mod) return document.createElement('div');

  const idx  = mod.lessons.indexOf(lessonId);
  const prev = idx > 0 ? mod.lessons[idx - 1] : null;
  const next = idx < mod.lessons.length - 1 ? mod.lessons[idx + 1] : null;

  const nav = document.createElement('nav');
  nav.className = 'lesson-nav';
  nav.setAttribute('aria-label', 'Navegação entre lições');

  if (prev) {
    const prevLesson = lessons.find(l => l.id === prev);
    const a = document.createElement('a');
    a.className   = 'lesson-nav-prev';
    a.href        = Router.lessonHref(moduleId, prev);
    a.innerHTML   = `<span>Anterior</span><strong>${UI.escape(prevLesson?.title || '')}</strong>`;
    nav.appendChild(a);
  }

  if (next) {
    const nextLesson = lessons.find(l => l.id === next);
    const a = document.createElement('a');
    a.className   = 'lesson-nav-next';
    a.href        = Router.lessonHref(moduleId, next);
    a.innerHTML   = `<span>Próxima</span><strong>${UI.escape(nextLesson?.title || '')}</strong>`;
    nav.appendChild(a);
  }

  return nav;
}

function renderAuthor({ authorId }) {
  const authors = State.getData('authors') || [];
  const author  = authors.find(a => a.id === authorId);

  if (!author) {
    $main.innerHTML = `<p class="error-state">Autor "${UI.escape(authorId)}" não encontrado.</p>`;
    return;
  }

  UI.renderBreadcrumb([
    { label: 'Início', href: '#/' },
    { label: author.name }
  ], $breadcrumb);

  $main.innerHTML = '';

  const header = document.createElement('header');
  header.className = 'author-header';
  header.innerHTML = `
    <div class="author-meta">
      <span class="author-period">${UI.escape(author.period)}</span>
      <span class="author-dates">${_formatYears(author.birth, author.death)}</span>
    </div>
    <h1 class="author-name">${UI.escape(author.name)}</h1>
    <p class="author-summary">${UI.escape(author.summary)}</p>
  `;
  $main.appendChild(header);

  if (author.biography) {
    const bio = document.createElement('section');
    bio.className = 'author-biography';
    bio.innerHTML = `<h2 class="section-title">Vida</h2><p>${UI.escape(author.biography)}</p>`;
    $main.appendChild(bio);
  }

  if (author.method) {
    const method = document.createElement('section');
    method.className = 'author-method';
    method.innerHTML = `<h2 class="section-title">Método</h2><p>${UI.escape(author.method)}</p>`;
    $main.appendChild(method);
  }

  if (author.key_ideas && author.key_ideas.length > 0) {
    const ideas = document.createElement('section');
    ideas.className = 'author-ideas';
    ideas.innerHTML = `<h2 class="section-title">Ideias centrais</h2>`;
    const list = document.createElement('ul');
    list.className = 'idea-list';
    author.key_ideas.forEach(idea => {
      const li = document.createElement('li');
      li.textContent = idea;
      list.appendChild(li);
    });
    ideas.appendChild(list);
    $main.appendChild(ideas);
  }

  if (author.quote) {
    const quoteDiv = document.createElement('blockquote');
    quoteDiv.className = 'author-quote';
    quoteDiv.innerHTML = `
      <p>${UI.escape(author.quote)}</p>
      <footer>${UI.escape(author.quote_source || '')}</footer>
    `;
    $main.appendChild(quoteDiv);
  }

  if (author.works && author.works.length > 0) {
    const works = document.createElement('section');
    works.className = 'author-works';
    works.innerHTML = `<h2 class="section-title">Obras</h2>`;
    const list = document.createElement('ul');
    list.className = 'works-list';
    author.works.forEach(w => {
      const li = document.createElement('li');
      li.textContent = w;
      list.appendChild(li);
    });
    works.appendChild(list);
    $main.appendChild(works);
  }

  // Comparar com autores relacionados
  if (author.related_authors && author.related_authors.length > 0) {
    const relSection = document.createElement('section');
    relSection.className = 'author-related';
    relSection.innerHTML = `<h2 class="section-title">Comparar com</h2>`;
    const chips = document.createElement('div');
    chips.className = 'author-chips';
    const authors_ = State.getData('authors') || [];
    author.related_authors.forEach(rId => {
      const rel = authors_.find(a => a.id === rId);
      if (!rel) return;
      const chip = document.createElement('a');
      chip.className   = 'author-chip';
      chip.href        = Router.authorHref(rId);
      chip.textContent = rel.name;
      chips.appendChild(chip);
    });
    relSection.appendChild(chips);

    // Tabela de comparação básica
    const compContainer = document.createElement('div');
    compContainer.className = 'comparison-container';
    const dims = ['período', 'escola', 'ideia central', 'conceitos'];
    const comparison = ComparisonEngine.compareAuthors(
      [authorId, ...author.related_authors.slice(0, 2)],
      State.getData('authors') || [],
      dims
    );
    compContainer.appendChild(ComparisonEngine.buildComparisonTable(comparison));
    relSection.appendChild(compContainer);

    $main.appendChild(relSection);
  }
}

function renderSchool({ schoolId }) {
  const schools = State.getData('schools') || [];
  const authors = State.getData('authors') || [];
  const school  = schools.find(s => s.id === schoolId);

  if (!school) {
    $main.innerHTML = `<p class="error-state">Escola "${UI.escape(schoolId)}" não encontrada.</p>`;
    return;
  }

  UI.renderBreadcrumb([
    { label: 'Início', href: '#/' },
    { label: school.name }
  ], $breadcrumb);

  $main.innerHTML = '';

  const header = document.createElement('header');
  header.className = 'school-header';
  header.innerHTML = `
    <div class="school-meta">
      <span class="school-era">${UI.escape(school.era)}</span>
      <span class="school-period">${UI.escape(school.period)}</span>
    </div>
    <h1 class="school-name">${UI.escape(school.name)}</h1>
    <p class="school-summary">${UI.escape(school.summary)}</p>
  `;
  $main.appendChild(header);

  if (school.context) {
    const ctx = document.createElement('section');
    ctx.className = 'school-context';
    ctx.innerHTML = `<h2 class="section-title">Contexto histórico</h2><p>${UI.escape(school.context)}</p>`;
    $main.appendChild(ctx);
  }

  if (school.core_questions && school.core_questions.length > 0) {
    const qSection = document.createElement('section');
    qSection.className = 'school-questions';
    qSection.innerHTML = `<h2 class="section-title">Questões centrais</h2>`;
    const list = document.createElement('ul');
    list.className = 'question-list';
    school.core_questions.forEach(q => {
      const li = document.createElement('li');
      li.textContent = q;
      list.appendChild(li);
    });
    qSection.appendChild(list);
    $main.appendChild(qSection);
  }

  if (school.thinkers && school.thinkers.length > 0) {
    const thinkersSection = document.createElement('section');
    thinkersSection.className = 'school-thinkers';
    thinkersSection.innerHTML = `<h2 class="section-title">Filósofos</h2>`;
    const chips = document.createElement('div');
    chips.className = 'author-chips';
    school.thinkers.forEach(aId => {
      const author = authors.find(a => a.id === aId);
      const chip = document.createElement('a');
      chip.className   = 'author-chip';
      chip.href        = Router.authorHref(aId);
      chip.textContent = author ? author.name : aId;
      chips.appendChild(chip);
    });
    thinkersSection.appendChild(chips);
    $main.appendChild(thinkersSection);
  }
}

function renderConcept({ conceptId }) {
  const concepts = State.getData('concepts') || [];
  const concept  = concepts.find(c => c.id === conceptId);

  if (!concept) {
    $main.innerHTML = `<p class="error-state">Conceito "${UI.escape(conceptId)}" não encontrado.</p>`;
    return;
  }

  UI.renderBreadcrumb([
    { label: 'Início',    href: '#/' },
    { label: 'Glossário', href: '#/glossary' },
    { label: concept.term }
  ], $breadcrumb);

  $main.innerHTML = '';

  const header = document.createElement('header');
  header.className = 'concept-header';
  header.innerHTML = `
    <span class="concept-category">${UI.escape(concept.category)}</span>
    <h1 class="concept-term">${UI.escape(concept.term)}</h1>
    <p class="concept-etymology">${UI.escape(concept.etymology)}</p>
  `;
  $main.appendChild(header);

  const defSection = document.createElement('section');
  defSection.innerHTML = `
    <h2 class="section-title">Definição</h2>
    <p class="concept-definition">${UI.escape(concept.definition)}</p>
  `;
  if (concept.extended) {
    defSection.innerHTML += `<p class="concept-extended">${UI.escape(concept.extended)}</p>`;
  }
  $main.appendChild(defSection);

  if (concept.examples && concept.examples.length > 0) {
    const exSection = document.createElement('section');
    exSection.innerHTML = `<h2 class="section-title">Exemplos</h2>`;
    const list = document.createElement('ul');
    list.className = 'example-list';
    concept.examples.forEach(ex => {
      const li = document.createElement('li');
      li.textContent = ex;
      list.appendChild(li);
    });
    exSection.appendChild(list);
    $main.appendChild(exSection);
  }

  if (concept.related_concepts && concept.related_concepts.length > 0) {
    const relDiv = document.createElement('div');
    relDiv.className = 'concept-related';
    relDiv.innerHTML = '<h3 class="section-title section-title--minor">Conceitos relacionados</h3>';
    const tags = document.createElement('div');
    tags.className = 'concept-tags';
    concept.related_concepts.forEach(rc => {
      const tag = document.createElement('a');
      tag.className   = 'concept-tag';
      tag.href        = Router.conceptHref(rc);
      tag.textContent = rc;
      tags.appendChild(tag);
    });
    relDiv.appendChild(tags);
    $main.appendChild(relDiv);
  }
}

function renderTimeline() {
  UI.renderBreadcrumb([
    { label: 'Início', href: '#/' },
    { label: 'Linha do Tempo' }
  ], $breadcrumb);

  $main.innerHTML = '';

  const header = document.createElement('header');
  header.className = 'view-header';
  header.innerHTML = `<h1 class="view-title">Linha do Tempo Filosófica</h1>`;
  $main.appendChild(header);

  const container = document.createElement('div');
  container.className = 'timeline-container';
  $main.appendChild(container);

  TimelineEngine.render(container, State.getData('timeline') || []);
}

function renderGlossary() {
  const concepts = State.getData('concepts') || [];

  UI.renderBreadcrumb([
    { label: 'Início', href: '#/' },
    { label: 'Glossário' }
  ], $breadcrumb);

  $main.innerHTML = '';

  const header = document.createElement('header');
  header.className = 'view-header';
  header.innerHTML = `<h1 class="view-title">Glossário Filosófico</h1>`;
  $main.appendChild(header);

  // Busca
  const searchDiv = document.createElement('div');
  searchDiv.className = 'glossary-search';
  const searchInput = document.createElement('input');
  searchInput.type        = 'search';
  searchInput.className   = 'glossary-search-input';
  searchInput.placeholder = 'Buscar conceito...';
  searchInput.setAttribute('aria-label', 'Buscar no glossário');
  searchDiv.appendChild(searchInput);
  $main.appendChild(searchDiv);

  // Lista de conceitos agrupada por categoria
  const categories = [...new Set(concepts.map(c => c.category))].sort();
  const listContainer = document.createElement('div');
  listContainer.className = 'glossary-list';

  const renderConcepts = (filter = '') => {
    listContainer.innerHTML = '';
    const filtered = filter
      ? concepts.filter(c =>
          c.term.toLowerCase().includes(filter.toLowerCase()) ||
          c.definition.toLowerCase().includes(filter.toLowerCase())
        )
      : concepts;

    if (filter) {
      filtered.forEach(concept => {
        listContainer.appendChild(_buildConceptEntry(concept));
      });
    } else {
      categories.forEach(cat => {
        const catConcepts = filtered.filter(c => c.category === cat);
        if (catConcepts.length === 0) return;

        const section = document.createElement('section');
        section.className = 'glossary-category';
        section.innerHTML = `<h2 class="glossary-category-title">${UI.escape(cat)}</h2>`;

        catConcepts.forEach(concept => {
          section.appendChild(_buildConceptEntry(concept));
        });

        listContainer.appendChild(section);
      });
    }
  };

  searchInput.addEventListener('input', () => renderConcepts(searchInput.value));
  renderConcepts();

  $main.appendChild(listContainer);
}

function _buildConceptEntry(concept) {
  const entry = document.createElement('article');
  entry.className = 'glossary-entry';

  const title = document.createElement('h3');
  title.className = 'glossary-term';
  const link = document.createElement('a');
  link.href        = Router.conceptHref(concept.id);
  link.textContent = concept.term;
  title.appendChild(link);

  const def = document.createElement('p');
  def.className   = 'glossary-definition';
  def.textContent = concept.definition;

  entry.appendChild(title);
  entry.appendChild(def);
  return entry;
}

function _formatYears(birth, death) {
  const fmt = y => y < 0 ? `${Math.abs(y)} a.C.` : `${y} d.C.`;
  if (!birth && !death) return '';
  if (!death) return fmt(birth);
  return `${fmt(birth)} — ${fmt(death)}`;
}

/* ------------------------------------------------------------------
 * Inicialização
 * ------------------------------------------------------------------ */

async function init() {
  // Acessibilidade primeiro
  Accessibility.init();

  // Registra rotas antes de carregar dados
  Router.on('home',     renderHome);
  Router.on('module',   renderModule);
  Router.on('lesson',   renderLesson);
  Router.on('author',   renderAuthor);
  Router.on('school',   renderSchool);
  Router.on('concept',  renderConcept);
  Router.on('timeline', renderTimeline);
  Router.on('glossary', renderGlossary);

  // Carrega dados
  const ok = await loadAllData();
  if (!ok) return;

  // Inicia roteador após dados prontos
  Router.init();
}

// Aguarda DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
