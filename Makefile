test:
	@./node_modules/.bin/mocha -R spec

build: components index.js
	@component build --dev

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

.PHONY: test clean
