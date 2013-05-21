build: components date.js css/base.css css/layout.css
	@component build

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

.PHONY: test clean
