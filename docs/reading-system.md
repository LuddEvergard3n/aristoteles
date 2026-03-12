# Sistema de Leitura — Aristóteles

O `reading-engine.js` é o módulo responsável por apresentar textos filosóficos primários com suporte pedagógico activo.

---

## Estrutura de um texto

Os textos em `data/texts.json` têm estrutura por parágrafos:

```json
{
  "paragraphs": [
    {
      "id": "p1",
      "text": "O texto original traduzido.",
      "annotations": [
        {
          "term": "eudaimonia",
          "explanation": "Florescimento humano — a realização plena das capacidades da alma segundo a razão."
        }
      ],
      "questions": [
        {
          "id": "q1",
          "text": "O que Aristóteles quer dizer com 'actividade da alma'?",
          "type": "reflection"
        }
      ]
    }
  ]
}
```

---

## Funcionalidades do motor de leitura

**Anotações inline** — Termos marcados com `annotations` são sublinhados no texto. Ao passar o rato (hover) ou tocar (mobile), aparece um tooltip com a explicação. Os termos anotados são também ligados às entradas correspondentes em `concepts.json` quando o id corresponde.

**Perguntas intercaladas** — Perguntas de tipo `reflection` aparecem após o parágrafo em que estão definidas. São perguntas abertas — não têm resposta correcta automática. Destinam-se a pausar a leitura e provocar reflexão antes de continuar.

**Modo de leitura lenta** — Um parágrafo de cada vez, com navegação explícita (anterior/próximo). Útil para textos densos onde a velocidade de leitura habitual é um obstáculo.

**Modo professor** — Quando activo (`Alt+P`), mostra `teacher_notes` da lição associada ao texto. Inclui sugestões de mediação para discussão em aula.

---

## Adicionando anotações a textos existentes

As anotações são definidas por parágrafo. Para anotar um termo:

1. Localizar o parágrafo no texto em `texts.json`
2. Adicionar ao array `annotations` do parágrafo
3. O `term` deve aparecer literalmente no `text` do parágrafo — o motor localiza a primeira ocorrência

Se o `term` corresponde a um `id` em `concepts.json`, o motor linka automaticamente para a página do conceito.

---

## Adicionando perguntas de reflexão

Perguntas de tipo `reflection` são abertas — não são verificadas automaticamente. São apresentadas como blocos destacados após o parágrafo.

Para tipos de pergunta com verificação (a implementar em versão futura): `identify-premise`, `identify-conclusion`, `evaluate-argument`.

---

## Dificuldade e tempo de leitura

O campo `difficulty` (1–5) e `length_minutes` em cada texto são exibidos antes do texto para orientar o aluno. A dificuldade reflecte:

1. Muito acessível — prosa narrativa, sem termos técnicos densos
2. Acessível — algum vocabulário técnico, estrutura clara
3. Moderado — vocabulário técnico recorrente, argumentos multi-passos
4. Difícil — densidade filosófica alta, pressupostos implícitos significativos
5. Muito difícil — Hegel, Kant da primeira Crítica, Heidegger
