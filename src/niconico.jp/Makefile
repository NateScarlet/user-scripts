.PHONY: default
default: style.css

style.css: *.html
	NODE_ENV=production npx tailwindcss --minify -o $@
