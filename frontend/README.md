# Gurl

On Linux Icon does not show up to do that

create a `.desktop` file under ~/.local/share/applications/gURL.desktop`

```ini
    [Desktop Entry]
    Name=gURL
    Exec=/full/path/to/gurl
    Icon=/full/path/to/appicon.png
    Type=Application
    Categories=Web
    StartupWMClass=gURL
```

Edit permissions to allow executing file and mark application as trusted.

run following to update database.

```sh
update-desktop-database ~/.local/share/applications
```
