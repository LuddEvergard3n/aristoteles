/**
 * logic-engine.js
 * Responsável por análise de argumentos, reconstrução de silogismos,
 * detecção de falácias básicas e comparação de validade.
 *
 * Operações são puramente funcionais: sem estado interno persistente.
 * Dependências: nenhuma (módulo autônomo).
 */

export const LogicEngine = (() => {

  /* ------------------------------------------------------------------
   * Tipos de argumento reconhecidos
   * ------------------------------------------------------------------ */
  const ARGUMENT_TYPES = {
    SYLLOGISM:       'silogismo',
    MODUS_PONENS:    'modus ponens',
    MODUS_TOLLENS:   'modus tollens',
    DISJUNCTIVE:     'silogismo disjuntivo',
    HYPOTHETICAL:    'silogismo hipotético',
    INDUCTIVE:       'indutivo',
    ABDUCTIVE:       'abdutivo',
    UNKNOWN:         'desconhecido'
  };

  /* ------------------------------------------------------------------
   * Falácias formais e informais mapeadas
   * ------------------------------------------------------------------ */
  const FALLACIES = [
    {
      id: 'ad-hominem',
      name: 'Ad hominem',
      description: 'Atacar a pessoa que argumenta em vez de avaliar o argumento.',
      example: 'Você não pode falar sobre ética — você já mentiu antes.',
      category: 'informal'
    },
    {
      id: 'straw-man',
      name: 'Espantalho (Straw Man)',
      description: 'Distorcer o argumento do adversário para facilitar o ataque.',
      example: 'Você quer reduzir gastos militares? Então quer que o país fique indefeso.',
      category: 'informal'
    },
    {
      id: 'false-dilemma',
      name: 'Falso dilema',
      description: 'Apresentar apenas duas opções quando há mais.',
      example: 'Ou você está comigo ou está contra mim.',
      category: 'informal'
    },
    {
      id: 'appeal-to-authority',
      name: 'Apelo à autoridade (ilegítimo)',
      description: 'Invocar autoridade não qualificada ou fora de sua área como prova.',
      example: 'Esse ator famoso disse que vacinas fazem mal, então é verdade.',
      category: 'informal'
    },
    {
      id: 'slippery-slope',
      name: 'Ladeira escorregadia',
      description: 'Afirmar que uma ação levará necessariamente a consequências extremas sem demonstrar a cadeia causal.',
      example: 'Se permitirmos casamento igualitário, logo vão querer casar com animais.',
      category: 'informal'
    },
    {
      id: 'circular-reasoning',
      name: 'Raciocínio circular (petição de princípio)',
      description: 'Usar a conclusão como premissa do argumento.',
      example: 'A Bíblia é verdadeira porque é a palavra de Deus, e sabemos que é a palavra de Deus porque a Bíblia diz.',
      category: 'informal'
    },
    {
      id: 'hasty-generalization',
      name: 'Generalização precipitada',
      description: 'Tirar conclusão geral de amostra insuficiente.',
      example: 'Conheço dois filósofos distraídos. Filósofos são todos distraídos.',
      category: 'informal'
    },
    {
      id: 'undistributed-middle',
      name: 'Termo médio não distribuído',
      description: 'Falácia formal: o termo médio do silogismo não cobre toda a extensão em pelo menos uma premissa.',
      example: 'Alguns filósofos são gregos. Alguns gregos são espartanos. Logo alguns filósofos são espartanos.',
      category: 'formal'
    },
    {
      id: 'affirming-consequent',
      name: 'Afirmação do consequente',
      description: 'Falácia formal: de "Se P então Q" e "Q é verdadeiro", concluir que "P é verdadeiro".',
      example: 'Se chove, a rua fica molhada. A rua está molhada. Logo choveu.',
      category: 'formal'
    },
    {
      id: 'denying-antecedent',
      name: 'Negação do antecedente',
      description: 'Falácia formal: de "Se P então Q" e "P é falso", concluir que "Q é falso".',
      example: 'Se estudo, passo. Não estudei. Logo não passei.',
      category: 'formal'
    }
  ];

  /* ------------------------------------------------------------------
   * API pública
   * ------------------------------------------------------------------ */

  /**
   * Valida um argumento (estrutura de arguments.json).
   * @param {Object} arg — objeto de argumento
   * @returns {Object} resultado da validação
   */
  function validateArgument(arg) {
    if (!arg || !arg.premises || !arg.conclusion) {
      return { valid: false, error: 'Estrutura de argumento inválida.' };
    }

    return {
      id:          arg.id,
      name:        arg.name,
      type:        arg.type || ARGUMENT_TYPES.UNKNOWN,
      premise_count: arg.premises.length,
      is_valid:    Boolean(arg.validity),
      is_sound:    arg.soundness === true,
      soundness_note: typeof arg.soundness === 'string' ? arg.soundness : null,
      explanation: arg.explanation || '',
      premises:    arg.premises.map(p => ({ ...p })),
      conclusion:  { ...arg.conclusion }
    };
  }

  /**
   * Reconstrói a estrutura formal de um silogismo a partir de premissas e conclusão.
   * @param {string[]} premiseTexts  — array de strings
   * @param {string}   conclusionText
   * @returns {Object} silogismo estruturado
   */
  function reconstructSyllogism(premiseTexts, conclusionText) {
    if (!Array.isArray(premiseTexts) || premiseTexts.length === 0 || !conclusionText) {
      return { valid: false, error: 'Forneça ao menos uma premissa e uma conclusão.' };
    }

    return {
      premises: premiseTexts.map((t, i) => ({
        index: i + 1,
        text:  t.trim(),
        type:  i === 0 ? 'premissa maior' : i === 1 ? 'premissa menor' : `premissa ${i + 1}`
      })),
      conclusion: {
        text: conclusionText.trim()
      },
      form:    premiseTexts.length === 2 ? 'silogismo categórico (estrutura básica)' : 'argumento multi-premissa',
      note:    'Para verificar a validade formal, examine se o termo médio distribui adequadamente.'
    };
  }

  /**
   * Retorna a lista de falácias, opcionalmente filtradas por categoria.
   * @param {'formal'|'informal'|null} category
   * @returns {Object[]}
   */
  function getFallacies(category = null) {
    if (!category) return FALLACIES.map(f => ({ ...f }));
    return FALLACIES
      .filter(f => f.category === category)
      .map(f => ({ ...f }));
  }

  /**
   * Busca uma falácia pelo id.
   * @param {string} id
   * @returns {Object|null}
   */
  function getFallacyById(id) {
    const found = FALLACIES.find(f => f.id === id);
    return found ? { ...found } : null;
  }

  /**
   * Compara dois argumentos em termos de validade e solidez.
   * @param {Object} argA
   * @param {Object} argB
   * @returns {Object} comparação estruturada
   */
  function compareArguments(argA, argB) {
    const a = validateArgument(argA);
    const b = validateArgument(argB);

    return {
      a: { id: a.id, name: a.name, valid: a.is_valid, sound: a.is_sound },
      b: { id: b.id, name: b.name, valid: b.is_valid, sound: b.is_sound },
      comparison: {
        same_validity:  a.is_valid === b.is_valid,
        same_soundness: a.is_sound === b.is_sound,
        observation:    _generateComparisonNote(a, b)
      }
    };
  }

  /**
   * Verifica a ordem correta de itens num exercício de reconstrução.
   * @param {string[]} userOrder    — array de ids na ordem do usuário
   * @param {string[]} correctOrder — array de ids na ordem correta
   * @returns {Object} resultado
   */
  function checkReconstructionOrder(userOrder, correctOrder) {
    if (!Array.isArray(userOrder) || !Array.isArray(correctOrder)) {
      return { correct: false, error: 'Entrada inválida.' };
    }

    const correct = JSON.stringify(userOrder) === JSON.stringify(correctOrder);

    const feedback = [];
    userOrder.forEach((id, idx) => {
      const expectedIdx = correctOrder.indexOf(id);
      if (expectedIdx !== idx) {
        feedback.push({
          id,
          position_given:    idx + 1,
          position_expected: expectedIdx + 1,
          note: expectedIdx < idx
            ? 'Este elemento deve vir antes no argumento.'
            : 'Este elemento deve vir depois no argumento.'
        });
      }
    });

    return { correct, mismatches: feedback };
  }

  /**
   * Analisa se um texto simples contém indicadores de argumento.
   * Função heurística — não substitui análise formal.
   * @param {string} text
   * @returns {Object}
   */
  function detectArgumentIndicators(text) {
    if (typeof text !== 'string') return { is_argument: false };

    const conclusionMarkers = [
      'portanto', 'logo', 'assim', 'conclui-se', 'segue-se', 'consequentemente',
      'por isso', 'daí que', 'então', 'resulta que', 'pode-se concluir'
    ];

    const premiseMarkers = [
      'porque', 'pois', 'dado que', 'já que', 'visto que', 'uma vez que',
      'considerando que', 'supondo que', 'se', 'tendo em vista'
    ];

    const lower = text.toLowerCase();

    const foundConclusion = conclusionMarkers.filter(m => lower.includes(m));
    const foundPremises   = premiseMarkers.filter(m => lower.includes(m));

    const isArgument = foundConclusion.length > 0 || foundPremises.length > 0;

    return {
      is_argument:         isArgument,
      conclusion_markers:  foundConclusion,
      premise_markers:     foundPremises,
      confidence:          isArgument ? (foundConclusion.length > 0 ? 'alta' : 'média') : 'baixa',
      note: isArgument
        ? 'Indicadores argumentativos detectados. Examine se as premissas sustentam a conclusão.'
        : 'Texto não apresenta marcadores claros de argumento. Pode ser opinião, descrição ou narrativa.'
    };
  }

  /* ------------------------------------------------------------------
   * Funções auxiliares internas
   * ------------------------------------------------------------------ */

  function _generateComparisonNote(a, b) {
    if (a.is_valid && b.is_valid && a.is_sound && b.is_sound) {
      return 'Ambos os argumentos são válidos e sólidos.';
    }
    if (a.is_valid && !b.is_valid) {
      return `"${a.name}" é logicamente válido; "${b.name}" contém falha na forma.`;
    }
    if (!a.is_valid && b.is_valid) {
      return `"${b.name}" é logicamente válido; "${a.name}" contém falha na forma.`;
    }
    if (a.is_valid && !a.is_sound && b.is_valid && !b.is_sound) {
      return 'Ambos são formalmente válidos, mas a solidez (verdade das premissas) está em disputa em ambos.';
    }
    return 'Os argumentos diferem em forma, solidez ou em ambos. Examine as premissas individualmente.';
  }

  /* ------------------------------------------------------------------
   * Exportação
   * ------------------------------------------------------------------ */
  return {
    ARGUMENT_TYPES,
    validateArgument,
    reconstructSyllogism,
    getFallacies,
    getFallacyById,
    compareArguments,
    checkReconstructionOrder,
    detectArgumentIndicators
  };

})();
