/**
 * data-tests.js
 * Testes de integridade dos arquivos JSON.
 * Verifica campos obrigatórios, referências cruzadas e consistência.
 */

export function runDataTests(data, test, assert, assertEqual, assertArray, assertNonEmpty) {

  const { modules, authors, schools, concepts, texts, lessons, exercises, arguments: args, timeline } = data;

  console.log('\n[Data Tests]');

  /* ------------------------------------------------------------------
   * authors.json
   * ------------------------------------------------------------------ */

  test('authors.json: é um array não vazio', () => {
    assertArray(authors);
    assert(authors.length > 0, 'Nenhum autor encontrado');
  });

  test('authors.json: todos os autores têm id, name, period, summary', () => {
    authors.forEach(a => {
      assertNonEmpty(a.id,      `author sem id: ${JSON.stringify(a).substring(0, 60)}`);
      assertNonEmpty(a.name,    `author "${a.id}" sem name`);
      assertNonEmpty(a.period,  `author "${a.id}" sem period`);
      assertNonEmpty(a.summary, `author "${a.id}" sem summary`);
    });
  });

  test('authors.json: ids únicos', () => {
    const ids = authors.map(a => a.id);
    const unique = new Set(ids);
    assertEqual(unique.size, ids.length, `IDs duplicados em authors.json`);
  });

  test('authors.json: related_authors referenciam autores existentes', () => {
    const authorIds = new Set(authors.map(a => a.id));
    authors.forEach(a => {
      (a.related_authors || []).forEach(rid => {
        assert(authorIds.has(rid), `author "${a.id}" referencia related_author inexistente: "${rid}"`);
      });
    });
  });

  test('authors.json: anos birth/death são números quando presentes', () => {
    authors.forEach(a => {
      if (a.birth != null) assert(typeof a.birth === 'number', `author "${a.id}": birth deve ser número`);
      if (a.death != null) assert(typeof a.death === 'number', `author "${a.id}": death deve ser número`);
    });
  });

  /* ------------------------------------------------------------------
   * schools.json
   * ------------------------------------------------------------------ */

  test('schools.json: é um array não vazio', () => {
    assertArray(schools);
    assert(schools.length > 0);
  });

  test('schools.json: todos têm id, name, era, summary', () => {
    schools.forEach(s => {
      assertNonEmpty(s.id,      `school sem id`);
      assertNonEmpty(s.name,    `school "${s.id}" sem name`);
      assertNonEmpty(s.era,     `school "${s.id}" sem era`);
      assertNonEmpty(s.summary, `school "${s.id}" sem summary`);
    });
  });

  test('schools.json: ids únicos', () => {
    const ids = schools.map(s => s.id);
    assertEqual(new Set(ids).size, ids.length, 'IDs duplicados em schools.json');
  });

  /* ------------------------------------------------------------------
   * concepts.json
   * ------------------------------------------------------------------ */

  test('concepts.json: é um array não vazio', () => {
    assertArray(concepts);
    assert(concepts.length > 0);
  });

  test('concepts.json: todos têm id, term, definition, category', () => {
    concepts.forEach(c => {
      assertNonEmpty(c.id,         `concept sem id`);
      assertNonEmpty(c.term,       `concept "${c.id}" sem term`);
      assertNonEmpty(c.definition, `concept "${c.id}" sem definition`);
      assertNonEmpty(c.category,   `concept "${c.id}" sem category`);
    });
  });

  test('concepts.json: ids únicos', () => {
    const ids = concepts.map(c => c.id);
    assertEqual(new Set(ids).size, ids.length, 'IDs duplicados em concepts.json');
  });

  test('concepts.json: related_concepts referenciam conceitos existentes', () => {
    const conceptIds = new Set(concepts.map(c => c.id));
    concepts.forEach(c => {
      (c.related_concepts || []).forEach(rc => {
        assert(conceptIds.has(rc), `concept "${c.id}" referencia conceito inexistente: "${rc}"`);
      });
    });
  });

  /* ------------------------------------------------------------------
   * texts.json
   * ------------------------------------------------------------------ */

  test('texts.json: é um array não vazio', () => {
    assertArray(texts);
    assert(texts.length > 0);
  });

  test('texts.json: todos têm id, title, source, author, text', () => {
    texts.forEach(t => {
      assertNonEmpty(t.id,     `text sem id`);
      assertNonEmpty(t.title,  `text "${t.id}" sem title`);
      assertNonEmpty(t.source, `text "${t.id}" sem source`);
      assertNonEmpty(t.author, `text "${t.id}" sem author`);
      assertNonEmpty(t.text,   `text "${t.id}" sem text (vazio)`);
    });
  });

  test('texts.json: author referencia autor existente', () => {
    const authorIds = new Set(authors.map(a => a.id));
    texts.forEach(t => {
      assert(authorIds.has(t.author), `text "${t.id}" referencia autor inexistente: "${t.author}"`);
    });
  });

  test('texts.json: guided_reading segmentos têm segment e note', () => {
    texts.forEach(t => {
      (t.guided_reading || []).forEach((seg, idx) => {
        assertNonEmpty(seg.segment, `text "${t.id}" guided_reading[${idx}] sem segment`);
        assertNonEmpty(seg.note,    `text "${t.id}" guided_reading[${idx}] sem note`);
      });
    });
  });

  /* ------------------------------------------------------------------
   * lessons.json
   * ------------------------------------------------------------------ */

  test('lessons.json: é um array não vazio', () => {
    assertArray(lessons);
    assert(lessons.length > 0);
  });

  test('lessons.json: todos têm id, module, title, question', () => {
    lessons.forEach(l => {
      assertNonEmpty(l.id,       `lesson sem id`);
      assertNonEmpty(l.module,   `lesson "${l.id}" sem module`);
      assertNonEmpty(l.title,    `lesson "${l.id}" sem title`);
      assertNonEmpty(l.question, `lesson "${l.id}" sem question`);
    });
  });

  test('lessons.json: ids únicos', () => {
    const ids = lessons.map(l => l.id);
    assertEqual(new Set(ids).size, ids.length, 'IDs duplicados em lessons.json');
  });

  test('lessons.json: text_ids referenciam textos existentes', () => {
    const textIds = new Set(texts.map(t => t.id));
    lessons.forEach(l => {
      (l.text_ids || []).forEach(tid => {
        assert(textIds.has(tid), `lesson "${l.id}" referencia text inexistente: "${tid}"`);
      });
    });
  });

  test('lessons.json: exercise_ids referenciam exercícios existentes', () => {
    const exIds = new Set(exercises.map(e => e.id));
    lessons.forEach(l => {
      (l.exercise_ids || []).forEach(eid => {
        assert(exIds.has(eid), `lesson "${l.id}" referencia exercise inexistente: "${eid}"`);
      });
    });
  });

  test('lessons.json: authors referenciam autores existentes', () => {
    const authorIds = new Set(authors.map(a => a.id));
    lessons.forEach(l => {
      (l.authors || []).forEach(aid => {
        assert(authorIds.has(aid), `lesson "${l.id}" referencia autor inexistente: "${aid}"`);
      });
    });
  });

  /* ------------------------------------------------------------------
   * exercises.json
   * ------------------------------------------------------------------ */

  test('exercises.json: é um array não vazio', () => {
    assertArray(exercises);
    assert(exercises.length > 0);
  });

  test('exercises.json: todos têm id, type, title, instruction', () => {
    exercises.forEach(e => {
      assertNonEmpty(e.id,          `exercise sem id`);
      assertNonEmpty(e.type,        `exercise "${e.id}" sem type`);
      assertNonEmpty(e.title,       `exercise "${e.id}" sem title`);
      assertNonEmpty(e.instruction, `exercise "${e.id}" sem instruction`);
    });
  });

  test('exercises.json: tipos válidos', () => {
    const validTypes = ['classify', 'mark-premises', 'reconstruct', 'mapping', 'comparison'];
    exercises.forEach(e => {
      assert(validTypes.includes(e.type), `exercise "${e.id}" tem tipo inválido: "${e.type}"`);
    });
  });

  test('exercises.json: exercícios de reconstruct têm correct_order', () => {
    exercises.filter(e => e.type === 'reconstruct').forEach(e => {
      assertArray(e.correct_order, `exercise reconstruct "${e.id}" sem correct_order`);
      assert(e.correct_order.length > 0, `exercise reconstruct "${e.id}" com correct_order vazio`);
    });
  });

  test('exercises.json: exercícios de classify têm items com correct', () => {
    exercises.filter(e => e.type === 'classify').forEach(e => {
      assertArray(e.items, `exercise classify "${e.id}" sem items`);
      e.items.forEach((item, idx) => {
        assertNonEmpty(item.correct, `exercise "${e.id}" item[${idx}] sem correct`);
      });
    });
  });

  /* ------------------------------------------------------------------
   * modules.json
   * ------------------------------------------------------------------ */

  test('modules.json: é um array não vazio', () => {
    assertArray(modules);
    assert(modules.length > 0);
  });

  test('modules.json: todos têm id, title, stage, status', () => {
    modules.forEach(m => {
      assertNonEmpty(m.id,     `module sem id`);
      assertNonEmpty(m.title,  `module "${m.id}" sem title`);
      assertNonEmpty(m.stage,  `module "${m.id}" sem stage`);
      assertNonEmpty(m.status, `module "${m.id}" sem status`);
    });
  });

  test('modules.json: lessons referenciam lições existentes', () => {
    const lessonIds = new Set(lessons.map(l => l.id));
    modules.forEach(m => {
      (m.lessons || []).forEach(lid => {
        assert(lessonIds.has(lid), `module "${m.id}" referencia lesson inexistente: "${lid}"`);
      });
    });
  });

  test('modules.json: status válidos', () => {
    const validStatus = ['active', 'planned', 'draft'];
    modules.forEach(m => {
      assert(validStatus.includes(m.status), `module "${m.id}" tem status inválido: "${m.status}"`);
    });
  });

  /* ------------------------------------------------------------------
   * arguments.json
   * ------------------------------------------------------------------ */

  test('arguments.json: é um array não vazio', () => {
    assertArray(args);
    assert(args.length > 0);
  });

  test('arguments.json: todos têm id, premises, conclusion', () => {
    args.forEach(a => {
      assertNonEmpty(a.id,        `argument sem id`);
      assertArray(a.premises,     `argument "${a.id}" sem premises`);
      assert(a.conclusion,        `argument "${a.id}" sem conclusion`);
      assertNonEmpty(a.conclusion.text, `argument "${a.id}": conclusion.text vazio`);
    });
  });

  /* ------------------------------------------------------------------
   * timeline.json
   * ------------------------------------------------------------------ */

  test('timeline.json: é um array não vazio', () => {
    assertArray(timeline);
    assert(timeline.length > 0);
  });

  test('timeline.json: todos têm id, name, year, era', () => {
    timeline.forEach(e => {
      assertNonEmpty(e.id,   `timeline entry sem id`);
      assertNonEmpty(e.name, `timeline entry "${e.id}" sem name`);
      assert(typeof e.year === 'number', `timeline entry "${e.id}" year não é número`);
      assertNonEmpty(e.era,  `timeline entry "${e.id}" sem era`);
    });
  });

  test('timeline.json: years são coerentes (birth < death quando ambos presentes)', () => {
    timeline.forEach(e => {
      if (e.year != null && e.year_end != null) {
        assert(e.year <= e.year_end, `timeline "${e.id}": year (${e.year}) > year_end (${e.year_end})`);
      }
    });
  });
}

