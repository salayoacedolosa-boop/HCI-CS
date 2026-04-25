Add-Type -AssemblyName System.Drawing
$sourcePath = "EMERGENCY\images\emergency response.png"
$baseDest = "android\app\src\main\res"
$mipmapSizes = @{
    "mipmap-mdpi"    = 48
    "mipmap-hdpi"    = 72
    "mipmap-xhdpi"   = 96
    "mipmap-xxhdpi"  = 144
    "mipmap-xxxhdpi" = 192
}

try {
    if (-not (Test-Path $sourcePath)) {
        throw "Source image not found at $sourcePath"
    }
    $sourceImg = [System.Drawing.Image]::FromFile((Resolve-Path $sourcePath).Path)
    $minDim = [Math]::Min($sourceImg.Width, $sourceImg.Height)
    $cropX = [Math]::Max(0, [int](($sourceImg.Width - $minDim) / 2))
    $cropY = [Math]::Max(0, [int](($sourceImg.Height - $minDim) / 2))

    foreach ($folder in $mipmapSizes.Keys) {
        $size = $mipmapSizes[$folder]
        $destFolder = Join-Path $baseDest $folder
        if (-not (Test-Path $destFolder)) {
            New-Item -ItemType Directory -Path $destFolder -Force | Out-Null
        }
        $bmp = New-Object System.Drawing.Bitmap $size, $size
        $graphics = [System.Drawing.Graphics]::FromImage($bmp)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

        $destRect = New-Object System.Drawing.Rectangle 0, 0, $size, $size
        $srcRect = New-Object System.Drawing.Rectangle $cropX, $cropY, $minDim, $minDim
        $graphics.DrawImage($sourceImg, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

        $filenames = @("ic_launcher.png", "ic_launcher_round.png", "ic_launcher_foreground.png")
        foreach ($name in $filenames) {
            $destFilePath = Join-Path $destFolder $name
            $bmp.Save($destFilePath, [System.Drawing.Imaging.ImageFormat]::Png)
            Write-Host "Written: $destFilePath"
        }
        $graphics.Dispose(); $bmp.Dispose()
    }
    $sourceImg.Dispose()
    Write-Host "Icon generation completed successfully."
} catch {
    Write-Error "Error: $_"
}
