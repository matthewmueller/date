test: install
	@./node_modules/.bin/mocha -R spec

install:
	@npm install

dist: install dist-build dist-minify

disc:
	@./node_modules/.bin/browserify index.js --full-paths | discify --open

dist-build:
	@mkdir -p dist
	@./node_modules/.bin/browserify index.js --standalone date -o dist/date.js

dist-minify: dist/date.js
	@curl -s \
		-d compilation_level=SIMPLE_OPTIMIZATIONS \
		-d output_format=text \
		-d output_info=compiled_code \
		--data-urlencode "js_code@$<" \
		http://closure-compiler.appspot.com/compile \
		> $<.tmp
	@mv $<.tmp dist/date.min.js

.PHONY: test dist disc install
