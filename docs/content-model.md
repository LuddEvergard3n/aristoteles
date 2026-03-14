# Modelo de Conteúdo — Aristóteles

Esquemas completos de todos os ficheiros JSON em `data/`.

---

## modules.json

Array de módulos. Cada módulo:

```json
{
  "id": "string",                    // slug único
  "title": "string",
  "subtitle": "string",
  "description": "string",
  "stage": "string",                 // "introdução" | "filosofia"
  "order": "number",                 // ordem de apresentação (1-indexed)
  "status": "string",                // "active" | "planned"
  "lessons": ["lesson_id"],          // ids ordenados das lições
  "prerequisites": ["module_id"],    // módulos requeridos antes
  "concepts_introduced": ["string"], // conceitos novos introduzidos
  "duration_estimate": "string",     // ex: "8–10 horas"
  "icon": "string"
}
```

---

## lessons.json

Array de lições. Cada lição:

```json
{
  "id": "string",
  "module": "module_id",
  "order": "number",
  "title": "string",
  "subtitle": "string",
  "question": "string",             // pergunta filosófica central
  "problem": "string",              // situação concreta que motiva a questão
  "stage": "string",
  "difficulty": "number",           // 1–5
  "duration_minutes": "number",
  "authors": ["author_id"],
  "concepts": ["concept_id"],
  "text_ids": ["text_id"],
  "exercise_ids": ["exercise_id"],
  "introduction": "string",         // parágrafo introdutório
  "sections": [
    {
      "heading": "string",
      "content": "string",          // prosa longa (~300–500 palavras)
      "discussion_questions": [    // 3 perguntas abertas para debate (6Ws: o quê, por quê, quem, como, e se)
        "string"
      ]
    }
  ],
  "learning_objectives": ["string"],
  "contemporary_application": "string",
  "teacher_notes": {
    "objective": "string",
    "core_concept": "string",
    "predicted_difficulty": "string",
    "suggested_mediation": "string",
    "answer_criteria": "string",
    "estimated_time": "string"
  }
}
```

---

## texts.json

Array de textos filosóficos primários. Cada texto:

```json
{
  "id": "string",
  "title": "string",
  "author_id": "author_id",
  "work": "string",                 // obra de origem
  "date_approximate": "string",
  "difficulty": "number",           // 1–5
  "length_minutes": "number",       // tempo estimado de leitura
  "summary": "string",
  "paragraphs": [
    {
      "id": "string",
      "text": "string",
      "annotations": [              // opcional
        {
          "term": "string",
          "explanation": "string"
        }
      ],
      "questions": [                // opcional — perguntas intercaladas
        {
          "id": "string",
          "text": "string",
          "type": "reflection"
        }
      ]
    }
  ],
  "context": "string",
  "significance": "string"
}
```

---

## exercises.json

Array de exercícios. Três tipos:

### Tipo `classify`

```json
{
  "id": "string",
  "type": "classify",
  "title": "string",
  "instruction": "string",
  "difficulty": "number",
  "concepts": ["concept_id"],
  "items": [
    {
      "id": "string",
      "text": "string",
      "options": ["string"],
      "correct": "string",          // deve coincidir com uma das options
      "explanation": "string"       // explicação detalhada da resposta correcta e das erradas
    }
  ]
}
```

### Tipo `reconstruct`

```json
{
  "id": "string",
  "type": "reconstruct",
  "title": "string",
  "instruction": "string",
  "difficulty": "number",
  "concepts": ["concept_id"],
  "correct_order": ["step_id"],     // ordem canónica dos passos
  "steps": [
    {
      "id": "string",
      "prompt": "string",
      "model_answer": "string",
      "keywords": ["string"]        // palavras-chave para avaliação automática
    }
  ]
}
```

### Tipo `comparison`

```json
{
  "id": "string",
  "type": "comparison",
  "title": "string",
  "instruction": "string",
  "difficulty": "number",
  "concepts": ["concept_id"],
  "positions": [
    {
      "id": "string",
      "text": "string",             // posição filosófica a atribuir
      "author_hint": "string",
      "correct_author": "author_id",
      "problem": "string"           // a questão que a posição responde
    }
  ]
}
```

---

## authors.json

Array de autores. Cada autor:

```json
{
  "id": "string",
  "name": "string",
  "birth": "number",                // ano (negativo = a.C.)
  "death": "number",
  "period": "string",               // "Grécia Clássica" | "Helenismo" | etc.
  "school": "school_id",
  "summary": "string",
  "biography": "string",
  "method": "string",
  "key_ideas": ["string"],
  "works": ["string"],
  "quote": "string",
  "quote_source": "string",
  "related_authors": ["author_id"],
  "concepts_introduced": ["concept_id"]
}
```

---

## concepts.json

Array de conceitos. Cada conceito:

```json
{
  "id": "string",
  "term": "string",
  "etymology": "string",
  "definition": "string",           // definição concisa (1–2 frases)
  "extended": "string",             // explicação aprofundada
  "related_concepts": ["concept_id"],
  "authors": ["author_id"],
  "category": "string",             // "lógica" | "metafísica" | "epistemologia" | "ética" | etc.
  "examples": ["string"],
  "relevance": "string"             // parágrafo sobre por que o conceito importa fora da filosofia académica
}
```

---

## essays.json

Array de ensaios explicativos. Cada ensaio:

```json
{
  "id": "string",
  "entity_type": "string",          // "author" | "school" | "current"
  "entity_id": "string",            // id do autor/escola/corrente
  "title": "string",
  "subtitle": "string",
  "era": "string",
  "reading_time_minutes": "number",
  "key_figures": ["author_id"],
  "key_concepts": ["concept_id"],
  "sections": [
    {
      "heading": "string",
      "content": "string"
    }
  ]
}
```

---

## schools.json

Array de escolas filosóficas. Cada escola:

```json
{
  "id": "string",
  "name": "string",
  "era": "string",
  "period": "string",               // datas aproximadas
  "summary": "string",
  "context": "string",
  "core_questions": ["string"],
  "thinkers": ["author_id"],
  "key_concepts": ["string"],
  "legacy": "string"
}
```

---

## timeline.json

Array de entradas cronológicas:

```json
{
  "id": "string",
  "year": "number",
  "title": "string",
  "description": "string",
  "type": "string",                 // "birth" | "death" | "work" | "event"
  "author_id": "author_id",         // opcional
  "significance": "string"
}
```

---

## Integridade referencial

O `tests/data-tests.js` verifica que todos os ids referenciados existem nos seus respectivos ficheiros. Campos obrigatórios por tipo:

| Ficheiro | Campos obrigatórios |
|----------|---------------------|
| `lessons.json` | `id`, `module`, `title`, `question`, `problem`, `sections` (cada secção com `discussion_questions`) |
| `exercises.json` | `id`, `type`, `title`, `instruction` |
| `texts.json` | `id`, `title`, `author_id`, `paragraphs` |
| `authors.json` | `id`, `name`, `birth`, `school` |
| `concepts.json` | `id`, `term`, `definition`, `category`, `relevance` |
