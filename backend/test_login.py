import requests

url = 'http://localhost:8000/api/auth/login'
data = {'email': 'test@example.com', 'password': 'testpass123'}

try:
    response = requests.post(url, json=data, timeout=3)
    print(f'Status: {response.status_code}')
    res = response.json()
    if response.status_code == 401:
        print(f'✓ Login endpoint working! Expected 401 for non-existent user')
        print(f'Response: {res}')
    elif response.status_code == 500:
        print(f'✗ Still getting 500 error: {res}')
    else:
        print(f'Response: {res}')
except requests.exceptions.ConnectionError:
    print('✗ Backend not running. Start it with:')
    print('  cd backend')
    print('  uvicorn app.main:app --reload --port 8000')
except Exception as e:
    print(f'Error: {type(e).__name__}: {e}')
