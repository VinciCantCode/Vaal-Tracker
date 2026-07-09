# Vaal Vault - 瓦尔宝库

Vaal Vault (瓦尔宝库) is a desktop application that helps you calculate how valuable your character, inventory and stash tabs are. The data is broken down and summarized over time, to see how much you earn on an hourly basis. To add to this, you can also group up with friends directly within the app to see your combined net worth.

The app is based on the open-source Exilence CE project and refactored to support Path of Exile 2.

## Contents

- [Download](#download)
- [Changelog](https://github.com/VinciCantCode/vaal-vault/blob/main/CHANGELOG.md)
- [Platform](#platform)
- [Contributing with development](#contributing-with-development)
- [Contact us](#contact-us)
- [Acknowledgements](#acknowledgements)
- [License](#license)

## Download

Download the latest release at https://github.com/VinciCantCode/vaal-vault/releases/latest

## Platform

Currently runs with:

- Electron 15.1.0
- React 17.0.1
- mobx 6.0.1
- **node 16.x**
- **npm 7.x**

## Contributing with development

Before submitting a PR, please see our [contributing guidelines](https://github.com/VinciCantCode/vaal-vault/blob/main/CONTRIBUTING.md).

---
**Prerequisite for building LINUX**

You will need to manually set protocol handling. Follow steps below:

1. Create `~/.local/share/applications/VaalVault.desktop` with:

```bash
[Desktop Entry]
Name=Vaal Vault
Exec=<ABSOLUTE PATH TO VaalVault>/VaalVaultApp/dist/<Vaal-Vault-X.Y.Z.AppImage> %u
Icon=<ABSOLUTE PATH TO VaalVault>/VaalVaultApp/public/icon.ico
Terminal=false
Type=Application
MimeType=x-scheme-handler/vaalvault;
```

2. Run:
- `update-mime-database ~/.local/share/mime`
- `update-desktop-database ~/.local/share/applications`
---

Run the following to get started with the client:
```
npm install
npm run smoke-build-linux (build for linux)
npm run smoke-build-mac (build for macOS)
npm run smoke-build-win (build for windows)
```
These create the AppImage the .desktop file points to.

NOTE: Running a build using node versions newer than v14 seem to fail on MacOS and Linux. For development on these platforms, it's recommended to use v14.16.1 (Latest LTS).

Other build options:
```
npm start (to serve the project)
npm run build (optional, to build the installer for production) 
---
npm run release (optional, to build the installer for production and release)
```

## Contact us

Communicate with us at our Discord https://discord.gg/2T3WXBgjaM

Report bugs at https://github.com/VinciCantCode/vaal-vault/issues

## Acknowledgements

- https://poe.ninja for providing a great API, which lets us calculate net worth of players

## License

This work is licensed under the Creative Commons Attribution-NonCommercial 3.0 Unported License. To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/3.0/ or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.
