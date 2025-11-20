#!/bin/bash

# Script de test pour le nouvel endpoint de vérification de token
# Usage: ./test-verify-token.sh <your_token>

API_URL="https://beyond-fashion-api-ts-8ruc.onrender.com/api/v1"
# Pour les tests locaux, utilisez :
# API_URL="http://localhost:3000/api/v1"

echo "🧪 Test de l'endpoint /users/verify-token"
echo "=========================================="
echo ""

# Vérifier si un token est fourni
if [ -z "$1" ]; then
    echo "❌ Erreur: Aucun token fourni"
    echo "Usage: $0 <your_token>"
    echo ""
    echo "Pour obtenir un token, connectez-vous d'abord :"
    echo "curl -X POST $API_URL/users/login \\"
    echo "  -H 'Content-Type: application/json' \\"
    echo "  -d '{\"email\":\"your@email.com\",\"password\":\"yourpassword\"}'"
    exit 1
fi

TOKEN=$1

echo "📤 Envoi de la requête..."
echo "URL: $API_URL/users/verify-token"
echo "Token: ${TOKEN:0:20}..."
echo ""

# Test 1: Vérification avec token valide
echo "Test 1: Vérification du token"
echo "------------------------------"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/users/verify-token" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "Status Code: $HTTP_CODE"
echo "Response Body:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Test réussi ! Token valide"
    echo ""
    echo "Données utilisateur récupérées :"
    echo "$BODY" | jq '.user' 2>/dev/null || echo "Impossible de parser le JSON"
elif [ "$HTTP_CODE" = "401" ]; then
    echo "❌ Token invalide ou expiré"
    MESSAGE=$(echo "$BODY" | jq -r '.message' 2>/dev/null)
    echo "Message: $MESSAGE"
    
    if echo "$MESSAGE" | grep -q "blacklisted"; then
        echo "ℹ️  Le token a été blacklisté (logout effectué)"
    fi
elif [ "$HTTP_CODE" = "404" ]; then
    echo "⚠️  Token valide mais utilisateur non trouvé"
else
    echo "❌ Erreur inattendue"
fi

echo ""
echo "=========================================="
echo "Test terminé"