/* ---- essay tests (appended) ---- */
export function runEssayTests(data, test, assert, assertEqual, assertArray, assertNonEmpty) {
  const essays = data.essays;

  test('essays.json: carregado e não vazio', () => {
    assertArray(essays);
    assert(essays.length > 0);
  });

  test('essays.json: campos obrigatórios presentes', () => {
    essays.forEach(e => {
      assertNonEmpty(e.id,          `essay sem id`);
      assertNonEmpty(e.entity_type, `essay "${e.id}" sem entity_type`);
      assertNonEmpty(e.entity_id,   `essay "${e.id}" sem entity_id`);
      assertNonEmpty(e.title,       `essay "${e.id}" sem title`);
      assertArray(e.sections,       `essay "${e.id}" sem sections`);
      assert(e.sections.length > 0, `essay "${e.id}" sections vazio`);
    });
  });

  test('essays.json: seções têm heading e content', () => {
    essays.forEach(e => {
      e.sections.forEach((s, i) => {
        assertNonEmpty(s.heading, `essay "${e.id}" section[${i}] sem heading`);
        assertNonEmpty(s.content, `essay "${e.id}" section[${i}] sem content`);
      });
    });
  });

  test('essays.json: entity_id de autores existe em authors.json', () => {
    const ids = new Set(data.authors.map(a => a.id));
    essays.filter(e => e.entity_type === 'author').forEach(e => {
      assert(ids.has(e.entity_id), `essay "${e.id}": author "${e.entity_id}" não existe`);
    });
  });

  test('essays.json: entity_id de escolas existe em schools.json', () => {
    const ids = new Set(data.schools.map(s => s.id));
    essays.filter(e => e.entity_type === 'school').forEach(e => {
      assert(ids.has(e.entity_id), `essay "${e.id}": school "${e.entity_id}" não existe`);
    });
  });

  test('essays.json: todos os autores têm ensaio', () => {
    const covered = new Set(essays.filter(e => e.entity_type === 'author').map(e => e.entity_id));
    data.authors.forEach(a => {
      assert(covered.has(a.id), `autor "${a.id}" (${a.name}) sem ensaio`);
    });
  });

  test('essays.json: todas as escolas têm ensaio', () => {
    const covered = new Set(essays.filter(e => e.entity_type === 'school').map(e => e.entity_id));
    data.schools.forEach(s => {
      assert(covered.has(s.id), `escola "${s.id}" (${s.name}) sem ensaio`);
    });
  });
}
