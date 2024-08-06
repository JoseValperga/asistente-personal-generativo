##Bienvenidos al Asistente Personal con IA basado de Chat GPT

El deploy fue hecho en dos lugares:
https://asistente-personal.onrender.com/ y https://asistente-personal-generativo.vercel.app/
En Vercel funciona mejor

Para que funcione local: Puedes usar cualquier navegador. 
Clona el repositorio y luego npm install. 
Crea una base de datos postgre en tu compu llamada "meetings". 
Las tablas se crean de forma automática. 
Debes tener una OPENAI_API_KEY porque utiliza el modelo GPT-4o.

##Importante
Para que funcione en forma local, crea un .env.local,
pero tener en cuenta que actualmente funciona con 
una base de datos postgreSQL deployada en Render
por lo que no hace falta que la vayas a crear.

El .env.local debe ser:
OPENAI_API_KEY = tu clave
DB_USER= tu usuario postgre
DB_PASSWORD=tu clave de postgre
DB_HOST=localhost:5432
DB_NAME=meetings
LANGUAGE=spanish
NEXT_PUBLIC_BASE_URL=http://localhost:3000

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
