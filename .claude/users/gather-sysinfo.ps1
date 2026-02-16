$u = $env:USERNAME
$m = $env:COMPUTERNAME
$os = (Get-CimInstance Win32_OperatingSystem).Caption + ' ' + (Get-CimInstance Win32_OperatingSystem).Version
$cpu = (Get-CimInstance Win32_Processor).Name
$ram = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 1)
$gpus = (Get-CimInstance Win32_VideoController | ForEach-Object { $_.Name }) -join ', '
$projectPath = (Get-Location).Path

try {
    $d = Get-PSDrive C -ErrorAction Stop
    $disk = '{0:N0} GB free / {1:N0} GB total' -f ($d.Free/1GB), (($d.Used+$d.Free)/1GB)
} catch {
    $disk = 'N/A'
}

Write-Output "USERNAME=$u"
Write-Output "MACHINE=$m"
Write-Output "OS=$os"
Write-Output "CPU=$cpu"
Write-Output "RAM=${ram} GB"
Write-Output "GPU=$gpus"
Write-Output "DISK=$disk"
Write-Output "PROJECT_PATH=$projectPath"
