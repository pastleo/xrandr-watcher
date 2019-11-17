import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

import X11 from 'x11';
import Randr from 'x11/lib/ext/randr.js';

const helpTexts = `
usage:
  ${process.argv.slice(0, 2).join(' ')} path/to/handler/script [notifyMask]

    path/to/handler/script should have execution permission
    notifyMask is by default ScreenChange, and can be one of All, ScreenChange, CrtcChange, OutputChange, OutputProperty
`;

let handlerScript = process.argv[2];
const notifyMask = process.argv[3] || 'ScreenChange';
const DELAYED_TIMEOUT = parseInt(process.env.XRANDR_DELAYED_TIMEOUT) || 2000;

const printStdout = msg => process.stdout.write(msg + '\n');
const printStderr = msg => process.stderr.write(msg + '\n');
const consoleDebug = (
  process.env.NODE_ENV === 'production' ? (() => null) : console.debug
)

const printAndDie = why => {
  process.stderr.write('Error: ');
  printStderr(why.toString());
  process.exit(1);
};

const printHelpAndDie = why => {
  printAndDie([why, helpTexts].join('\n'))
};

if (process.env.XRANDR_DEFAULT_HANDLER_SCRIPT && !fs.existsSync(handlerScript)) {
  handlerScript = process.env.XRANDR_DEFAULT_HANDLER_SCRIPT;
}

try {
  if (!handlerScript) { printHelpAndDie('Please specify a handler script'); }
  if (fs.statSync(handlerScript).isDirectory()) { printHelpAndDie(`${handlerScript} is a directory`); }
  handlerScript = path.resolve(handlerScript);
  fs.access(handlerScript, fs.constants.X_OK, err => {
    if (err) printHelpAndDie(`${err.toString()}, no execution permission`);
  });
} catch (err) {
  printHelpAndDie(err);
}

printStdout(`handlerScript: ${handlerScript}`);

const resultCb2 = (job) => (
  new Promise((resolve, reject) => job((err, result) => {
    if (err) { reject(err); }
    else { resolve(result); }
  }))
);

const startXrandrWatcher = async () => {
  printStdout('xrandr-watcher starting');

  const display = await resultCb2(X11.createClient);

  const X = display.client;
  const root = display.screen[0].root;
  const winId = X.AllocID();

  printStdout('X11 client created, winId allocated');
  // consoleDebug({ display, X });
  consoleDebug({ root, winId });

  const randr = await resultCb2(cb => Randr.requireExt(display, cb));

  printStdout(`X server randr extension version: ${randr.major_version}.${randr.minor_version}`);
  // consoleDebug({ randr });

  printStdout('randr initialized');

  // create a virtual window
  X.CreateWindow(
    winId,
    root, // new window id, parent
    0, 0, 1, 1, // x, y, w, h
    0, 0, 0, 0, // border, depth, class, visual
    { eventMask: 0 } // we don't want any event from the window
  );

  printStdout('virtual window created');

  // to hide this virtual window, just don't map to window:
  // X.MapWindow(winId);

  const maskValue = randr.NotifyMask[notifyMask] || randr.NotifyMask.All;

  // enable randr events:
  randr.SelectInput(winId, maskValue);

  printStdout(`randr event selected, mask: ${notifyMask}, mask value: 0x${maskValue.toString(16)}`);

  let emitting;
  let events = [];

  // event handlers:
  X.on('event', event => {
    printStdout(`received event: ${event.name || `[type:${event.type}]`}`);
    consoleDebug({ event });

    events.push(event);

    clearTimeout(emitting);
    emitting = setTimeout(() => {
      const eventPayload = JSON.stringify(events);

      consoleDebug({ events, eventPayload });
      events = [];

      printStdout(`spawning: ${handlerScript}`);
      const handler = spawn(handlerScript, [eventPayload]);
      handler.stdout.pipe(process.stdout);
      handler.stderr.pipe(process.stderr);
    }, DELAYED_TIMEOUT);
  });
  X.on('error', error => {
    consoleDebug({ error });
    printStderr(error.toString());
  });

  printStdout('xrandr-watcher started');
}

if (process.env.DISPLAY && process.env.XAUTHORITY) {
  startXrandrWatcher()
} else {
  printAndDie('Environment variables DISPLAY or XAUTHORITY are required')
}
