/**
 * module-tests.js
 * Testes de consistência entre módulos, lições e conteúdo.
 */

export function runModuleTests(data, test, assert, assertEqual, assertArray, assertNonEmpty) {

  const { modules, lessons, authors, schools, concepts } = data;

  console.log('\n[Module Tests]');

  test('Módulos ativos têm ao menos uma lição referenciada', () => {
    const activeWithLessons = modules.filter(m => m.status === 'active' && m.lessons.length > 0);
    assert(activeWithLessons.length > 0, 'Nenhum módulo ativo com lições');
  });

  test('Cada lição pertence a um módulo declarado', () => {
    const declaredInModules = new Set(modules.flatMap(m => m.lessons || []));
    lessons.forEach(l => {
      // Lição pode não estar em nenhum módulo (rascunho). Apenas verifica se o module field é válido.
      const moduleExists = modules.some(m => m.id === l.module);
      assert(moduleExists, `lesson "${l.id}" tem module "${l.module}" que não existe em modules.json`);
    });
  });

  test('Lições têm difficulty entre 1 e 5', () => {
    lessons.forEach(l => {
      if (l.difficulty != null) {
        assert(l.difficulty >= 1 && l.difficulty <= 5,
          `lesson "${l.id}": difficulty ${l.difficulty} fora do intervalo [1,5]`);
      }
    });
  });

  test('Lições têm duration_minutes positivo', () => {
    lessons.forEach(l => {
      if (l.duration_minutes != null) {
        assert(l.duration_minutes > 0, `lesson "${l.id}": duration_minutes deve ser positivo`);
      }
    });
  });

  test('Lições têm stage válido', () => {
    const validStages = ['gramática', 'lógica', 'retórica', 'filosofia'];
    lessons.forEach(l => {
      if (l.stage) {
        assert(validStages.includes(l.stage),
          `lesson "${l.id}": stage inválido "${l.stage}"`);
      }
    });
  });

  test('Módulo intro tem lições obrigatórias', () => {
    const introModule = modules.find(m => m.id === 'intro');
    assert(introModule, 'Módulo "intro" não encontrado');
    assert(introModule.lessons.length >= 1, 'Módulo intro deve ter ao menos 1 lição');
  });

  test('Módulo greek-philosophy tem lições obrigatórias', () => {
    const mod = modules.find(m => m.id === 'greek-philosophy');
    assert(mod, 'Módulo "greek-philosophy" não encontrado');
    assert(mod.lessons.length >= 3, 'Módulo greek-philosophy deve ter ao menos 3 lições');
  });

  test('Os três gregos estão presentes em authors.json', () => {
    const required = ['socrates', 'plato', 'aristotle'];
    const authorIds = new Set(authors.map(a => a.id));
    required.forEach(id => {
      assert(authorIds.has(id), `Autor obrigatório "${id}" não encontrado em authors.json`);
    });
  });

  test('Conceitos obrigatórios estão no glossário', () => {
    const required = [
      'filosofia', 'mito', 'razão', 'argumento', 'premissa',
      'conclusão', 'lógica', 'verdade', 'virtude', 'felicidade'
    ];
    const conceptIds = new Set(concepts.map(c => c.id));
    required.forEach(id => {
      assert(conceptIds.has(id), `Conceito obrigatório "${id}" não encontrado em concepts.json`);
    });
  });

  test('Escolas obrigatórias estão em schools.json', () => {
    const required = [
      'pre-socratica', 'sofistas', 'platonismo',
      'aristotelismo', 'estoicismo', 'epicurismo'
    ];
    const schoolIds = new Set(schools.map(s => s.id));
    required.forEach(id => {
      assert(schoolIds.has(id), `Escola obrigatória "${id}" não encontrada em schools.json`);
    });
  });

  test('Professor notes presentes em lições de módulos ativos', () => {
    const activeLessonIds = new Set(
      modules.filter(m => m.status === 'active').flatMap(m => m.lessons)
    );
    const activeLessons = lessons.filter(l => activeLessonIds.has(l.id));
    const withNotes = activeLessons.filter(l => l.teacher_notes);
    assert(withNotes.length > 0, 'Nenhuma lição ativa tem teacher_notes');
  });

  test('Lições têm contemporary_application quando possível', () => {
    const activeLessonIds = new Set(
      modules.filter(m => m.status === 'active').flatMap(m => m.lessons)
    );
    const activeLessons = lessons.filter(l => activeLessonIds.has(l.id));
    const withApp = activeLessons.filter(l => l.contemporary_application);
    assert(withApp.length >= Math.floor(activeLessons.length * 0.5),
      'Menos de 50% das lições ativas têm contemporary_application');
  });
}
