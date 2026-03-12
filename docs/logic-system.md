# Sistema de Lógica — Aristóteles

O `logic-engine.js` verifica silogismos e argumentos proposicionais. Documenta as regras implementadas e as limitações actuais.

---

## Silogismos categóricos

O motor verifica silogismos na forma clássica: duas premissas com sujeito, cópula e predicado, e uma conclusão.

**Formas de proposição suportadas:**

| Código | Forma | Exemplo |
|--------|-------|---------|
| A | Todo S é P | Todo homem é mortal |
| E | Nenhum S é P | Nenhum peixe é mamífero |
| I | Algum S é P | Algum filósofo é grego |
| O | Algum S não é P | Algum animal não é vertebrado |

**Regras verificadas:**
1. O termo médio deve ser distribuído em ao menos uma premissa
2. Nenhum termo pode ser distribuído na conclusão sem ser distribuído nas premissas
3. De duas premissas negativas não se conclui nada
4. Se uma premissa é negativa, a conclusão deve ser negativa
5. De duas premissas particulares não se conclui nada
6. Se uma premissa é particular, a conclusão deve ser particular

---

## Lógica proposicional

O motor avalia tabelas de verdade para proposições compostas.

**Conectivos suportados:**

| Símbolo | Operação | Verdadeiro quando |
|---------|----------|------------------|
| `¬` | negação | P é falso |
| `∧` | conjunção | P e Q são ambos verdadeiros |
| `∨` | disjunção | ao menos um de P, Q é verdadeiro |
| `→` | condicional | P é falso OU Q é verdadeiro |
| `↔` | bicondicional | P e Q têm o mesmo valor |

**Formas válidas verificadas:**
- Modus ponens: `(P → Q) ∧ P ⊢ Q`
- Modus tollens: `(P → Q) ∧ ¬Q ⊢ ¬P`
- Silogismo hipotético: `(P → Q) ∧ (Q → R) ⊢ P → R`
- Adição: `P ⊢ P ∨ Q`
- Simplificação: `P ∧ Q ⊢ P`

---

## Limitações actuais

- O motor de silogismos não suporta silogismos com mais de três termos
- A lógica de predicados (quantificadores, relações) não está implementada
- A verificação é sintáctica — não interpreta o significado dos termos
- Paradoxos (mentiroso, sorites) não são tratados

---

## Integração com exercícios

O `logic-engine.js` é usado pelo `argument-engine.js` quando o exercício é do tipo `syllogism` ou `propositional`. Os exercícios do módulo `logic` usam este motor para verificação automática das respostas.

Para exercícios de tipo `classify` e `reconstruct`, a verificação é feita pelo `argument-engine.js` directamente, sem passar pelo `logic-engine.js`.
