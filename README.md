# MedClinic API — Etapa 1: Autenticação e Autorização

API REST para o gerenciamento de uma clínica médica de pequeno porte. Esta primeira etapa implementa exclusivamente a **base de acesso do sistema**: cadastro de usuários, autenticação via JWT e autorização baseada em perfis (RBAC). Os módulos de domínio da clínica (especialidades, médicos, pacientes, consultas) serão implementados em uma etapa futura, sobre esta mesma base de código.

## Tecnologias utilizadas

- **Node.js** — runtime JavaScript
- **TypeScript** — tipagem estática
- **Express.js** — framework web
- **TypeORM** — ORM para banco de dados
- **PostgreSQL** — banco de dados relacional
- **JWT** (`jsonwebtoken`) — autenticação com tokens
- **bcryptjs** — hash criptográfico de senhas
- **dotenv** — variáveis de ambiente
- **Docker & Docker Compose** — containerização (PostgreSQL)

## Arquitetura e estrutura de pastas

Arquitetura MVC organizada em camadas, já preparada para receber os futuros módulos de domínio da clínica sem necessidade de reestruturação:

```
src/
├── database/           # Configuração TypeORM e schema SQL
│   ├── data-source.ts  # Conexão e configuração do banco
│   └── schema.sql      # DDL (criação de tabelas)
├── entities/           # Entidades TypeORM (tabelas do banco)
│   └── User.ts         # Entidade de usuários
├── dtos/               # DTOs (Data Transfer Objects)
│   ├── CreateUserDTO.ts
│   ├── LoginDTO.ts
│   └── UserResponseDTO.ts
├── repositories/       # Camada de acesso a dados
│   └── UserRepository.ts
├── services/           # Lógica de negócio e validações
│   ├── UserService.ts
│   └── AuthService.ts
├── controllers/        # Controllers (HTTP handlers)
│   ├── AuthController.ts
│   ├── UserController.ts
│   └── AdminController.ts
├── middlewares/        # Middlewares (autenticação, autorização, erros)
│   ├── authMiddleware.ts
│   ├── roleMiddleware.ts
│   └── errorMiddleware.ts
├── routes/             # Definição dos endpoints
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   ├── admin.routes.ts
│   └── index.ts
├── utils/              # Funções auxiliares
│   ├── hash.ts         # Hash bcrypt
│   ├── jwt.ts          # Geração e validação JWT
│   └── AppError.ts     # Classe de erro customizada
├── types/              # Extensões de tipos TypeScript
│   └── express.d.ts    # Tipagem de req.user
└── server.ts           # Ponto de entrada (Express + conexão BD)
```

## Configuração do banco de dados

### Opção recomendada — PostgreSQL via Docker

O PostgreSQL roda em container; a **API roda na máquina, pelo terminal** (RNF01).
O `docker-compose.yml` publica a porta 5432 no host, por isso o `.env` usa `DB_HOST=localhost`.

```bash
# Sobe apenas o PostgreSQL, já com o banco medclinic_db criado
docker compose up -d

# Confere que o container está saudável (STATUS deve mostrar "healthy")
docker ps

# Derruba o container (os dados permanecem no volume)
docker compose down

# Derruba o container E apaga os dados
docker compose down -v
```

Se aparecer `The container name "/medclinic_postgres" is already in use`, remova o container antigo e suba novamente:

```bash
docker rm -f medclinic_postgres
docker compose up -d
```

Se aparecer `ECONNREFUSED 127.0.0.1:5432` ao rodar a aplicação, o container não está de pé — rode `docker compose up -d` antes.

### Opção alternativa — PostgreSQL instalado localmente

Crie um banco de dados vazio, por exemplo `medclinic_db`:

```sql
CREATE DATABASE medclinic_db;
```

### Criação da tabela `users`

**Não é necessário rodar nenhum comando extra.** O `DataSource` está configurado com `synchronize: true` (ver `src/database/data-source.ts`), portanto o TypeORM cria a tabela `users` — e o tipo enumerado `users_role_enum` — automaticamente, a partir da entidade `User`, na primeira vez que a aplicação sobe (`npm run dev`).

O script DDL equivalente está versionado em `src/database/schema.sql`. Ele documenta em SQL puro exatamente a estrutura gerada e pode ser executado manualmente, caso se prefira criar a tabela antes de subir a aplicação:

