$projectPath = "D:\my project\First project\whatsapp ai agent"
$profilePath = Join-Path $projectPath "chrome_profile"

if (-Not (Test-Path $profilePath)) {
    New-Item -ItemType Directory -Path $profilePath
        Write-Host "chrome_profile folder created at $profilePath"
        } else {
            Write-Host "chrome_profile folder already exists at $profilePath"
            }

            $openaiKey = "YOUR_OPENAI_API_KEY_HERE"
            setx OPENAI_API_KEY $openaiKey
            Write-Host "OpenAI API key set as environment variable. Close and reopen PowerShell to use it."
            
