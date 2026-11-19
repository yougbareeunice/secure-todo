# Secure Todo API (Labs 1 et 2)

API REST d'authentification et de gestion de todos : inscription, connexion, access token (JWT) et refresh token avec rotation, todos privés par utilisateur.

**Stack :** Node.js 24, Express 5, TypeScript, MongoDB 8 (Docker), Mongoose, Zod, jose, Argon2.

## Lancer le projet

```bash
npm install
copy .env.example .env
docker compose up -d
npm run dev
```

Dans `.env`, remplace `JWT_ACCESS_SECRET` par une clé aléatoire d'au moins 32 caractères :

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Si un MongoDB local occupe déjà le port 27017, Docker est exposé sur le port 27018 : adapte `MONGO_URI` en conséquence.

## Tests

```bash
npm test
npm run typecheck
```

Les tests utilisent une base séparée (`todo_test`) vidée avant chaque test.

## Routes

| Méthode | URL | Rôle |
|---|---|---|
| POST | /api/v1/auth/register | Inscription |
| POST | /api/v1/auth/login | Connexion |
| POST | /api/v1/auth/refresh | Nouveau couple de tokens (rotation) |
| POST | /api/v1/auth/logout | Déconnexion |
| GET | /api/v1/auth/me | Profil (token requis) |
| GET, POST | /api/v1/todos | Lister (pagination, filtre), créer |
| GET, PATCH, DELETE | /api/v1/todos/:id | Lire, modifier, supprimer |

## Sécurité

- Mots de passe hashés avec Argon2id, jamais stockés en clair
- Access token court (15 min), refresh token stocké sous forme de hash avec rotation et détection de rejeu
- Chaque todo est filtré par propriétaire, tiré du token (protection contre BOLA)
- Validation des entrées avec Zod, en-têtes de sécurité avec helmet, limitation de débit