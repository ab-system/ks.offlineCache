<#
    Устанавливает пакет из репозитория http://tfs2013:8080/tfs/DefaultCollection/_git/ABProject.

    $dir         - каталог, куда будет установлен пакет
    $packageName - имя пакета - ветка из репозитория
#>

param(
    [Parameter(Mandatory=$true)]
	[string]$packageName,

    [Parameter(Mandatory=$true)]
    [string]$dir
)

$gitRepo = "http://tfs2013:8080/tfs/DefaultCollection/_git/ABProject"
$destination = $dir + "/" + $packageName
If (Test-Path $destination){
    Remove-Item $destination -Force -Recurse
}

git clone $gitRepo $destination -b $packageName