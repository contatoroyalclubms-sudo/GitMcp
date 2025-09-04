import requests
import json
from datetime import datetime, timezone, timedelta

# Teste direto para o endpoint de criação de eventos

url = "http://localhost:8000/api/eventos/"

# Token de autenticação (o que foi usado no teste anterior)
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZXhwIjoxNzI1NDEzNDAwfQ.hPJZXCOXR_p8Kz8LBojsR0eJFrxUlcglJqUu_VG6VZs"

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

# Dados do evento com data futura
data_evento = datetime.now(timezone.utc).replace(microsecond=0) + timedelta(days=30)

data = {
    "nome": "Evento Teste Debug",
    "descricao": "Teste de criação via script direto",
    "data_evento": data_evento.isoformat(),
    "local": "Local Teste Debug",
    "endereco": "Endereço Teste",
    "limite_idade": 18,
    "capacidade_maxima": 100
}

print("=" * 50)
print("TESTE DIRETO - CRIAÇÃO DE EVENTO")
print(f"URL: {url}")
print(f"Data: {json.dumps(data, indent=2)}")
print("=" * 50)

try:
    response = requests.post(url, headers=headers, json=data, timeout=30)
    
    print(f"Status Code: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    
    if response.status_code == 200:
        print("✅ Sucesso!")
        print(f"Resposta: {response.json()}")
    else:
        print("❌ Erro!")
        print(f"Resposta: {response.text}")
        
except Exception as e:
    print(f"❌ Erro na requisição: {e}")
