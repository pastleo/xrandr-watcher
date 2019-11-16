# xrandr-watcher
xrandr event watcher

## Requirements

* `nodejs` (I use `12.10.0` during build and development)

## Setup

on ArchLinux, use AUR helper [yay](https://github.com/Jguer/yay.git) to install

```bash
yay -S xrandr-watcher-git
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
