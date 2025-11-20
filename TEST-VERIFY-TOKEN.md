# Test du nouvel endpoint de vérification de token

## 🎯 Objectif

Tester le nouvel endpoint `GET /api/v1/users/verify-token` qui vérifie la validité d'un token JWT et retourne les données utilisateur.

## 🚀 Utilisation rapide

### 1. Obtenir un token

Connectez-vous d'abord pour obtenir un token :

```bash
curl -X POST https://beyond-fashion-api-ts-8ruc.onrender.com/api/v1/users/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"your@email.com","password":"yourpassword"}'
```

Copiez le token depuis la réponse JSON (champ `data.token`).

### 2. Tester avec le script

```bash
./test-verify-token.sh <votre_token>
```

### 3. Tester manuellement avec curl

```bash
curl -X GET https://beyond-fashion-api-ts-8ruc.onrender.com/api/v1/users/verify-token \
  -H "Authorization: Bearer <votre_token>" \
  -H "Content-Type: application/json"
```

## 📋 Réponses attendues

### ✅ Token valide (200 OK)

```json
{
  "message": "Valid token",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstname": "John",
    "lastname": "Doe",
    "phoneNumber": "+1234567890",
    "address": "123 Main St",
    "gender": "M",
    "photoUrl": "https://...",
    "credit": 0,
    "createdAt": "2025-11-20T10:00:00.000Z",
    "updatedAt": "2025-11-20T10:00:00.000Z",
    "roles": [
      {
        "id": 1,
        "name": "SIMPLE"
      }
    ]
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### ❌ Token invalide ou expiré (401 Unauthorized)

```json
{
  "message": "Unauthorized: Invalid or expired token"
}
```

### ❌ Token blacklisté (401 Unauthorized)

```json
{
  "message": "Unauthorized: Token blacklisted"
}
```

### ❌ Pas de token fourni (401 Unauthorized)

```json
{
  "message": "Unauthorized: No token provided or incorrect format"
}
```

### ⚠️ Token valide mais utilisateur supprimé (404 Not Found)

```json
{
  "message": "User not found"
}
```

## 🧪 Scénarios de test

### Scénario 1 : Token valide

1. Se connecter pour obtenir un token
2. Appeler `/verify-token` avec le token
3. ✅ Devrait retourner 200 avec les données utilisateur

### Scénario 2 : Token après logout

1. Se connecter pour obtenir un token
2. Se déconnecter avec `/logout`
3. Appeler `/verify-token` avec le même token
4. ❌ Devrait retourner 401 "Token blacklisted"

### Scénario 3 : Token expiré

1. Utiliser un vieux token (si JWT_EXPIRATION est court)
2. Appeler `/verify-token`
3. ❌ Devrait retourner 401 "Invalid or expired token"

### Scénario 4 : Token malformé

1. Appeler `/verify-token` avec un token invalide
2. ❌ Devrait retourner 401 "Invalid or expired token"

### Scénario 5 : Sans token

1. Appeler `/verify-token` sans header Authorization
2. ❌ Devrait retourner 401 "No token provided"

## 🔧 Tests avec Postman

### Configuration

1. **URL** : `https://beyond-fashion-api-ts-8ruc.onrender.com/api/v1/users/verify-token`
2. **Méthode** : GET
3. **Headers** :
   - `Authorization`: `Bearer <votre_token>`
   - `Content-Type`: `application/json`

### Collection Postman

Vous pouvez créer une collection avec ces requêtes :

1. **Login** (POST `/users/login`)
2. **Verify Token** (GET `/users/verify-token`)
3. **Logout** (GET `/users/logout`)
4. **Verify Token After Logout** (GET `/users/verify-token`)

## 📊 Comparaison avec l'ancien endpoint

| Caractéristique | POST `/verify` | GET `/verify-token` (nouveau) |
|----------------|----------------|-------------------------------|
| Méthode | POST | GET |
| Token dans | Body | Header Authorization |
| Vérifie blacklist | ❌ Non | ✅ Oui |
| Retourne user data | ❌ Non | ✅ Oui |
| Usage recommandé | Vérification simple | Restauration de session |

## 🐛 Débogage

### Erreur : "jq: command not found"

Le script utilise `jq` pour formater le JSON. Installez-le :

```bash
# Ubuntu/Debian
sudo apt-get install jq

# macOS
brew install jq
```

Ou utilisez curl directement sans le script.

### Erreur : Connection refused

Vérifiez que :
1. Le backend est déployé et en ligne
2. L'URL est correcte
3. Vous avez une connexion internet

### Token toujours invalide

Vérifiez que :
1. Le token est copié correctement (sans espaces)
2. Le token n'a pas expiré
3. Le JWT_SECRET est le même entre login et vérification

## 📝 Notes

- Le token est retourné dans la réponse pour faciliter l'utilisation côté frontend
- Les données utilisateur excluent le mot de passe pour la sécurité
- Le endpoint vérifie d'abord la blacklist avant de décoder le JWT (optimisation)

## 🔗 Endpoints liés

- `POST /api/v1/users/login` - Connexion et obtention du token
- `GET /api/v1/users/logout` - Déconnexion et blacklist du token
- `POST /api/v1/users/verify` - Vérification simple (sans blacklist)
- `GET /api/v1/users/get-one` - Récupération des données utilisateur (nécessite token)