```bash
psql -U postgres -d medclinic_db -f src/database/schema.sql
```

> **Nota técnica:** `synchronize: true` é adequado ao escopo desta etapa (uma única entidade, ambiente de desenvolvimento). Em produção, o padrão seria `synchronize: false` acompanhado de migrations versionadas, já que o modo synchronize pode alterar ou remover colunas automaticamente ao acompanhar uma mudança de entidade.

## Variáveis de ambiente

Copie o arquivo de exemplo e ajuste os valores conforme seu ambiente:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com os seguintes valores:

| Variável         | Descrição                                              | Exemplo                  |
|------------------|---------------------------------------------------------|---------------------------|
| `PORT`           | Porta em que a API vai escutar                          | `3333`                    |
| `DB_HOST`        | Host do PostgreSQL                                      | `localhost`                |
| `DB_PORT`        | Porta do PostgreSQL                                     | `5432`                     |
| `DB_USERNAME`    | Usuário do PostgreSQL                                   | `postgres`                 |
| `DB_PASSWORD`    | Senha do PostgreSQL                                     | `postgres`                 |
| `DB_DATABASE`    | Nome do banco de dados                                  | `medclinic_db`             |
| `JWT_SECRET`     | Segredo usado para assinar os tokens JWT                | (gere um valor aleatório) |
| `JWT_EXPIRES_IN` | Tempo de expiração do token                             | `1h`                       |

**Exemplo de `.env`:**

```
PORT=3333
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=medclinic_db
JWT_SECRET=sua-chave-secreta-super-segura-aqui-123456
JWT_EXPIRES_IN=1h
```

## Instalação e execução

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente (ver seção acima)
cp .env.example .env
nano .env  # ou editor de sua escolha

# 3. Subir PostgreSQL (se usando Docker)
docker compose up -d

# 4. Rodar em modo desenvolvimento (com recarregamento automático)
#    Na primeira execução, o TypeORM cria a tabela "users" automaticamente
npm run dev

# 5. Ou gerar o build de produção e executar
npm run build
npm start
```

Ao subir com sucesso, o terminal exibe:

```
Conexao com o PostgreSQL estabelecida com sucesso.
MedClinic API rodando em http://localhost:3333
```

## Perfis de acesso (RBAC)

| Perfil (`role`) | Descrição                                                      |
|------------------|-----------------------------------------------------------------|
| `admin`          | Administrador — acesso completo às funcionalidades da API       |
| `attendant`      | Atendente — acesso operacional, com permissões restritas         |

Se o campo `role` não for informado no cadastro, o usuário é criado como `attendant`.

## Documentação dos endpoints

### Base URL

```
http://localhost:3333
```

### `POST /auth/register`

Cadastra um novo usuário. **Rota pública.**

**Body:**

```json
{
  "name": "Ana Admin",
  "email": "ana@medclinic.com",
  "password": "admin123",
  "role": "admin"
}
```

`role` é opcional (`admin` ou `attendant`; padrão `attendant`).

**Resposta — 201 Created:**

```json
{
  "id": "977f1db3-dac6-4bdf-836d-605e089d4623",
  "name": "Ana Admin",
  "email": "ana@medclinic.com",
  "role": "admin",
  "createdAt": "2026-09-10T16:57:42.573Z"
}
```

**Erros possíveis:**

- `400` — dados inválidos (nome < 2 caracteres, email inválido, etc.)
- `409` — e-mail já cadastrado

---

### `POST /auth/login`

Autentica um usuário e devolve um token JWT. **Rota pública.**

**Body:**

```json
{
  "email": "ana@medclinic.com",
  "password": "admin123"
}
```

**Resposta — 200 OK:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "977f1db3-dac6-4bdf-836d-605e089d4623",
    "name": "Ana Admin",
    "email": "ana@medclinic.com",
    "role": "admin",
    "createdAt": "2026-09-10T16:57:42.573Z"
  }
}
```

**Erros possíveis:**

- `401` — credenciais inválidas (email ou senha incorretos)

---

### `GET /users/me`

Retorna os dados do usuário autenticado. **Rota protegida** (exige token JWT).

**Header:**

```
Authorization: Bearer <token>
```

**Resposta — 200 OK:**
