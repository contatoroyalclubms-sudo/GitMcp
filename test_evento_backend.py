#!/usr/bin/env python3
"""
Teste direto do endpoint de criação de eventos no backend
"""
import requests
import json

# Dados para login
login_data = {
    "usuario": "00000000000",
    "senha": "0000"
}

# Dados do evento teste
evento_data = {
    "nome": "Teste Backend Direto",
    "descricao": "Teste direto do backend localhost",
    "data_evento": "2025-09-04T15:00:00",
    "local": "Local Teste Backend",
    "endereco": "Endereco Teste",
    "limite_idade": 18,
    "capacidade_maxima": 100
}

def test_backend():
    try:
        print("🔄 Testando login...")
        
        # 1. Fazer login
        login_response = requests.post(
            "http://localhost:8000/api/auth/login",
            data=login_data,  # Usando form data para login
            timeout=10
        )
        
        print(f"📝 Status do login: {login_response.status_code}")
        
        if login_response.status_code != 200:
            print(f"❌ Erro no login: {login_response.text}")
            return
            
        token = login_response.json()["access_token"]
        print(f"✅ Token obtido: {token[:20]}...")
        
        # 2. Criar evento
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        print("🔄 Criando evento...")
        print(f"📝 Dados do evento: {json.dumps(evento_data, indent=2)}")
        
        evento_response = requests.post(
            "http://localhost:8000/api/eventos/",
            json=evento_data,
            headers=headers,
            timeout=10
        )
        
        print(f"📝 Status da criação: {evento_response.status_code}")
        print(f"📝 Response headers: {dict(evento_response.headers)}")
        print(f"📝 Response body: {evento_response.text}")
        
        if evento_response.status_code == 201:
            print("✅ Evento criado com sucesso!")
            created_evento = evento_response.json()
            print(f"📝 Evento criado: {json.dumps(created_evento, indent=2)}")
        else:
            print(f"❌ Erro na criação: {evento_response.status_code}")
            
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")

if __name__ == "__main__":
    test_backend()
