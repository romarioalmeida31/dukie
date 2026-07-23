# Dukie

Dukie é uma aplicação web para organizar e acompanhar séries de forma pessoal. Ela permite descobrir títulos pelo catálogo do TMDB, adicioná-los à biblioteca, marcar episódios como assistidos e acompanhar o progresso de cada temporada.

> A aplicação não possui recursos de rede social. Contas, favoritos, biblioteca e histórico ficam armazenados somente no navegador do usuário.

## Demonstração

A versão publicada está disponível em:

https://dukie-series.romab3tv.chatgpt.site

## Funcionalidades

- Cadastro e login local com senha derivada por SHA-256 e salt individual.
- Catálogo de séries em alta fornecido pelo TMDB.
- Pesquisa por título e gênero.
- Pôsteres, banners, sinopses, notas e datas oficiais.
- Página de detalhes com temporadas e episódios.
- Marcação de episódios assistidos.
- Barra de progresso por série e temporada.
- Biblioteca dividida entre séries em andamento e finalizadas.
- Lista de favoritos.
- Estatísticas de tempo e quantidade de episódios assistidos.
- Dados isolados por conta local.
- Layout responsivo com navegação inferior no celular e menu lateral no desktop.
- Interface escura e suporte a preferências de redução de movimento.

## Tecnologias

- React 19
- Vite e vinext
- Tailwind CSS
- React Router
- Lucide React
- TMDB API
- LocalStorage e Web Crypto API
- Cloudflare Worker para publicação da SPA

## Requisitos

- Node.js 22 ou superior
- npm
- Uma conta no [TMDB](https://www.themoviedb.org/)
- API Read Access Token ou API Key v3 do TMDB

## Instalação

Clone o repositório:

```bash
git clone https://github.com/romarioalmeida31/dukie.git
cd dukie
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo de configuração local a partir do exemplo:

```bash
cp .env.example .env
```

Configure uma das credenciais do TMDB no arquivo `.env`.

Opção recomendada, usando o API Read Access Token:

```env
VITE_TMDB_ACCESS_TOKEN=seu_token_de_leitura_tmdb
```

Ou utilize uma API Key v3:

```env
VITE_TMDB_API_KEY=sua_api_key_v3
```

As credenciais podem ser obtidas em [TMDB → Settings → API](https://www.themoviedb.org/settings/api).

> Nunca publique o arquivo `.env`. Ele já está incluído no `.gitignore` do projeto.

## Executando localmente

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse o endereço exibido no terminal, normalmente `http://localhost:3000`.

## Build de produção

Gere a SPA e o Worker autocontido:

```bash
npm run build
```

Os arquivos gerados ficam em `dist/`:

- `dist/client`: HTML, CSS e JavaScript da SPA.
- `dist/server/index.js`: Worker que entrega os arquivos da aplicação e suporta as rotas do React Router.

## Persistência e autenticação

A Dukie foi criada como um MVP sem backend. Por isso:

- As contas existem somente no navegador em que foram criadas.
- A biblioteca não é sincronizada entre dispositivos.
- Limpar os dados do navegador remove contas e histórico.
- O login local não deve ser tratado como autenticação de produção.

Para uma versão multiusuário real, o próximo passo recomendado é integrar um backend com autenticação e banco de dados, como Supabase, Firebase ou uma API própria.

## Estrutura principal

```text
src/
├── components/   # Layout e componentes reutilizáveis
├── hooks/        # Autenticação, TMDB e estado persistente
├── services/     # Cliente da API do TMDB
├── views/        # Dashboard, catálogo, detalhes e estatísticas
└── App.jsx       # Rotas e composição da aplicação
spa/             # Entrada da versão SPA
scripts/         # Empacotamento para publicação
```

## Fonte dos dados

Este produto utiliza a API do TMDB, mas não é endossado nem certificado pelo TMDB.

## Licença

Este projeto ainda não possui uma licença definida.
