param(
    [Parameter(Mandatory)][string]$Scratch,
    [string]$EdgeTts = 'edge-tts',
    [string]$Source = (Join-Path $PSScriptRoot '../web/requests.js'),
    [string]$Destination = (Join-Path $PSScriptRoot '../web/assets'),
    [string[]]$Stages
)
$ErrorActionPreference='Stop'
$voice='zh-CN-XiaoxiaoNeural'
$rate='-6%'
New-Item -ItemType Directory -Force -Path $Scratch,$Destination | Out-Null
$clips=@()
$expected=0
foreach($line in (Get-Content -LiteralPath $Source -Encoding UTF8)){
    if($line -notmatch "^\s*(\w+):.*?line:'([^']+)'"){continue}
    $id,$words=$matches[1],$matches[2]
    if($Stages -and $id -notin $Stages){continue}
    $expected++
    $mp3=Join-Path $Scratch ($id+'.mp3')
    $subs=Join-Path $Scratch ($id+'.srt')
    $ogg=Join-Path $Scratch ('request-'+$id+'.ogg')
    $ok=$false
    for($attempt=1;$attempt -le 3;$attempt++){
        & $EdgeTts --voice $voice "--rate=$rate" --text $words --write-media $mp3 --write-subtitles $subs
        if($LASTEXITCODE -eq 0 -and (Get-Item -LiteralPath $mp3).Length -gt 1000){$ok=$true;break}
        if($attempt -lt 3){Start-Sleep -Seconds 2}
    }
    if(-not $ok){throw "Edge TTS generation failed for $id"}
    & ffmpeg -loglevel error -y -i $mp3 -af 'highpass=f=45,loudnorm=I=-19:TP=-2:LRA=9,apad=pad_dur=0.06' -ar 24000 -ac 1 -c:a libvorbis -q:a 5 $ogg
    if($LASTEXITCODE -ne 0){throw "Conversion failed for $id"}
    $seconds=[double]::Parse((& ffprobe -v error -show_entries 'format=duration' -of 'default=nw=1:nk=1' $ogg),[Globalization.CultureInfo]::InvariantCulture)
    if($seconds -lt 1 -or $seconds -gt 12){throw "Unexpected duration for $id"}
    $clips+= [PSCustomObject]@{stage=$id;line=$words;voice=$voice;rate=$rate;seconds=$seconds;sha256=(Get-FileHash -LiteralPath $ogg).Hash.ToLowerInvariant()}
    Write-Output ("Rendered {0}, {1:N2}s" -f $id,$seconds)
}
if(-not $expected -or $clips.Count -ne $expected -or ($Stages -and $expected -ne $Stages.Count)){throw 'Expected one clip per requested stage'}
foreach($clip in $clips){
    $name='request-'+$clip.stage+'.ogg'
    Copy-Item -LiteralPath (Join-Path $Scratch $name) -Destination (Join-Path $Destination $name) -Force
}
$clips | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $Scratch 'edge-voices.json') -Encoding utf8
