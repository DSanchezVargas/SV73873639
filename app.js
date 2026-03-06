const $ = (sel) => document.querySelector(sel);

const outputEl = $('#output');
const cardsEl = $('#cards');

const LS_TMDB = 'api_gateway_tmdb_key';
const LS_UNSPLASH = 'api_gateway_unsplash_key';

function pretty(obj) {
  return typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2);
}

function setOutput(text, isError = false) {
  outputEl.textContent = text;
  outputEl.style.borderColor = isError ? 'rgba(255, 107, 107, 0.35)' : 'rgba(255, 255, 255, 0.08)';
}

function getSavedKeys() {
  return {
    tmdb: localStorage.getItem(LS_TMDB) || '',
    unsplash: localStorage.getItem(LS_UNSPLASH) || ''
  };
}

function saveKeys(tmdb, unsplash) {
  localStorage.setItem(LS_TMDB, tmdb.trim());
  localStorage.setItem(LS_UNSPLASH, unsplash.trim());
}

function clearKeys() {
  localStorage.removeItem(LS_TMDB);
  localStorage.removeItem(LS_UNSPLASH);
}

async function runApi(def, values) {
  const url = def.buildUrl(values);
  const headers = def.buildHeaders ? def.buildHeaders(values) : {};

  setOutput(`Enviando request...\n${def.method} ${url}`);

  try {
    const res = await fetch(url, { method: def.method, headers });

    const contentType = res.headers.get('content-type') || '';
    let body;

    if (contentType.includes('application/json')) {
      body = await res.json();
    } else {
      body = await res.text();
    }

    if (!res.ok) {
      setOutput(pretty({
        error: true,
        status: res.status,
        statusText: res.statusText,
        url,
        body
      }), true);
      return;
    }

    setOutput(pretty({
      ok: true,
      status: res.status,
      url,
      body
    }));
  } catch (err) {
    setOutput(pretty({
      error: true,
      message: err?.message || String(err),
      hint: 'Posible CORS (o sin internet). Si ves un error tipo "Failed to fetch", prueba desde otro navegador o usa Postman.'
    }), true);
  }
}

function cardTemplate(def) {
  const wrap = document.createElement('article');
  wrap.className = 'card';

  wrap.innerHTML = `
    <div>
      <h4>${def.title}</h4>
      <div class="meta">${def.method} · ${def.base}</div>
    </div>
    ${def.corsNote ? `<div class="badge warn">CORS: ${def.corsNote}</div>` : `<div class="badge ok">CORS: normalmente OK</div>`}
    <div class="inputs"></div>
    <div class="actions">
      <button class="btn primary">Ejecutar</button>
      <button class="btn">Ver URL</button>
    </div>
  `;

  const inputsEl = wrap.querySelector('.inputs');
  const runBtn = wrap.querySelectorAll('button')[0];
  const urlBtn = wrap.querySelectorAll('button')[1];

  const inputs = {};

  for (const inp of def.inputs) {
    const label = document.createElement('label');
    label.className = 'field';
    label.innerHTML = `<span class="muted">${inp.label}</span><input placeholder="${inp.placeholder || ''}" value="${inp.defaultValue || ''}" />`;
    const input = label.querySelector('input');
    inputs[inp.key] = input;
    inputsEl.appendChild(label);
  }

  runBtn.addEventListener('click', () => {
    const values = Object.fromEntries(Object.entries(inputs).map(([k, el]) => [k, el.value]));
    runApi(def, values);
  });

  urlBtn.addEventListener('click', () => {
    const values = Object.fromEntries(Object.entries(inputs).map(([k, el]) => [k, el.value]));
    const url = def.buildUrl(values);
    setOutput(url);
  });

  return wrap;
}

