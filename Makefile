build:
	docker build -t tgbot-image .

run:
	docker run -d -p 3022:3022 --name tgbot --restart=always tgbot-image