## Bienvenidos al Asistente Personal con IA basado de Chat GPT

El deploy fue hecho en dos lugares:
https://asistente-personal.onrender.com/ y https://asistente-personal-generativo.vercel.app/
En Vercel funciona mejor

Para que funcione local: Puedes usar cualquier navegador. 
Clona el repositorio y luego npm install. 
Crea una base de datos postgre en tu compu llamada "meetings". 
Las tablas se crean de forma automática. 
Debes tener una OPENAI_API_KEY porque utiliza el modelo GPT-4o.

## Importante
Para que funcione en forma local, crea un .env.local,


El .env.local debe ser:
OPENAI_API_KEY = tu clave
DB_USER= tu usuario postgre
DB_PASSWORD=tu clave de postgre
DB_HOST=localhost:5432
DB_NAME=meetings
LANGUAGE=spanish
NEXT_PUBLIC_BASE_URL=http://localhost:3000


