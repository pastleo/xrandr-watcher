build: xrandr-watcher # first target is default target

xrandr-watcher.js:
	npm install
	npm run build

xrandr-watcher: xrandr-watcher.js
	echo '#!/usr/bin/env node' > xrandr-watcher
	cat xrandr-watcher.js >> xrandr-watcher
	chmod +x xrandr-watcher

clean:
	rm -rf xrandr-watcher.js xrandr-watcher

# .PHONY steps that are not an actual file to be build
.PHONY: build clean
