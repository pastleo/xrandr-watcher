# xrandr-watcher
xrandr event watcher

## Requirements

* `nodejs` (v13 is required for building and development)

## Setup

on ArchLinux, use AUR helper [yay](https://github.com/Jguer/yay.git) to install [xrandr-watch](https://aur.archlinux.org/packages/xrandr-watch-git/)

```bash
yay -S xrandr-watch-git
```

this AUR includes a user system unit `xrandr-watcher.service`:

```bash
systemctl --user start xrandr-watcher.service
journalctl --user-unit=xrandr-watcher.service -f # change screen setting to see if it is working
```

create a script `~/.xrandr-changed` with execution permission to perform tasks you want to run after screen changed, for example:

```bash
#!/bin/sh

xinput map-to-output "Wacom HID 4861 Finger touch" "eDP1"
```

and restart, test and enable the service:

```bash
systemctl --user restart xrandr-watcher.service
journalctl --user-unit=xrandr-watcher.service -f # change screen setting to see if it is working
systemctl --user enable xrandr-watcher.service
```

PS : The `PKGBUILD` file and the `xrandr-watcher.service` are in the [master branch](https://github.com/pastleo/xrandr-watcher/tree/master).

## Commandline Usage

```
xrandr-watcher path/to/handler/script [notifyMask]

  path/to/handler/script should have execution permission
  notifyMask is by default ScreenChange, and can be one of All, ScreenChange, CrtcChange, OutputChange, OutputProperty
```

## Build

```bash
git clone git@github.com:pastleo/xrandr-watcher.git
cd xrandr-watcher
make
```

then `./xrandr-watcher` is the built executable

## Development

```bash
git clone git@github.com:pastleo/xrandr-watcher.git
cd xrandr-watcher
npm install
npm start
```
