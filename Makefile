development:
	@PORT=5004 ./node_modules/.bin/scooby dev.html --open

build:
	@./node_modules/.bin/scooby date.css date.js

.PHONY: development build
