# xrandr-watcher
xrandr event watcher

## Requirements

* `nodejs` (I use `12.10.0` during build and development)

## Build

```bash
git clone git@github.com:pastleo/xrandr-watcher.git
cd xrandr-watcher
make
```

then `./xrandr-watcher` is the built executable

## Usage

```
xrandr-watcher path/to/handler/script [notifyMask]

  path/to/handler/script should have execution permission
  notifyMask is by default ScreenChange, and can be one of All, ScreenChange, CrtcChange, OutputChange, OutputProperty
```

## Development

```bash
git clone git@github.com:pastleo/xrandr-watcher.git
cd xrandr-watcher
npm install
npm start
```
