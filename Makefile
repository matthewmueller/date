test:
	@./node_modules/.bin/mocha -R spec

build: components index.js
	@component build --dev

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

dist: components dist-build dist-minify

dist-build:
	@component build -s date -o dist -n date

dist-minify: dist/date.js
	@curl -s \
		-d compilation_level=SIMPLE_OPTIMIZATIONS \
		-d output_format=text \
		-d output_info=compiled_code \
		--data-urlencode "js_code@$<" \
		http://closure-compiler.appspot.com/compile \
		> $<.tmp
	@mv $<.tmp dist/date.min.js

.PHONY: test clean
