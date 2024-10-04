
docker logs
make build
docker images
make run
docker stop tgbot
docker run -d -p 3022:3022 --name tgbot --restart=always tgbot-image

docker ps -a
docker rm name_of_the_docker_container