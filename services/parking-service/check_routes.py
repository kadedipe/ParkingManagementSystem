import json

with open('openapi.json', 'r') as f:
    data = json.load(f)

paths = list(data.get('paths', {}).keys())
print('Registered paths:')
for p in sorted(paths):
    print(f'  {p}')

print('\nV1/Auth paths:')
v1_paths = [p for p in paths if 'v1' in p or 'auth' in p]
for p in sorted(v1_paths):
    print(f'  {p}')
