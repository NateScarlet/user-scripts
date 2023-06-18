.PHONY: default
default: style.css
	make -C ../../

style.css: components/*.ts style.scss
	# 2023-06-17: nested tailwind works but shows a warning
	NODE_ENV=production npx postcss style.scss -o $@
