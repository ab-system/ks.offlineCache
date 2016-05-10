SET dir=bower_components
powershell.exe -f abProject.ps1 -dir %dir% -packageName connectionStatus
powershell.exe -f abProject.ps1 -dir %dir% -packageName localStorageCache
powershell.exe -f abProject.ps1 -dir %dir% -packageName indexedDbCache