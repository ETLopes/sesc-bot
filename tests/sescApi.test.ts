// Aggregated tests for sescApi with isolation

const resetAll = () => {
  jest.resetModules();
  jest.clearAllMocks();
  jest.resetAllMocks();
  delete (process.env as any).CATEGORIA_DEFAULT;
  delete (process.env as any).CATEGORIES;
  delete (process.env as any).GRATUITO;
  delete (process.env as any).ONLINE;
};

describe('sescApi.branches', () => {
  beforeEach(resetAll);
  require('./legacy/sescApi.branches.test');
});

describe('sescApi.buildUrl', () => {
  beforeEach(resetAll);
  require('./legacy/sescApi.buildUrl.test');
});

describe('sescApi.categoria.default.branch', () => {
  beforeEach(resetAll);
  require('./legacy/sescApi.categoria.default.branch.test');
});

describe('sescApi.defaultCategoria', () => {
  beforeEach(resetAll);
  require('./legacy/sescApi.defaultCategoria.test');
});

describe('sescApi.error', () => {
  beforeEach(resetAll);
  require('./legacy/sescApi.error.test');
});

describe('sescApi.missingAtividade', () => {
  beforeEach(resetAll);
  require('./legacy/sescApi.missingAtividade.test');
});

describe('sescApi.normalize.branches', () => {
  beforeEach(resetAll);
  require('./legacy/sescApi.normalize.branches.test');
});

describe('sescApi.null.items', () => {
  beforeEach(resetAll);
  require('./legacy/sescApi.null.items.test');
});

describe('sescApi.params.branches', () => {
  beforeEach(resetAll);
  require('./legacy/sescApi.params.branches.test');
});

describe('sescApi.core', () => {
  beforeEach(resetAll);
  require('./legacy/sescApi.test');
});
