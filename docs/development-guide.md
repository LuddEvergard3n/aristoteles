# Guia de Desenvolvimento — Aristóteles

Como adicionar e modificar conteúdo sem quebrar o projecto.

---

## Princípio fundamental

**Todo o conteúdo vive nos JSONs em `data/`. O código em `js/` e `engine/` não deve ser editado para adicionar conteúdo.**

Após qualquer edição, executar:

```bash
node tests/test-runner.js
```

Todos os 82 testes devem passar antes de qualquer commit.

---

## Adicionar uma lição

1. Abrir `data/lessons.json`
2. Adicionar um objecto com os campos obrigatórios:

```json
{
  "id": "nome-unico-da-licao",
  "module": "id-do-modulo-existente",
  "order": 99,
  "title": "Título da lição",
  "subtitle": "Subtítulo",
  "question": "A questão filosófica central?",
  "problem": "A situação concreta que motiva a questão.",
  "stage": "filosofia",
  "difficulty": 3,
  "duration_minutes": 45,
  "authors": ["autor-id-existente"],
  "concepts": ["conceito-id-existente"],
  "text_ids": [],
  "exercise_ids": [],
  "introduction": "Parágrafo introdutório.",
  "sections": [
    { "heading": "Primeira secção", "content": "Conteúdo..." }
  ]
}
```

3. Abrir `data/modules.json` e adicionar o id da lição ao array `lessons` do módulo correspondente, na posição correcta de `order`.

4. Executar os testes.

**Erros comuns:**
- `module` referencia um id inexistente → adicionar ao módulo correcto ou criar o módulo
- `authors` ou `concepts` referencia ids inexistentes → adicionar primeiro o autor/conceito
- `order` duplicado → reordenar

---

## Adicionar um texto filosófico

1. Abrir `data/texts.json`
2. Adicionar um objecto:

```json
{
  "id": "autor-obra-trecho",
  "title": "Título do excerto",
  "author_id": "autor-existente",
  "work": "Obra de origem",
  "date_approximate": "séc. IV a.C.",
  "difficulty": 3,
  "length_minutes": 10,
  "summary": "O que o excerto discute.",
  "paragraphs": [
    {
      "id": "p1",
      "text": "Texto do parágrafo."
    }
  ],
  "context": "Contexto histórico e filosófico.",
  "significance": "Por que este excerto importa."
}
```

3. Referenciar o id em `text_ids` da lição correspondente.
4. Executar os testes.

---

## Adicionar um exercício

Os três tipos estão documentados em `docs/content-model.md`. Notas adicionais:

**Para `classify`:** Cada `item` deve ter uma `explanation` detalhada que explique a resposta correcta **e** por que as outras opções estão erradas. A `explanation` é o principal veículo pedagógico do exercício.

**Para `reconstruct`:** O campo `correct_order` é obrigatório e deve listar os ids dos `steps` na ordem canónica. Sem este campo, o teste falha.

**Para `comparison`:** O `correct_author` deve ser um id existente em `authors.json`.

---

## Adicionar um autor

```json
{
  "id": "slug-do-autor",
  "name": "Nome Completo",
  "birth": -470,
  "death": -399,
  "period": "Grécia Clássica",
  "school": "id-escola-existente",
  "summary": "Uma frase que define o autor.",
  "biography": "Parágrafo biográfico.",
  "method": "Como este autor faz filosofia.",
  "key_ideas": ["Ideia central 1", "Ideia central 2"],
  "works": ["Obra 1", "Obra 2"],
  "quote": "Uma citação representativa.",
  "quote_source": "Fonte da citação",
  "related_authors": ["autor-id-1", "autor-id-2"]
}
```

Adicionar também entradas na `timeline.json` para nascimento, morte e obras principais.

---

## Adicionar um conceito

```json
{
  "id": "slug-do-conceito",
  "term": "Nome do conceito",
  "etymology": "Origem etimológica.",
  "definition": "Definição concisa em 1–2 frases.",
  "extended": "Explicação aprofundada (2–4 parágrafos).",
  "related_concepts": ["conceito-existente-1"],
  "authors": ["autor-existente-1"],
  "category": "epistemologia",
  "examples": ["Exemplo concreto 1", "Exemplo concreto 2"]
}
```

`related_concepts` só pode referenciar ids que existam no mesmo ficheiro. O teste falha caso contrário.

---

## Adicionar um módulo completo

1. Adicionar o módulo em `modules.json`
2. Adicionar todas as lições em `lessons.json` com `module` referenciando o novo id
3. Adicionar textos e exercícios necessários
4. Actualizar `duration_estimate` no módulo após calcular o total
5. Executar testes
6. Actualizar `docs/modules.md` com a descrição do novo módulo

---

## Checklist antes do commit

- [ ] `node tests/test-runner.js` — 0 falhas
- [ ] Verificar visualmente no browser (abrir pelo servidor HTTP)
- [ ] Todas as lições novas têm `introduction`, `sections` e `problem`
- [ ] Todos os exercícios `reconstruct` têm `correct_order`
- [ ] Todos os `related_concepts` em `concepts.json` referenciam ids existentes
- [ ] `CHANGELOG.md` actualizado com a versão e as alterações
- [ ] `docs/modules.md` actualizado se um módulo foi adicionado ou alterado