// 15 endpoints (sin unificar)
const apis = [
  {
    id: 'github_user',
    title: '01 - GitHub: Usuario',
    method: 'GET',
    base: 'https://api.github.com',
    inputs: [
      { key: 'username', label: 'github_username', defaultValue: 'octocat', placeholder: 'ej: octocat' }
    ],
    buildUrl: (v) => `https://api.github.com/users/${encodeURIComponent(v.username)}`
  },
  {
    id: 'wttr',
    title: '02 - Clima: wttr.in',
    method: 'GET',
    base: 'https://wttr.in',
    inputs: [
      { key: 'city', label: 'city', defaultValue: 'Lima', placeholder: 'ej: Lima' }
    ],
    buildUrl: (v) => `https://wttr.in/${encodeURIComponent(v.city)}?format=j1`
  },
  {
    id: 'frankfurter',
    title: '03 - Tipo de cambio: Frankfurter (USD → PEN)',
    method: 'GET',
    base: 'https://api.frankfurter.app',
    inputs: [],
    buildUrl: () => `https://api.frankfurter.app/latest?from=USD&to=PEN`
  },
  {
    id: 'poke_list',
    title: '04 - PokeAPI: Lista de Pokemones',
    method: 'GET',
    base: 'https://pokeapi.co',
    inputs: [
      { key: 'limit', label: 'pokemon_limit', defaultValue: '10', placeholder: 'ej: 10' }
    ],
    buildUrl: (v) => `https://pokeapi.co/api/v2/pokemon?limit=${encodeURIComponent(v.limit)}`
  },
  {
    id: 'poke_one',
    title: '05 - PokeAPI: Detalle Pokemon',
    method: 'GET',
    base: 'https://pokeapi.co',
    inputs: [
      { key: 'name', label: 'pokemon_name', defaultValue: 'pikachu', placeholder: 'ej: pikachu' }
    ],
    buildUrl: (v) => `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(v.name)}`
  },
  {
    id: 'rm_list',
    title: '06 - Rick & Morty: Personajes',
    method: 'GET',
    base: 'https://rickandmortyapi.com',
    inputs: [
      { key: 'page', label: 'rm_page', defaultValue: '1', placeholder: 'ej: 1' }
    ],
    buildUrl: (v) => `https://rickandmortyapi.com/api/character?page=${encodeURIComponent(v.page)}`
  },
  {
    id: 'rm_one',
    title: '07 - Rick & Morty: Detalle',
    method: 'GET',
    base: 'https://rickandmortyapi.com',
    inputs: [
      { key: 'id', label: 'rm_id', defaultValue: '1', placeholder: 'ej: 1' }
    ],
    buildUrl: (v) => `https://rickandmortyapi.com/api/character/${encodeURIComponent(v.id)}`
  },
  {
    id: 'cocktail',
    title: '08 - TheCocktailDB: Buscar cóctel',
    method: 'GET',
    base: 'https://www.thecocktaildb.com',
    inputs: [
      { key: 'q', label: 'cocktail_search', defaultValue: 'margarita', placeholder: 'ej: margarita' }
    ],
    buildUrl: (v) => `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(v.q)}`
  },
  {
    id: 'fakestore',
    title: '09 - FakeStore: Productos',
    method: 'GET',
    base: 'https://fakestoreapi.com',
    inputs: [
      { key: 'limit', label: 'product_limit', defaultValue: '5', placeholder: 'ej: 5' }
    ],
    buildUrl: (v) => `https://fakestoreapi.com/products?limit=${encodeURIComponent(v.limit)}`
  },
  {
    id: 'unsplash',
    title: '10 - Unsplash: Fotos por tema',
    method: 'GET',
    base: 'https://api.unsplash.com',
    corsNote: 'Requiere key. Si falla: revisa Access Key o CORS.',
    inputs: [
      { key: 'key', label: 'unsplash_access_key', defaultValue: getSavedKeys().unsplash, placeholder: 'tu access key' },
      { key: 'query', label: 'photo_query', defaultValue: 'nature', placeholder: 'ej: nature' },
      { key: 'limit', label: 'photo_limit', defaultValue: '5', placeholder: 'ej: 5' }
    ],
    buildUrl: (v) => `https://api.unsplash.com/search/photos?query=${encodeURIComponent(v.query)}&per_page=${encodeURIComponent(v.limit)}`,
    buildHeaders: (v) => ({ Authorization: `Client-ID ${v.key}` })
  },
  {
    id: 'dummy_quotes',
    title: '11 - DummyJSON: Citas',
    method: 'GET',
    base: 'https://dummyjson.com',
    inputs: [
      { key: 'limit', label: 'quote_limit', defaultValue: '5', placeholder: 'ej: 5' }
    ],
    buildUrl: (v) => `https://dummyjson.com/quotes?limit=${encodeURIComponent(v.limit)}`
  },
  {
    id: 'randomuser',
    title: '12 - RandomUser: Usuarios ficticios',
    method: 'GET',
    base: 'https://randomuser.me',
    inputs: [
      { key: 'results', label: 'randomuser_results', defaultValue: '3', placeholder: 'ej: 3' }
    ],
    buildUrl: (v) => `https://randomuser.me/api/?results=${encodeURIComponent(v.results)}`
  },
  {
    id: 'tmdb_trending',
    title: '13 - TMDB: Trending',
    method: 'GET',
    base: 'https://api.themoviedb.org',
    corsNote: 'Requiere Bearer token. Si falla: revisa token o CORS.',
    inputs: [
      { key: 'token', label: 'tmdb_api_key (Bearer)', defaultValue: getSavedKeys().tmdb, placeholder: 'API Read Access Token' },
      { key: 'window', label: 'tmdb_trending_window', defaultValue: 'day', placeholder: 'day | week' }
    ],
    buildUrl: (v) => `https://api.themoviedb.org/3/trending/movie/${encodeURIComponent(v.window)}`,
    buildHeaders: (v) => ({ Authorization: `Bearer ${v.token}`, Accept: 'application/json' })
  },
  {
    id: 'tmdb_movie',
    title: '14 - TMDB: Detalle de película',
    method: 'GET',
    base: 'https://api.themoviedb.org',
    corsNote: 'Requiere Bearer token. Si falla: revisa token o CORS.',
    inputs: [
      { key: 'token', label: 'tmdb_api_key (Bearer)', defaultValue: getSavedKeys().tmdb, placeholder: 'API Read Access Token' },
      { key: 'id', label: 'tmdb_movie_id', defaultValue: '550', placeholder: 'ej: 550' }
    ],
    buildUrl: (v) => `https://api.themoviedb.org/3/movie/${encodeURIComponent(v.id)}`,
    buildHeaders: (v) => ({ Authorization: `Bearer ${v.token}`, Accept: 'application/json' })
  },
  {
    id: 'nasa_mars',
    title: '15 - NASA: Fotos de Marte',
    method: 'GET',
    base: 'https://api.nasa.gov',
    inputs: [
      { key: 'key', label: 'nasa_api_key', defaultValue: 'DEMO_KEY', placeholder: 'DEMO_KEY o tu key' },
      { key: 'sol', label: 'nasa_sol', defaultValue: '1000', placeholder: 'ej: 1000' },
      { key: 'camera', label: 'nasa_camera', defaultValue: 'fhaz', placeholder: 'ej: fhaz' }
    ],
    buildUrl: (v) => `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=${encodeURIComponent(v.sol)}&camera=${encodeURIComponent(v.camera)}&api_key=${encodeURIComponent(v.key)}`
  }
];

function render() {
  cardsEl.innerHTML = '';
  apis.forEach((def) => cardsEl.appendChild(cardTemplate(def)));
}

function initKeysUi() {
  const saved = getSavedKeys();
  $('#tmdbKey').value = saved.tmdb;
  $('#unsplashKey').value = saved.unsplash;

  $('#saveKeys').addEventListener('click', () => {
    saveKeys($('#tmdbKey').value, $('#unsplashKey').value);
    // Actualiza defaults en tarjetas
    render();
    setOutput('Keys guardadas en localStorage.');
  });

  $('#clearKeys').addEventListener('click', () => {
    clearKeys();
    $('#tmdbKey').value = '';
    $('#unsplashKey').value = '';
    render();
    setOutput('Keys borradas.');
  });

  $('#copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(outputEl.textContent);
      setOutput(outputEl.textContent + '\n\n(Copiado al portapapeles)');
    } catch {
      setOutput('No se pudo copiar. Copia manualmente el texto.');
    }
  });

  $('#clear').addEventListener('click', () => {
    setOutput('Selecciona una tarjeta y presiona “Ejecutar”.');
  });
}

render();
initKeysUi();
