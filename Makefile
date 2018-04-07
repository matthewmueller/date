test:
	@./node_modules/.bin/mocha -R spec

build: index.js
	@./node_modules/.bin/browserify --bare --standalone date -o dist/date.js index.js

dist: build minify

minify: dist/date.js
	@curl -s \
		-d compilation_level=SIMPLE_OPTIMIZATIONS \
		-d output_format=text \
		-d output_info=compiled_code \
		--data-urlencode "js_code@$<" \
		http://closure-compiler.appspot.com/compile \
		> $<.tmp
	@mv $<.tmp dist/date.min.js

.PHONY: test clean minify
