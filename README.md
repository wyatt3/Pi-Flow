# Pi Flow - A DIY Wifi-Controlled Sprinkler Timer

Pi Flow is a simple, low-cost, wifi-enabled sprinkler controller.

It allows for manual and automatic, schedule-based valve control, with the goal of adding weather monitoring and seasonal schedules in the future.

Depending on what related hardware you already have (sprinkler valves, valve power supply, wire to connect from valves to controller), this project can be had for around $25 or less.

## Software

- Node.js and Express (back-end)
- Vue 3 and Vite (front-end)

## Hardware

* A minimum of a Raspberry Pi Zero W (with a few small caveats during setup). [AdaFruit](https://www.adafruit.com/product/3400) has them for a pretty reasonable price ($15 as of November 2025).
    * A Micro SD Card (8 GB is plenty).
    * Micro USB Cable and 5V Power Adapter.
* Any Relay Board(s) (one with optocoupling if you're using a 3.3v based Pi), the number of relays you want is only limited by the number of GPIO pins on your main board. You can find these on [AliExpress](https://aliexpress.com) or [DigiKey](https://digikey.com) for a few dollars.
* Jumper Wires (to connect the Pi and Relay Board). Again, you can find these on [AliExpress](https://aliexpress.com) or [DigiKey](https://digikey.com) for a few dollars.

# Installation and Setup (for regular use)

You may notice this repo contains a `docker-compose.yml` file. Currently, docker is only used for the development side of this project, and not the production side, due to certain limitations of the Raspberry Pi Zero W.
I'll cover the development setup in [its own section](#installation-and-setup-for-development) below.

## Getting Started

I won't cover how to flash an OS to a Raspberry Pi, or how to install Node.js and npm, because there's plenty of guides on how to do that already, but to run Pi Flow, you'll need some OS that you're comfortable with (I'm using Raspbian Lite) configured to have internet access, and have `git`, `node`, and `npm` installed.  
If you're using a Raspberry Pi Zero, it's a good idea to also configure SSH access and do the rest of the setup remotely from another computer (I'll talk about why this is important later).

## Clone the Repo

```
git clone https://github.com/wyatt3/pi-flow.git pi-flow
```

## Install NPM Dependencies
If you are using a Raspberry Pi Zero W, skip to the [Raspberry Pi Zero W Specific Installation Instructions](#raspberry-pi-zero-w-specific-installation-instructions) section
```
cd pi-flow
npm install
```

## Build the Front-End

```
npm run build
```

## Start the Back-End

```
npm start
```
Your Pi Flow app should now be available in your browser at `http://{pi-ip-address}`

# Getting Pi Flow to start on boot

If you want Pi Flow to start automatically every time your Pi boots up, you can create a service file and use `systemd` to achieve this.

Create a `piflow.service` file:

```
sudo nano /etc/systemd/system/piflow.service
```

Put the following into the service file:

```
[Unit]
Description=Pi Flow Service
After=network.target

[Service]
ExecStart=/usr/bin/npm start
WorkingDirectory=/path/to/pi-flow
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Reload systemd so it finds your service:

```
systemctl daemon-reload
```

Enable the new service so it starts on every boot:

```
systemctl enable piflow.service
```

Finally, start the service:

```
systemctl start piflow.service
```

You can check the status of your new service with:

```
systemctl status piflow.service
```

# Raspberry Pi Zero W Specific Installation Instructions

## Install NPM Dependencies
```
cd pi-flow
npm install --omit=dev
```
The `--omit=dev` flag is necessary here when installing on a Raspberry Pi Zero W, because of the dated ARMv6 architecture of the SOC. The Rapsberry Pi Zero W cannot run vite, which we use for the front end asset bundling. I'll cover 
# Installation and Setup (for development)
