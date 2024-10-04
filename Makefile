build:
	docker build -t tgbot-image .

run:
	docker run --restart=always -d -p 3022:3022 --name tgbot --rm tgbot-image