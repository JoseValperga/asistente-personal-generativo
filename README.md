## Bienvenidos al Asistente Personal con IA basado de Chat GPT  

Fue creado con Next.js + TypeScript + PostgreSql + Tailwind CSS + SDK AI de Vercel  

Utiliza el modelo gpt-4o  

Lo que puedes hacer:  
- Puedes agendar reuniones con alguna frase, como por ejemplo, "Reunión con pedro el próximo martes a las 17 para hablar de negocios."  
- O pudes decirle "Agenda una reunión de 15 minutos con Luis para el primer lunes de Octubre a las 9 de la mañana para que le de instrucciones."      
- También puedes listar reuniones diciendo, por ejemplo, "Muéstrame las reuniones para hoy, o también, Lista todas las reuniones con Luis."
- Es posible que te pida datos adicionales en algún momento para poder trabajar 
- Toavia no es posible decirle Programa reuniones de 40 minutos con Pedro todos los lunes de Octubre a las 9 de la mañana para darle instrucciones, pero estamos trabajando en eso.  

El deploy fue hecho en dos lugares:  
https://asistente-personal.onrender.com/ y https://asistente-personal-generativo.vercel.app/  
En Vercel funciona mejor.  

Para que funcione local:   
- Puedes usar cualquier navegador.    
- Clona el repositorio y luego npm install.  
- Crea una base de datos postgre en tu compu llamada "meetings".  
- Las tablas se crean de forma automática.  
- Debes tener una OPENAI_API_KEY porque utiliza el modelo GPT-4o.  

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
BASE_URL=http://localhost:3000  


