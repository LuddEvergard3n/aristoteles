/** Centraliza metadados editoriais sem alterar os IDs curriculares legados. */
export const Editorial = {
  enrich(collection, kind, catalog) {
    const defaults = catalog?.defaults?.[kind] || {};
    const sourceById = new Map((catalog?.sources || []).map(source => [source.id, source]));
    return (collection || []).map(item => ({
      ...item,
      lastReviewed: item.lastReviewed || catalog?.reviewedAt,
      reviewStatus: item.reviewStatus || defaults.reviewStatus || 'pendente',
      sources: item.sources || (defaults.sourceIds || []).map(id => sourceById.get(id)).filter(Boolean),
      perspectives: item.perspectives || [],
      citationNature: kind === 'text' ? (item.citationNature || 'tradução didática') : item.citationNature,
      sourceLocator: kind === 'text' ? (item.sourceLocator || item.source || '') : item.sourceLocator,
      textAbsenceRationale: kind === 'lesson' ? (item.textAbsenceRationale || catalog?.textAbsenceRationale?.[item.id] || '') : item.textAbsenceRationale
    }));
  },

  sourceLabel(source) {
    return `${source.author} — ${source.title} (${source.year})`;
  }
};
