

### Deploy project with restore database
```sh
docker-compose up -d mysql && \
sleep 10 && \
docker exec -i $(docker ps | awk '/mysql/ {print $1}') mysql -u root -pahXu8eafish1bee2Eedo blog < backup_db/backup.sql && \
docker-compose up -d 
```
