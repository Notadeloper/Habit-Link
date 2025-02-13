During deployment, change DB_HOST in env to db for when backend is also on docker (use localhost when developing)

To run backend in dev -> npm run dev

To run DB in dev -> docker compose up -d db


 docker exec -it prisma_postgres psql -U postgres -d habitlinkdb 
 lets you view the sql database
 
or use
npx prisma studio




 When updating database:
 run 
 npx prisma migrate dev --name "adding specific habit details"

 then change db host to db and 
docker-compose run app npx prisma migrate deploy